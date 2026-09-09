package com.nexora.honeychain.blockchain;

import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.enums.BlockchainStatus;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

@Service
public class BlockchainService {

    private static final Logger log = LoggerFactory.getLogger(BlockchainService.class);

    private final TraceabilityEventRepository traceabilityEventRepository;
    private final TraceabilityHashService hashService;
    private final BlockchainProperties properties;

    public BlockchainService(TraceabilityEventRepository traceabilityEventRepository,
                             TraceabilityHashService hashService,
                             BlockchainProperties properties) {
        this.traceabilityEventRepository = traceabilityEventRepository;
        this.hashService = hashService;
        this.properties = properties;
    }

    /**
     * Anchors an existing traceability event to the EVM blockchain ledger.
     * Computes deterministic SHA-256 canonical event hash first.
     */
    @Transactional
    public TraceabilityEvent anchorEvent(String eventId) {
        TraceabilityEvent event = traceabilityEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Traceability event not found: " + eventId));

        // 1. Calculate deterministic canonical SHA-256 hash
        String batchId = event.getBatch() != null ? event.getBatch().getBatchId() : "";
        String packageId = event.getPackageEntity() != null ? event.getPackageEntity().getPackageId() : "";
        String metadata = event.getBlockchainReference() != null ? event.getBlockchainReference() : "";
        String dataHash = hashService.calculateCanonicalHash(batchId, packageId, event.getEventType(), metadata, event.getTimestamp());

        event.setBlockchainDataHash(dataHash);

        // 2. Check if blockchain environment is configured
        if (!properties.isConfigured()) {
            log.info("Blockchain RPC is not configured. Marking event {} as OFF_CHAIN_VERIFIED / NOT_CONFIGURED.", eventId);
            event.setBlockchainStatus(BlockchainStatus.NOT_CONFIGURED);
            event.setBlockchainNetwork(properties.getNetworkName());
            event.setBlockchainTransactionHash(null); // Strictly NO fake transaction hash!
            return traceabilityEventRepository.save(event);
        }

        // 3. Attempt live EVM smart contract transaction anchoring
        try {
            event.setBlockchainStatus(BlockchainStatus.PENDING);
            traceabilityEventRepository.saveAndFlush(event);

            Web3j web3j = Web3j.build(new HttpService(properties.getRpcUrl()));
            Credentials credentials = Credentials.create(properties.getPrivateKey());

            // Prepare function call: recordTraceabilityEvent(string, string, string, bytes32)
            byte[] bytes32Hash = hexStringToBytes32(dataHash);
            Function function = new Function(
                    "recordTraceabilityEvent",
                    Arrays.asList(
                            new Utf8String(batchId),
                            new Utf8String(packageId),
                            new Utf8String(event.getEventType().name()),
                            new Bytes32(bytes32Hash)
                    ),
                    Collections.singletonList(new TypeReference<Bytes32>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);

            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
            BigInteger nonce = ethGetTransactionCount.getTransactionCount();

            // Gas parameters suitable for local/EVM dev node
            BigInteger gasPrice = BigInteger.valueOf(20_000_000_000L); // 20 Gwei
            BigInteger gasLimit = BigInteger.valueOf(300_000L);

            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    gasPrice,
                    gasLimit,
                    properties.getContractAddress(),
                    encodedFunction
            );

            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, properties.getChainId(), credentials);
            String hexValue = Numeric.toHexString(signedMessage);

            EthSendTransaction response = web3j.ethSendRawTransaction(hexValue).send();
            if (response.hasError()) {
                log.error("Blockchain transaction RPC error: {}", response.getError().getMessage());
                event.setBlockchainStatus(BlockchainStatus.FAILED);
                return traceabilityEventRepository.save(event);
            }

            String transactionHash = response.getTransactionHash();
            log.info("Successfully submitted blockchain transaction: {}", transactionHash);

            event.setBlockchainTransactionHash(transactionHash);
            event.setBlockchainStatus(BlockchainStatus.BLOCKCHAIN_ANCHORED);
            event.setBlockchainNetwork(properties.getNetworkName());
            event.setBlockchainTimestamp(Instant.now());
            return traceabilityEventRepository.save(event);

        } catch (Exception e) {
            log.warn("Failed to anchor transaction to EVM node at {}: {}. Updating status to FAILED/NOT_CONFIGURED.", properties.getRpcUrl(), e.getMessage());
            event.setBlockchainStatus(BlockchainStatus.FAILED);
            event.setBlockchainNetwork(properties.getNetworkName());
            return traceabilityEventRepository.save(event);
        }
    }

    /**
     * Helper to convert SHA-256 hex string to 32-byte array for Solidity bytes32.
     */
    private byte[] hexStringToBytes32(String hex) {
        String cleanHex = hex.startsWith("0x") ? hex.substring(2) : hex;
        byte[] bytes = new byte[32];
        byte[] rawBytes = Numeric.hexStringToByteArray(cleanHex);
        System.arraycopy(rawBytes, 0, bytes, 0, Math.min(rawBytes.length, 32));
        return bytes;
    }
}

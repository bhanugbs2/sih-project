package com.nexora.honeychain.blockchain;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "honeychain.blockchain")
public class BlockchainProperties {

    private boolean enabled = false;
    private String rpcUrl = "";
    private String privateKey = "";
    private String contractAddress = "";
    private long chainId = 31337;
    private String networkName = "Localhost EVM";

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getRpcUrl() { return rpcUrl; }
    public void setRpcUrl(String rpcUrl) { this.rpcUrl = rpcUrl; }

    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }

    public String getContractAddress() { return contractAddress; }
    public void setContractAddress(String contractAddress) { this.contractAddress = contractAddress; }

    public long getChainId() { return chainId; }
    public void setChainId(long chainId) { this.chainId = chainId; }

    public String getNetworkName() { return networkName; }
    public void setNetworkName(String networkName) { this.networkName = networkName; }

    public boolean isConfigured() {
        return enabled && rpcUrl != null && !rpcUrl.trim().isEmpty() && contractAddress != null && !contractAddress.trim().isEmpty();
    }
}

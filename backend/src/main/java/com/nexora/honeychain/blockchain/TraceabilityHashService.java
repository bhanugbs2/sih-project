package com.nexora.honeychain.blockchain;

import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.Package;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@Service
public class TraceabilityHashService {

    /**
     * Computes a deterministic SHA-256 cryptographic hash of canonical event data.
     * Canonical String Format:
     * batchId|packageId|eventType|metadata|timestampIso
     */
    public String calculateCanonicalHash(String batchId, String packageId, TraceabilityEventType eventType, String metadata, Instant timestamp) {
        String safeBatchId = batchId != null ? batchId.trim() : "";
        String safePackageId = packageId != null ? packageId.trim() : "";
        String safeEventType = eventType != null ? eventType.name() : "";
        String safeMetadata = metadata != null ? metadata.trim() : "";
        String safeTimestamp = timestamp != null ? timestamp.toString() : "";

        String canonicalString = String.format("%s|%s|%s|%s|%s",
                safeBatchId,
                safePackageId,
                safeEventType,
                safeMetadata,
                safeTimestamp
        );

        return sha256Hex(canonicalString);
    }

    public String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}

package com.nexora.honeychain.controller;

import com.nexora.honeychain.ai.HiveAnomalyDetector;
import com.nexora.honeychain.ai.HoneyQualityEvaluator;
import com.nexora.honeychain.dto.AIAlertResponse;
import com.nexora.honeychain.dto.ai.QualityEvaluationRequest;
import com.nexora.honeychain.dto.ai.QualityEvaluationResponse;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisRequest;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisResponse;
import com.nexora.honeychain.service.AIAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Intelligence API", description = "Endpoints for Honey Quality Purity Scoring, Swarm Anomaly Detection, and System AI Alerts")
public class AIController {

    private final HoneyQualityEvaluator qualityEvaluator;
    private final HiveAnomalyDetector anomalyDetector;
    private final AIAlertService aiAlertService;

    public AIController(HoneyQualityEvaluator qualityEvaluator, HiveAnomalyDetector anomalyDetector, AIAlertService aiAlertService) {
        this.qualityEvaluator = qualityEvaluator;
        this.anomalyDetector = anomalyDetector;
        this.aiAlertService = aiAlertService;
    }

    @PostMapping("/evaluate-quality")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Evaluate honey quality", description = "Evaluates moisture %, pH, and color parameters to output purity score and adulteration classification as scientific decision support.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quality evaluated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid quality parameter input")
    })
    public ResponseEntity<QualityEvaluationResponse> evaluateQuality(@Valid @RequestBody QualityEvaluationRequest request) {
        QualityEvaluationResponse response = qualityEvaluator.evaluateHoneyQuality(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze-telemetry")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Analyze hive telemetry", description = "Analyzes temperature variance, humidity shifts, and acoustic frequency to calculate swarm risk score and generate recommendations.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Telemetry analyzed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid telemetry parameter input")
    })
    public ResponseEntity<TelemetryAnalysisResponse> analyzeTelemetry(@Valid @RequestBody TelemetryAnalysisRequest request) {
        TelemetryAnalysisResponse response = anomalyDetector.analyzeTelemetry(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get all system AI alerts", description = "Returns all system-wide AI generated anomaly alerts ordered newest first.")
    @ApiResponse(responseCode = "200", description = "Alerts retrieved successfully")
    public ResponseEntity<List<AIAlertResponse>> getAllAlerts() {
        return ResponseEntity.ok(aiAlertService.getAllSystemAlerts());
    }

    @GetMapping("/alerts/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get unread AI alerts", description = "Returns all unread AI anomaly alerts ordered newest first.")
    @ApiResponse(responseCode = "200", description = "Unread alerts retrieved successfully")
    public ResponseEntity<List<AIAlertResponse>> getUnreadAlerts() {
        return ResponseEntity.ok(aiAlertService.getUnreadAlerts());
    }

    @GetMapping("/alerts/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Get unread alert count", description = "Returns current count of unread AI alerts.")
    @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully")
    public ResponseEntity<java.util.Map<String, Long>> getUnreadCount() {
        long count = aiAlertService.getUnreadCount();
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }

    @PatchMapping("/alerts/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Mark alert as read", description = "Marks a specific AI alert as read.")
    @ApiResponse(responseCode = "200", description = "Alert marked read successfully")
    public ResponseEntity<AIAlertResponse> markAlertRead(@PathVariable("id") String id) {
        return ResponseEntity.ok(aiAlertService.markAsRead(id));
    }

    @PatchMapping("/alerts/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR')")
    @Operation(summary = "Acknowledge alert", description = "Marks a specific AI alert as acknowledged.")
    @ApiResponse(responseCode = "200", description = "Alert acknowledged successfully")
    public ResponseEntity<AIAlertResponse> acknowledgeAlert(
            @PathVariable("id") String id,
            java.security.Principal principal
    ) {
        String username = principal != null ? principal.getName() : "Authenticated User";
        return ResponseEntity.ok(aiAlertService.acknowledgeAlert(id, username));
    }
}

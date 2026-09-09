package com.nexora.honeychain.service;

import com.nexora.honeychain.ai.HoneyQualityEvaluator;
import com.nexora.honeychain.dto.CreateQualityTestRequest;
import com.nexora.honeychain.dto.QualityTestResponse;
import com.nexora.honeychain.dto.ai.QualityEvaluationRequest;
import com.nexora.honeychain.dto.ai.QualityEvaluationResponse;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.mapper.DtoMapper;
import com.nexora.honeychain.model.HoneyBatch;
import com.nexora.honeychain.model.QualityTest;
import com.nexora.honeychain.model.TraceabilityEvent;
import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.HoneyBatchStatus;
import com.nexora.honeychain.model.enums.QualityTestResult;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import com.nexora.honeychain.repository.HoneyBatchRepository;
import com.nexora.honeychain.repository.QualityTestRepository;
import com.nexora.honeychain.repository.TraceabilityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QualityTestService {

    private final QualityTestRepository qualityTestRepository;
    private final HoneyBatchRepository honeyBatchRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;
    private final HoneyQualityEvaluator qualityEvaluator;

    public QualityTestService(QualityTestRepository qualityTestRepository,
                              HoneyBatchRepository honeyBatchRepository,
                              TraceabilityEventRepository traceabilityEventRepository,
                              HoneyQualityEvaluator qualityEvaluator) {
        this.qualityTestRepository = qualityTestRepository;
        this.honeyBatchRepository = honeyBatchRepository;
        this.traceabilityEventRepository = traceabilityEventRepository;
        this.qualityEvaluator = qualityEvaluator;
    }

    @Transactional
    public QualityTestResponse addQualityTest(String batchId, CreateQualityTestRequest request) {
        if (request.getMoisture() != null && request.getMoisture() < 0) {
            throw new IllegalArgumentException("Moisture percentage cannot be negative");
        }
        if (request.getPH() != null && request.getPH() < 0) {
            throw new IllegalArgumentException("pH level cannot be negative");
        }

        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        QualityTest test = DtoMapper.toQualityTestEntity(request, batch);
        QualityTest savedTest = qualityTestRepository.save(test);

        // Run Phase 6 AI Quality Screening Engine
        QualityEvaluationRequest aiReq = new QualityEvaluationRequest(batch.getBatchId(), request.getMoisture(), request.getPH(), request.getColor());
        QualityEvaluationResponse aiEval = qualityEvaluator.evaluateHoneyQuality(aiReq);

        // Update batch status based on quality result gate
        if (savedTest.getResult() == QualityTestResult.PASS) {
            batch.setStatus(HoneyBatchStatus.QUALITY_TESTED);
        } else if (savedTest.getResult() == QualityTestResult.REQUIRES_REVIEW) {
            batch.setStatus(HoneyBatchStatus.REQUIRES_REVIEW);
        } else if (savedTest.getResult() == QualityTestResult.FAIL) {
            batch.setStatus(HoneyBatchStatus.REQUIRES_REVIEW);
        }
        honeyBatchRepository.save(batch);

        // Record QUALITY_TESTED Traceability Event
        TraceabilityEvent qualityEvent = new TraceabilityEvent(
                batch,
                null,
                TraceabilityEventType.QUALITY_TESTED,
                "HASH-QUALITY-" + savedTest.getResult() + "-" + savedTest.getId(),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(qualityEvent);

        // Record AI_SCREENED Traceability Event
        TraceabilityEvent aiEvent = new TraceabilityEvent(
                batch,
                null,
                TraceabilityEventType.AI_SCREENED,
                "HASH-AI-SCREENING-" + aiEval.getAdulterationClass() + "-" + Math.round(aiEval.getPurityScore()),
                Instant.now(),
                "PENDING",
                BlockchainEnvironment.DEVELOPMENT
        );
        traceabilityEventRepository.save(aiEvent);

        QualityTestResponse response = DtoMapper.toQualityTestResponse(savedTest);
        response.setAiScreeningClass(aiEval.getAdulterationClass());
        response.setAiPurityScore(aiEval.getPurityScore());
        response.setAiRecommendation(aiEval.getRecommendation());
        return response;
    }

    @Transactional(readOnly = true)
    public List<QualityTestResponse> getQualityTestsByBatchId(String batchId) {
        HoneyBatch batch = honeyBatchRepository.findByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found: " + batchId));

        return qualityTestRepository.findByBatchBatchId(batch.getBatchId()).stream()
                .map(test -> {
                    QualityTestResponse res = DtoMapper.toQualityTestResponse(test);
                    QualityEvaluationRequest aiReq = new QualityEvaluationRequest(batch.getBatchId(), test.getMoisture(), test.getPH(), test.getColor());
                    QualityEvaluationResponse aiEval = qualityEvaluator.evaluateHoneyQuality(aiReq);
                    res.setAiScreeningClass(aiEval.getAdulterationClass());
                    res.setAiPurityScore(aiEval.getPurityScore());
                    res.setAiRecommendation(aiEval.getRecommendation());
                    return res;
                })
                .collect(Collectors.toList());
    }
}

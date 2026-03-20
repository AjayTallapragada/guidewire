package com.devtrails.backend.client;

import com.devtrails.backend.dto.FraudRequest;
import com.devtrails.backend.dto.FraudResponse;
import com.devtrails.backend.dto.PremiumRequest;
import com.devtrails.backend.dto.PremiumResponse;
import com.devtrails.backend.dto.RiskRequest;
import com.devtrails.backend.dto.RiskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.base-url}")
    private String baseUrl;

    public RiskResponse predictRisk(RiskRequest request) {
        try {
            return restTemplate.postForObject(baseUrl + "/predict-risk", request, RiskResponse.class);
        } catch (RestClientException ex) {
            RiskResponse fallback = new RiskResponse();
            double score = Math.min(1.0,
                request.getRainProbability() * 0.35
                    + Math.min(request.getAqi() / 500.0, 1.0) * 0.3
                    + request.getAreaRisk() * 0.2
                    + request.getDisruptionFrequency() * 0.15);
            fallback.setRiskScore(score);
            fallback.setRationale("Fallback backend scoring used because AI service is unavailable.");
            return fallback;
        }
    }

    public PremiumResponse calculatePremium(PremiumRequest request) {
        try {
            return restTemplate.postForObject(baseUrl + "/calculate-premium", request, PremiumResponse.class);
        } catch (RestClientException ex) {
            PremiumResponse fallback = new PremiumResponse();
            double earningsFactor = Math.min(request.getAverageDailyEarnings() / 1500.0, 1.0) * 20;
            double premium = Math.max(10, Math.min(100, 10 + (request.getRiskScore() * 50) + earningsFactor));
            fallback.setPremium(premium);
            fallback.setRationale("Fallback premium formula used because AI service is unavailable.");
            return fallback;
        }
    }

    public FraudResponse detectFraud(FraudRequest request) {
        try {
            return restTemplate.postForObject(baseUrl + "/detect-fraud", request, FraudResponse.class);
        } catch (RestClientException ex) {
            FraudResponse fallback = new FraudResponse();
            double score = Math.min(1.0, (request.getDuplicateClaims() * 0.4) + (request.getClaimsInLastWeek() * 0.12));
            fallback.setFraudScore(score);
            fallback.setFlagged(score >= 0.65);
            fallback.setReason("Fallback fraud check used because AI service is unavailable.");
            return fallback;
        }
    }
}

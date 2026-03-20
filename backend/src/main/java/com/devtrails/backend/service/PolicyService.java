package com.devtrails.backend.service;

import com.devtrails.backend.client.AiServiceClient;
import com.devtrails.backend.dto.PolicyQuoteResponse;
import com.devtrails.backend.dto.PolicyResponse;
import com.devtrails.backend.dto.PremiumRequest;
import com.devtrails.backend.dto.PremiumResponse;
import com.devtrails.backend.dto.RiskRequest;
import com.devtrails.backend.dto.RiskResponse;
import com.devtrails.backend.entity.AppUser;
import com.devtrails.backend.entity.Policy;
import com.devtrails.backend.entity.RiskData;
import com.devtrails.backend.repository.PolicyRepository;
import com.devtrails.backend.repository.RiskDataRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final RiskDataRepository riskDataRepository;
    private final AuthService authService;
    private final AiServiceClient aiServiceClient;

    public PolicyQuoteResponse quote(Long userId) {
        AppUser user = authService.getUser(userId);
        RiskData riskData = getRiskData(user.getCity(), user.getZone());

        RiskResponse riskResponse = aiServiceClient.predictRisk(RiskRequest.builder()
            .rainProbability(riskData.getRainProbability())
            .aqi(riskData.getAqi())
            .areaRisk(riskData.getAreaRisk())
            .disruptionFrequency(riskData.getDisruptionFrequency())
            .build());

        PremiumResponse premiumResponse = aiServiceClient.calculatePremium(PremiumRequest.builder()
            .riskScore(riskResponse.getRiskScore())
            .averageDailyEarnings(user.getAverageDailyEarnings().doubleValue())
            .build());

        BigDecimal coverageAmount = user.getAverageDailyEarnings().multiply(BigDecimal.valueOf(6));

        return PolicyQuoteResponse.builder()
            .riskScore(riskResponse.getRiskScore())
            .weeklyPremium(BigDecimal.valueOf(premiumResponse.getPremium()).setScale(2, RoundingMode.HALF_UP))
            .weeklyCoverageAmount(coverageAmount.setScale(2, RoundingMode.HALF_UP))
            .rationale(premiumResponse.getRationale() + " " + riskResponse.getRationale())
            .build();
    }

    public PolicyResponse activate(Long userId) {
        AppUser user = authService.getUser(userId);
        PolicyQuoteResponse quote = quote(userId);

        policyRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId).ifPresent(existing -> {
            existing.setActive(false);
            policyRepository.save(existing);
        });

        Policy policy = new Policy();
        policy.setUser(user);
        policy.setPlanName("Weekly Income Shield");
        policy.setWeeklyPremium(quote.getWeeklyPremium());
        policy.setWeeklyCoverageAmount(quote.getWeeklyCoverageAmount());
        policy.setRiskScore(quote.getRiskScore());
        policy.setActive(true);
        policy.setDeliveryType(user.getDeliveryType());
        policy.setActiveFrom(LocalDate.now());
        policy.setActiveUntil(LocalDate.now().plusDays(7));

        return toResponse(policyRepository.save(policy));
    }

    public PolicyResponse getActivePolicy(Long userId) {
        return policyRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
            .map(this::toResponse)
            .orElse(null);
    }

    public List<PolicyResponse> getPolicies(Long userId) {
        return policyRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public List<Policy> getActivePolicies() {
        return policyRepository.findByActiveTrue();
    }

    private RiskData getRiskData(String city, String zone) {
        return riskDataRepository.findByCityAndZone(city, zone)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Risk data not found for city and zone"));
    }

    public PolicyResponse toResponse(Policy policy) {
        return PolicyResponse.builder()
            .id(policy.getId())
            .planName(policy.getPlanName())
            .weeklyPremium(policy.getWeeklyPremium())
            .weeklyCoverageAmount(policy.getWeeklyCoverageAmount())
            .riskScore(policy.getRiskScore())
            .active(policy.isActive())
            .activeFrom(policy.getActiveFrom())
            .activeUntil(policy.getActiveUntil())
            .build();
    }
}

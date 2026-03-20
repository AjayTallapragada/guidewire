package com.devtrails.backend.service;

import com.devtrails.backend.dto.RiskDataRequest;
import com.devtrails.backend.entity.RiskData;
import com.devtrails.backend.repository.RiskDataRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiskDataService {

    private final RiskDataRepository riskDataRepository;

    public RiskData upsert(RiskDataRequest request) {
        RiskData riskData = riskDataRepository.findByCityAndZone(request.getCity(), request.getZone())
            .orElseGet(RiskData::new);
        riskData.setCity(request.getCity());
        riskData.setZone(request.getZone());
        riskData.setRainProbability(request.getRainProbability());
        riskData.setRainfallMm(request.getRainfallMm());
        riskData.setAqi(request.getAqi());
        riskData.setAreaRisk(request.getAreaRisk());
        riskData.setDisruptionFrequency(request.getDisruptionFrequency());
        riskData.setCurfewActive(request.isCurfewActive());
        riskData.setPlatformDowntime(request.isPlatformDowntime());
        return riskDataRepository.save(riskData);
    }

    public List<RiskData> findAll() {
        return riskDataRepository.findAll();
    }
}

package com.co2digitaltwin.backend.data;

import com.co2digitaltwin.backend.dto.*;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class StaticDataProvider {

    public KpiResponse getKpiData() {
        return KpiResponse.builder()
                .totalEmissions(KpiMetric.builder().value(842).unit("kg/day").trend(3.2).label("Total CO₂ Emissions").build())
                .averageCo2(KpiMetric.builder().value(526).unit("kg/day").trend(-1.5).label("Average CO₂").build())
                .activeHotspots(KpiMetric.builder().value(12).unit("areas").trend(2).label("Active Hotspots").build())
                .capturePotential(KpiMetric.builder().value(27).unit("%").trend(5.1).label("Capture Potential").build())
                .build();
    }

    public List<EmissionTrend> getEmissionTrends() {
        return List.of(
                EmissionTrend.builder().month("Jan").emissions(720).captured(180).build(),
                EmissionTrend.builder().month("Feb").emissions(690).captured(190).build(),
                EmissionTrend.builder().month("Mar").emissions(750).captured(200).build(),
                EmissionTrend.builder().month("Apr").emissions(780).captured(210).build(),
                EmissionTrend.builder().month("May").emissions(810).captured(220).build(),
                EmissionTrend.builder().month("Jun").emissions(830).captured(230).build(),
                EmissionTrend.builder().month("Jul").emissions(860).captured(225).build(),
                EmissionTrend.builder().month("Aug").emissions(842).captured(235).build(),
                EmissionTrend.builder().month("Sep").emissions(800).captured(240).build(),
                EmissionTrend.builder().month("Oct").emissions(770).captured(245).build(),
                EmissionTrend.builder().month("Nov").emissions(740).captured(250).build(),
                EmissionTrend.builder().month("Dec").emissions(710).captured(260).build()
        );
    }

    public List<AreaEmission> getAreaEmissions() {
        return List.of(
                AreaEmission.builder().area("Electronic City").emissions(842).risk("High").build(),
                AreaEmission.builder().area("Whitefield").emissions(756).risk("High").build(),
                AreaEmission.builder().area("Koramangala").emissions(623).risk("Medium").build(),
                AreaEmission.builder().area("Indiranagar").emissions(580).risk("Medium").build(),
                AreaEmission.builder().area("Jayanagar").emissions(445).risk("Low").build(),
                AreaEmission.builder().area("Marathahalli").emissions(698).risk("High").build(),
                AreaEmission.builder().area("HSR Layout").emissions(512).risk("Medium").build(),
                AreaEmission.builder().area("BTM Layout").emissions(467).risk("Low").build()
        );
    }

    public List<SourceDistribution> getSourceDistribution() {
        return List.of(
                SourceDistribution.builder().source("Transport").value(42).color("#16a34a").build(),
                SourceDistribution.builder().source("Industry").value(28).color("#0ea5e9").build(),
                SourceDistribution.builder().source("Residential").value(18).color("#f59e0b").build(),
                SourceDistribution.builder().source("Commercial").value(12).color("#8b5cf6").build()
        );
    }

    public List<HotspotSummary> getHotspots() {
        return List.of(
                HotspotSummary.builder().id(1).area("Electronic City").co2Level(842).risk("Critical").trend("Rising").lat(12.8399).lng(77.6770).build(),
                HotspotSummary.builder().id(2).area("Whitefield").co2Level(756).risk("High").trend("Stable").lat(12.9698).lng(77.7500).build(),
                HotspotSummary.builder().id(3).area("Marathahalli").co2Level(698).risk("High").trend("Rising").lat(12.9591).lng(77.6974).build(),
                HotspotSummary.builder().id(4).area("Koramangala").co2Level(623).risk("Medium").trend("Falling").lat(12.9352).lng(77.6245).build(),
                HotspotSummary.builder().id(5).area("Indiranagar").co2Level(580).risk("Medium").trend("Stable").lat(12.9784).lng(77.6408).build(),
                HotspotSummary.builder().id(6).area("HSR Layout").co2Level(512).risk("Medium").trend("Falling").lat(12.9116).lng(77.6389).build(),
                HotspotSummary.builder().id(7).area("Jayanagar").co2Level(445).risk("Low").trend("Falling").lat(12.9308).lng(77.5838).build(),
                HotspotSummary.builder().id(8).area("BTM Layout").co2Level(467).risk("Low").trend("Stable").lat(12.9166).lng(77.6101).build()
        );
    }

    public HotspotDetail getHotspotDetail(int id) {
        Map<Integer, HotspotDetail> details = new HashMap<>();
        details.put(1, HotspotDetail.builder().area("Electronic City").co2Level(842).severity("Critical")
                .mainFactor("Heavy Traffic + IT Parks").trafficLevel("Very High").industrialActivity("High").greenCover("Low")
                .trend(List.of(680,720,750,790,810,842))
                .factors(List.of("Heavy vehicular traffic","Large IT campus emissions","Construction activity","Low green cover"))
                .recommendedIntervention("Green Corridor + Traffic Reduction").build());
        details.put(2, HotspotDetail.builder().area("Whitefield").co2Level(756).severity("High")
                .mainFactor("Industrial + Traffic").trafficLevel("High").industrialActivity("Medium").greenCover("Medium")
                .trend(List.of(700,710,730,740,750,756))
                .factors(List.of("IT corridor traffic","Commercial emissions","Rapid urbanization"))
                .recommendedIntervention("Tree Plantation + CO₂ Capture Unit").build());
        details.put(3, HotspotDetail.builder().area("Marathahalli").co2Level(698).severity("High")
                .mainFactor("Traffic Congestion").trafficLevel("Very High").industrialActivity("Low").greenCover("Low")
                .trend(List.of(620,640,660,680,690,698))
                .factors(List.of("Outer Ring Road congestion","Dense residential area","Limited public transport"))
                .recommendedIntervention("Traffic Reduction + Biofilter").build());
        details.put(4, HotspotDetail.builder().area("Koramangala").co2Level(623).severity("Medium")
                .mainFactor("Commercial Activity").trafficLevel("High").industrialActivity("Low").greenCover("Medium")
                .trend(List.of(650,640,635,630,625,623))
                .factors(List.of("Commercial district emissions","Moderate traffic","Growing restaurant sector"))
                .recommendedIntervention("Green Corridor").build());
        details.put(5, HotspotDetail.builder().area("Indiranagar").co2Level(580).severity("Medium")
                .mainFactor("Mixed Use").trafficLevel("Medium").industrialActivity("Low").greenCover("Medium")
                .trend(List.of(590,585,582,580,580,580))
                .factors(List.of("Commercial + residential mix","Moderate traffic"))
                .recommendedIntervention("Tree Plantation").build());
        details.put(6, HotspotDetail.builder().area("HSR Layout").co2Level(512).severity("Medium")
                .mainFactor("Residential Growth").trafficLevel("Medium").industrialActivity("Low").greenCover("Medium")
                .trend(List.of(530,525,520,518,515,512))
                .factors(List.of("Rapid residential development","Moderate traffic"))
                .recommendedIntervention("Tree Plantation + Biofilter").build());
        details.put(7, HotspotDetail.builder().area("Jayanagar").co2Level(445).severity("Low")
                .mainFactor("Residential").trafficLevel("Low").industrialActivity("Low").greenCover("High")
                .trend(List.of(470,465,460,455,450,445))
                .factors(List.of("Primarily residential","Good green cover"))
                .recommendedIntervention("Biofilter").build());
        details.put(8, HotspotDetail.builder().area("BTM Layout").co2Level(467).severity("Low")
                .mainFactor("Moderate Traffic").trafficLevel("Medium").industrialActivity("Low").greenCover("Medium")
                .trend(List.of(480,475,472,470,468,467))
                .factors(List.of("Metro corridor nearby","Growing commercial activity"))
                .recommendedIntervention("Tree Plantation").build());
        return details.get(id);
    }

    public List<ScenarioResponse> getScenarios() {
        return List.of(
                ScenarioResponse.builder().scenario("Current State").co2(842).reduction(0).cost("—").efficiency("—").status("Baseline").build(),
                ScenarioResponse.builder().scenario("Tree Plantation").co2(775).reduction(67).cost("₹15L").efficiency("8.0%").status("Moderate").build(),
                ScenarioResponse.builder().scenario("Green Corridor").co2(741).reduction(101).cost("₹28L").efficiency("12.0%").status("High").build(),
                ScenarioResponse.builder().scenario("Traffic Reduction").co2(716).reduction(126).cost("₹42L").efficiency("15.0%").status("High").build(),
                ScenarioResponse.builder().scenario("CO₂ Capture Units").co2(674).reduction(168).cost("₹65L").efficiency("20.0%").status("Very High").build()
        );
    }

    public List<RecommendationResponse> getRecommendations() {
        return List.of(
                RecommendationResponse.builder().id(1).hotspot("Electronic City").co2Level(842).traffic("Very High").risk("Critical")
                        .recommended("Green Corridor + Traffic Reduction").expectedImpact("High")
                        .reasoning("Electronic City experiences the highest CO₂ levels in the urban area, primarily driven by heavy vehicular traffic from IT parks and limited green cover. A combined approach of establishing green corridors along major roads and implementing traffic management measures would yield the highest reduction.")
                        .expectedReduction("22-27%").difficulty("Medium-High").estimatedCost("₹45-55L").timeframe("12-18 months").build(),
                RecommendationResponse.builder().id(2).hotspot("Whitefield").co2Level(756).traffic("High").risk("High")
                        .recommended("Tree Plantation + CO₂ Capture Unit").expectedImpact("High")
                        .reasoning("Whitefield's emissions are driven by a combination of IT corridor traffic and commercial activity. Strategic tree plantation along main roads combined with CO₂ capture units near major emission sources would provide both immediate and long-term benefits.")
                        .expectedReduction("18-24%").difficulty("Medium").estimatedCost("₹35-45L").timeframe("8-14 months").build(),
                RecommendationResponse.builder().id(3).hotspot("Marathahalli").co2Level(698).traffic("Very High").risk("High")
                        .recommended("Traffic Reduction + Biofilter").expectedImpact("Medium-High")
                        .reasoning("Marathahalli's primary emission driver is the severe traffic congestion on the Outer Ring Road. Traffic management solutions combined with biofilters along the congested corridor would address the root cause while providing passive air purification.")
                        .expectedReduction("15-20%").difficulty("High").estimatedCost("₹50-60L").timeframe("14-20 months").build()
        );
    }

    public List<MapMarker> getMapMarkers() {
        return List.of(
                MapMarker.builder().id(1).area("Electronic City").lat(12.8399).lng(77.6770).co2(842).risk("Critical").traffic("Very High").estimatedEmissions("842 kg/day").build(),
                MapMarker.builder().id(2).area("Whitefield").lat(12.9698).lng(77.7500).co2(756).risk("High").traffic("High").estimatedEmissions("756 kg/day").build(),
                MapMarker.builder().id(3).area("Marathahalli").lat(12.9591).lng(77.6974).co2(698).risk("High").traffic("Very High").estimatedEmissions("698 kg/day").build(),
                MapMarker.builder().id(4).area("Koramangala").lat(12.9352).lng(77.6245).co2(623).risk("Medium").traffic("High").estimatedEmissions("623 kg/day").build(),
                MapMarker.builder().id(5).area("Indiranagar").lat(12.9784).lng(77.6408).co2(580).risk("Medium").traffic("Medium").estimatedEmissions("580 kg/day").build(),
                MapMarker.builder().id(6).area("HSR Layout").lat(12.9116).lng(77.6389).co2(512).risk("Medium").traffic("Medium").estimatedEmissions("512 kg/day").build(),
                MapMarker.builder().id(7).area("Jayanagar").lat(12.9308).lng(77.5838).co2(445).risk("Low").traffic("Low").estimatedEmissions("445 kg/day").build(),
                MapMarker.builder().id(8).area("BTM Layout").lat(12.9166).lng(77.6101).co2(467).risk("Low").traffic("Medium").estimatedEmissions("467 kg/day").build()
        );
    }

    public List<TrafficCo2Data> getTrafficVsCo2() {
        return List.of(
                TrafficCo2Data.builder().hour("6 AM").traffic(120).co2(310).build(),
                TrafficCo2Data.builder().hour("7 AM").traffic(280).co2(420).build(),
                TrafficCo2Data.builder().hour("8 AM").traffic(520).co2(610).build(),
                TrafficCo2Data.builder().hour("9 AM").traffic(680).co2(750).build(),
                TrafficCo2Data.builder().hour("10 AM").traffic(580).co2(690).build(),
                TrafficCo2Data.builder().hour("11 AM").traffic(450).co2(580).build(),
                TrafficCo2Data.builder().hour("12 PM").traffic(500).co2(620).build(),
                TrafficCo2Data.builder().hour("1 PM").traffic(520).co2(640).build(),
                TrafficCo2Data.builder().hour("2 PM").traffic(480).co2(600).build(),
                TrafficCo2Data.builder().hour("3 PM").traffic(440).co2(570).build(),
                TrafficCo2Data.builder().hour("4 PM").traffic(550).co2(660).build(),
                TrafficCo2Data.builder().hour("5 PM").traffic(720).co2(800).build(),
                TrafficCo2Data.builder().hour("6 PM").traffic(780).co2(842).build(),
                TrafficCo2Data.builder().hour("7 PM").traffic(620).co2(710).build(),
                TrafficCo2Data.builder().hour("8 PM").traffic(380).co2(490).build(),
                TrafficCo2Data.builder().hour("9 PM").traffic(250).co2(380).build()
        );
    }

    // Intervention reduction factors (used by SimulationService)
    public Map<String, Double> getInterventionReductionFactors() {
        Map<String, Double> factors = new LinkedHashMap<>();
        factors.put("tree-plantation", 0.08);
        factors.put("green-corridor", 0.12);
        factors.put("traffic-reduction", 0.15);
        factors.put("co2-capture-unit", 0.20);
        factors.put("biofilter", 0.10);
        return factors;
    }
}

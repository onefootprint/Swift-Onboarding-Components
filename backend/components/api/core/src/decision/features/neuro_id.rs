use idv::neuro_id::response::{
    Model,
    NeuroIdAnalyticsResponse,
};
use newtypes::{
    DecisionStatus,
    FootprintReasonCode as FRC,
};
pub fn footprint_reason_codes(res: &NeuroIdAnalyticsResponse) -> Vec<FRC> {
    let mut frcs = vec![];

    // Overall behavior decision
    // TODO: include familiarity and combined digital intent in here
    let behavior_decision = res
        .flagged_signals()
        .iter()
        .filter(|signal| matches!(signal.model().into(), NeuroModelGroup::Behavior))
        .map(|signal| signal.model().into())
        .max()
        .unwrap_or(NeuroDecisionRiskLevel::Low);

    // Overall device
    let device_decision = res
        .flagged_signals()
        .iter()
        .filter(|signal| matches!(signal.model().into(), NeuroModelGroup::DeviceAndNetwork))
        .map(|signal| signal.model().into())
        .max()
        .unwrap_or(NeuroDecisionRiskLevel::Low);

    // For logging, this is Neuro's suggested decision for now (2024-04-12)
    // https://www.notion.so/onefootprint/2024-04-12-Neuro-Decision-Matrix-a374616605994b55aca0b804b3ed3bc6?pvs=4
    let overall_neuro_decision = match (behavior_decision, device_decision) {
        (_, NeuroDecisionRiskLevel::High) => DecisionStatus::Fail,
        (NeuroDecisionRiskLevel::High, _) => DecisionStatus::Fail,
        (_, NeuroDecisionRiskLevel::Medium) => DecisionStatus::StepUp,
        _ => DecisionStatus::Pass,
    };
    tracing::info!(overall=?overall_neuro_decision, behavior=?behavior_decision, device=?device_decision, "neuro decision logic");

    // Add summary FRCS for device and behavior
    //
    // We can use this to instrument Neuro's decision in rules
    // - Fail if behavior_high_risk
    // - Fail if device_high_risk
    // - StepUp if behavior_low_risk AND device_medium_risk
    match behavior_decision {
        NeuroDecisionRiskLevel::Low => frcs.push(FRC::BehaviorLowRisk),
        NeuroDecisionRiskLevel::High => frcs.push(FRC::BehaviorHighRisk),
        _ => (), // no medium risk things as of now
    };

    match device_decision {
        NeuroDecisionRiskLevel::Medium => frcs.push(FRC::DeviceMediumRisk),
        NeuroDecisionRiskLevel::High => frcs.push(FRC::DeviceHighRisk),
        NeuroDecisionRiskLevel::Low => frcs.push(FRC::DeviceLowRisk),
        _ => (),
    }

    // Add individual model FRCS
    res.flagged_signals()
        .iter()
        .flat_map(|signal| model_to_frc(&signal.model()))
        .for_each(|frc| frcs.push(frc));

    frcs.into_iter().collect()
}

#[derive(PartialOrd, Ord, PartialEq, Eq, Copy, Clone, Debug)]
enum NeuroDecisionRiskLevel {
    Unknown,
    Low,
    Medium,
    High,
}

enum NeuroModelGroup {
    Behavior,
    DeviceAndNetwork,
    Unknown,
}

impl From<Model> for NeuroModelGroup {
    fn from(value: Model) -> Self {
        match value {
            Model::Familiarity => Self::Behavior,
            Model::FraudRingIndicator => Self::Behavior,
            Model::AutomatedActivity => Self::Behavior,
            Model::CombinedDigitalIntent => Self::Behavior,
            Model::RiskyDevice => Self::DeviceAndNetwork,
            Model::FactoryReset => Self::DeviceAndNetwork,
            Model::GpsSpoofing => Self::DeviceAndNetwork,
            Model::TorExitNode => Self::DeviceAndNetwork,
            Model::PublicProxy => Self::DeviceAndNetwork,
            Model::Vpn => Self::DeviceAndNetwork,
            Model::IpBlocklist => Self::DeviceAndNetwork,
            Model::IpAddressAssociation => Self::DeviceAndNetwork,
            Model::Incognito => Self::DeviceAndNetwork,
            Model::BotFramework => Self::DeviceAndNetwork,
            Model::SuspiciousDevice => Self::DeviceAndNetwork,
            Model::DeviceVelocity => Self::DeviceAndNetwork,
            Model::MultipleIdsPerDevice => Self::DeviceAndNetwork,
            Model::DeviceReputation => Self::DeviceAndNetwork,
            Model::Other => Self::Unknown,
        }
    }
}

impl From<Model> for NeuroDecisionRiskLevel {
    fn from(value: Model) -> Self {
        match value {
            // behavior
            Model::FraudRingIndicator => NeuroDecisionRiskLevel::High,
            Model::AutomatedActivity => NeuroDecisionRiskLevel::High,
            // device
            Model::BotFramework => NeuroDecisionRiskLevel::High,
            Model::SuspiciousDevice => NeuroDecisionRiskLevel::High,
            Model::DeviceVelocity => NeuroDecisionRiskLevel::High,
            Model::MultipleIdsPerDevice => NeuroDecisionRiskLevel::High,
            Model::DeviceReputation => NeuroDecisionRiskLevel::High,
            Model::GpsSpoofing => NeuroDecisionRiskLevel::High,
            Model::TorExitNode => NeuroDecisionRiskLevel::High,
            Model::IpBlocklist => NeuroDecisionRiskLevel::High, /* unsure if this is client or global */
            // blocklist
            Model::FactoryReset => NeuroDecisionRiskLevel::Medium,
            Model::PublicProxy => NeuroDecisionRiskLevel::Medium,
            Model::Vpn => NeuroDecisionRiskLevel::Medium,
            Model::IpAddressAssociation => NeuroDecisionRiskLevel::Medium,
            Model::Incognito => NeuroDecisionRiskLevel::Medium,
            // not used yet/unknown
            Model::Familiarity => NeuroDecisionRiskLevel::Unknown,
            Model::CombinedDigitalIntent => NeuroDecisionRiskLevel::Unknown,
            Model::RiskyDevice => NeuroDecisionRiskLevel::Unknown,
            Model::Other => NeuroDecisionRiskLevel::Unknown,
        }
    }
}

fn model_to_frc(model: &Model) -> Vec<FRC> {
    // TODO: add in FRCs based on the parsed attributes also
    match *model {
        Model::FraudRingIndicator => vec![FRC::BehaviorFraudRingRisk],
        Model::AutomatedActivity => vec![FRC::BehaviorAutomaticActivity],
        Model::FactoryReset => vec![FRC::DeviceFactoryReset],
        Model::GpsSpoofing => vec![FRC::DeviceGpsSpoofing],
        Model::TorExitNode => vec![FRC::IpTorExitNode],
        Model::PublicProxy => vec![FRC::IpProxy],
        Model::Vpn => vec![FRC::IpVpn],
        Model::IpAddressAssociation => vec![FRC::IpDataCenter],
        Model::Incognito => vec![FRC::BrowserIncognito],
        Model::BotFramework => vec![FRC::DeviceBotRisk],
        Model::SuspiciousDevice => vec![FRC::DeviceSuspicious],
        Model::DeviceVelocity => vec![FRC::DeviceVelocity],
        Model::MultipleIdsPerDevice => vec![FRC::DeviceMultipleUsers],
        Model::DeviceReputation => vec![FRC::DeviceReputation],
        Model::Other => vec![],
        Model::IpBlocklist => vec![], // we have our own blocklists
        // we'll use these later once we're using these models from neuro
        Model::Familiarity => vec![],
        Model::CombinedDigitalIntent => vec![],
        Model::RiskyDevice => vec![],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use idv::test_fixtures::{
        self,
        NeuroTestOpts,
    };
    use idv::tests::assert_have_same_elements;
    use test_case::test_case;

    #[test_case(true, true, true, true, vec![FRC::BehaviorHighRisk,
        FRC::DeviceHighRisk,
        FRC::BehaviorFraudRingRisk,
        FRC::BehaviorAutomaticActivity,
        FRC::DeviceBotRisk,
        FRC::DeviceFactoryReset
        ])]
    #[test_case(false, false, false, false, vec![FRC::BehaviorLowRisk, FRC::DeviceLowRisk])]
    #[test_case(false, false, true, false, vec![FRC::BehaviorLowRisk, FRC::DeviceMediumRisk, FRC::DeviceFactoryReset])]
    #[test_case(true, false, true, false, vec![FRC::BehaviorHighRisk, FRC::DeviceMediumRisk, FRC::DeviceFactoryReset, FRC::BehaviorAutomaticActivity])]
    fn test_footprint_reason_codes(
        automated_activity: bool,
        bot_framework: bool,
        factory_reset: bool,
        fraud_ring_indicator: bool,
        expected: Vec<FRC>,
    ) {
        let opts = NeuroTestOpts {
            automated_activity,
            bot_framework,
            factory_reset,
            fraud_ring_indicator,
            ..Default::default()
        };

        let raw = test_fixtures::neuro_id_success_response(opts);
        let parsed: NeuroIdAnalyticsResponse = serde_json::from_value(raw).unwrap();
        let frcs = footprint_reason_codes(&parsed);

        assert_have_same_elements(frcs, expected);
    }
}

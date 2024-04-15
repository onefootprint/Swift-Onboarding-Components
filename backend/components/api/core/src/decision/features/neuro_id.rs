use idv::neuro_id::response::{Model, NeuroIdAnalyticsResponse};
use newtypes::FootprintReasonCode as FRC;
pub fn footprint_reason_codes(res: &NeuroIdAnalyticsResponse) -> Vec<FRC> {
    let mut frcs = vec![];
    // TODO: rm this
    let automated_fri = res.get_signal_for_model(Model::AutomatedActivity);

    if let Some(a_fri) = automated_fri {
        frcs.push(
            a_fri
                .label
                .map(|l| &l == "true")
                .unwrap_or(false)
                .then_some(FRC::BrowserAutomation),
        )
    }

    frcs.into_iter().flatten().collect()
}


#[allow(unused)]
fn model_to_frc(model: Model) -> Vec<FRC> {
    // TODO: add in FRCs based on the parsed attributes also
    match model {
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
        Model::Other(_) => vec![],
        Model::IpBlocklist => vec![], // we have our own blocklists
        // we'll use these later once we're using these models from neuro
        Model::Familiarity => vec![],
        Model::CombinedDigitalIntent => vec![],
        Model::RiskyDevice => vec![],
    }
}

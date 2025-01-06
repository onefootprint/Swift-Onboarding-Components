use idv::stytch::response::Action;
use idv::stytch::response::LookupResponse;
use idv::stytch::response::Reason;
use itertools::Itertools;
use newtypes::FootprintReasonCode;

fn action_to_footprint_reason_code(value: &Action) -> FootprintReasonCode {
    match value {
        Action::Allow => FootprintReasonCode::DeviceLowRisk,
        Action::Challenge => FootprintReasonCode::DeviceMediumRisk,
        Action::Block => FootprintReasonCode::DeviceHighRisk,
    }
}

fn reason_to_footprint_reason_code(value: &Reason) -> Option<FootprintReasonCode> {
    match value {
        Reason::AuthenticDevice => None,
        Reason::AuthorizedDevice => None,
        Reason::KnownDatacenterIp => Some(FootprintReasonCode::IpDataCenter),
        Reason::JsPropertyDeception => Some(FootprintReasonCode::BrowserTampering),
        Reason::UnverifiedDevice => None,
        Reason::IpRateLimitExceeded => None,
        Reason::MalformedSubmission => Some(FootprintReasonCode::BrowserTampering),
        Reason::InvalidSignature => Some(FootprintReasonCode::BrowserTampering),
        Reason::TokenAlreadyExchanged => None,
        Reason::UnauthorizedPayloadOrigin => Some(FootprintReasonCode::BrowserTampering),
        Reason::BannedDevice => None,
        Reason::HeadlessBrowserAutomation => Some(FootprintReasonCode::BrowserAutomation),
        Reason::KnownTorExitNode => Some(FootprintReasonCode::IpTorExitNode),
        Reason::BannedIpAddress => None,
        Reason::UserAgentDeception => Some(FootprintReasonCode::BrowserTampering),
        Reason::IpRateLimitExceededCritical => None,
        Reason::TuningRuleMatch => None,
        Reason::AwsDatacenterIp => Some(FootprintReasonCode::IpDataCenter),
        Reason::PossibleFakeAppleChromeOrMitm => None,
        Reason::PossibleTlsMitm => None,
        Reason::AzureDatacenterIp => Some(FootprintReasonCode::IpDataCenter),
        Reason::PossibleTamperingDetected => Some(FootprintReasonCode::BrowserTampering),
        Reason::GcpDatacenterIp => Some(FootprintReasonCode::IpDataCenter),
        Reason::Arm8_32BitAndroidOld => None,
        Reason::PossibleBrowserAutomation => Some(FootprintReasonCode::BrowserAutomation),
        Reason::Arm7_32BitAndroidOld => None,
        Reason::PythonDetected => None, // maybe BrowserAutomation?
        Reason::UnauthorizedRequestOrigin => None,
        Reason::GolangDetected => None,
        Reason::NodeJsDetected => None,
    }
}

pub fn lookup_response_to_footprint_reason_codes(res: &LookupResponse) -> Vec<FootprintReasonCode> {
    let mut reason_codes = vec![action_to_footprint_reason_code(&res.verdict.action)];

    reason_codes = reason_codes
        .into_iter()
        .chain(
            res.verdict
                .reasons()
                .iter()
                .flat_map(reason_to_footprint_reason_code),
        )
        .unique()
        .collect();

    reason_codes
}

#[cfg(test)]
mod test {
    use super::*;
    use idv::stytch::response::Fingerprints;
    use idv::stytch::response::Verdict;
    use test_case::test_case;

    #[test_case(Action::Block, vec![] => vec![FootprintReasonCode::DeviceHighRisk])]
    #[test_case(Action::Challenge, vec![] => vec![FootprintReasonCode::DeviceMediumRisk])]
    #[test_case(Action::Allow, vec![] => vec![FootprintReasonCode::DeviceLowRisk])]
    #[test_case(Action::Challenge, vec![Reason::TuningRuleMatch] => vec![FootprintReasonCode::DeviceMediumRisk])]
    #[test_case(Action::Challenge, vec![Reason::KnownDatacenterIp] => vec![FootprintReasonCode::DeviceMediumRisk, FootprintReasonCode::IpDataCenter])]
    #[test_case(Action::Challenge, vec![Reason::HeadlessBrowserAutomation] => vec![FootprintReasonCode::DeviceMediumRisk, FootprintReasonCode::BrowserAutomation])]
    #[test_case(Action::Challenge, vec![Reason::UnauthorizedPayloadOrigin] => vec![FootprintReasonCode::DeviceMediumRisk, FootprintReasonCode::BrowserTampering])]
    #[test_case(Action::Challenge, vec![Reason::UnauthorizedPayloadOrigin, Reason::JsPropertyDeception] => vec![FootprintReasonCode::DeviceMediumRisk, FootprintReasonCode::BrowserTampering])]
    fn test_reason_codes_from_stytch(action: Action, reasons: Vec<Reason>) -> Vec<FootprintReasonCode> {
        let res = make_lookup_response(action, reasons);
        lookup_response_to_footprint_reason_codes(&res)
    }

    fn make_lookup_response(action: Action, reasons: Vec<Reason>) -> LookupResponse {
        LookupResponse {
            telemetry_id: "abc123".to_owned(),
            fingerprints: Fingerprints {
                browser_fingerprint: None,
                browser_id: None,
                hardware_fingerprint: None,
                network_fingerprint: None,
                visitor_fingerprint: None,
                visitor_id: None,
            },
            verdict: Verdict {
                action,
                detected_device_type: None,
                is_authentic_device: None,
                reasons: Some(reasons.iter().map(|r| r.to_string()).collect()),
            },
            created_at: None,
            expires_at: None,
            status_code: None,
        }
    }
}

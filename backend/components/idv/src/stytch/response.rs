use super::error::{
    Error,
    StytchError,
};
use chrono::{
    DateTime,
    Utc,
};
use newtypes::PiiString;
use serde::*;
use serde_with::DeserializeFromStr;
use strum::Display;
use strum_macros::EnumString;

pub fn parse_response(value: serde_json::Value) -> Result<LookupResponse, Error> {
    let response: Response = serde_json::value::from_value(value)?;
    match response {
        Response::Success(r) => Ok(r),
        Response::Error(r) => Err(Error::StytchError(r)),
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(untagged)]
#[allow(clippy::large_enum_variant)]
pub enum Response {
    Success(LookupResponse),
    Error(StytchErrorResponse),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct StytchErrorResponse {
    pub error_message: StytchError,
    pub status_code: Option<u16>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LookupResponse {
    pub telemetry_id: String,
    pub fingerprints: Fingerprints,
    pub verdict: Verdict,
    pub created_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub status_code: Option<u16>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Fingerprints {
    pub browser_fingerprint: Option<PiiString>,
    pub browser_id: Option<PiiString>,
    pub hardware_fingerprint: Option<PiiString>,
    pub network_fingerprint: Option<PiiString>,
    pub visitor_fingerprint: Option<PiiString>,
    pub visitor_id: Option<PiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Verdict {
    pub action: Action,
    pub detected_device_type: Option<String>,
    pub is_authentic_device: Option<bool>,
    pub reasons: Option<Vec<String>>,
}

impl Verdict {
    pub fn reasons(&self) -> Vec<Reason> {
        self.reasons
            .clone()
            .unwrap_or_default()
            .iter()
            .flat_map(|s| match Reason::try_from(s.as_str()) {
                Ok(r) => Some(r),
                Err(err) => {
                    tracing::error!(?err, reason_string=%s, "Error parsing Stytch Reason");
                    None
                }
            })
            .collect()
    }
}

#[derive(Debug, Clone, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Action {
    Allow,
    Block,
    Challenge,
}

#[derive(Clone, Debug, Display, EnumString, DeserializeFromStr, Eq, PartialEq, Serialize)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum Reason {
    AuthenticDevice,
    AuthorizedDevice,
    KnownDatacenterIp,
    JsPropertyDeception,
    UnverifiedDevice,
    IpRateLimitExceeded,
    MalformedSubmission,
    InvalidSignature,
    TokenAlreadyExchanged,
    UnauthorizedPayloadOrigin,
    BannedDevice,
    HeadlessBrowserAutomation,
    KnownTorExitNode,
    BannedIpAddress,
    UserAgentDeception,
    PossibleBrowserAutomation,
    IpRateLimitExceededCritical,
    TuningRuleMatch,
    AwsDatacenterIp,
    PossibleFakeAppleChromeOrMitm,
    PossibleTlsMitm,
    AzureDatacenterIp,
    PossibleTamperingDetected,
    GcpDatacenterIp,
    Arm8_32BitAndroidOld,
    Arm7_32BitAndroidOld,
    PythonDetected,
    UnauthorizedRequestOrigin,
    GolangDetected,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use test_case::test_case;

    #[test]
    fn parse_error() {
        let json = json!({
            "error_message": "The telemety_id was not found.",
        });
        let parsed = parse_response(json).unwrap_err();

        let Error::StytchError(e) = parsed else {
            panic!("Expected StytchError, got {:?}", parsed);
        };
        assert_eq!(StytchError::TelemetryIdNotFound, e.error_message);
    }

    #[test]
    fn parse_unknown_error() {
        let json = json!({
            "error_message": "Oh shoot",
        });
        let parsed = parse_response(json).unwrap_err();

        let Error::StytchError(e) = parsed else {
            panic!("Expected StytchError, got {:?}", parsed);
        };

        let StytchError::Unknown(s) = e.error_message else {
            panic!("Expected StytchError::Unknown");
        };
        assert_eq!("Oh shoot".to_owned(), s);
    }

    #[test_case(example_response1() => (Action::Allow, vec![]))]
    #[test_case(example_response2() => (Action::Challenge, vec![Reason::KnownDatacenterIp, Reason::PossibleFakeAppleChromeOrMitm, Reason::PossibleTlsMitm ]))]
    fn parse_success(json: serde_json::Value) -> (Action, Vec<Reason>) {
        let parsed = parse_response(json).unwrap();

        // We currently read saved Vres's by decrypted e_response which is written from the direct json
        // response that never goes through deser in Rust So there isn't an immediate use case for
        // ensuring (raw json -> deser to Rust struct -> ser to json -> deser to Rust struct again) works,
        // but this is a generally good thing to ensure to save us from dumb errors later
        let reserialized = serde_json::to_value(parsed).unwrap();
        let reparsed: LookupResponse = serde_json::from_value(reserialized).unwrap();

        let action = reparsed.verdict.action.clone();
        let reasons = reparsed.verdict.reasons();
        (action, reasons)
    }

    fn example_response1() -> serde_json::Value {
        json!(
            {
                "created_at": "2023-07-26T20:53:43.821880491Z",
                "expires_at": "2023-07-26T20:58:43.821880491Z",
                "fingerprints": {
                    "browser_fingerprint": "browser-fingerprint-14ba6d33-ddfc-3f36-b6d7-c7fb0c649fc6",
                    "browser_id": "browser-id-d2a4389b-fc01-35f7-9211-04676d43e19d",
                    "hardware_fingerprint": "hardware-fingerprint-e7faa291-ade1-371e-a339-6e540b3c092a",
                    "network_fingerprint": "network-fingerprint-b5060259-40e6-3f29-8215-45ae2da3caa1",
                    "visitor_fingerprint": "visitor-fingerprint-0101d011-dc7c-3f66-84f7-28afb6e8b168",
                    "visitor_id": "visitor-3e411811-5281-32d2-8a5e-cc2320aed32f"
                },
                "status_code": 200,
                "telemetry_id": "c99c652c-e966-456e-8111-ced042d40f92",
                "verdict": {
                    "action": "ALLOW",
                    "detected_device_type": "APPLE_CHROME",
                    "is_authentic_device": true,
                    "reasons": []
                }
            }
        )
    }

    fn example_response2() -> serde_json::Value {
        json!(
            {
                "created_at": "2023-07-26T23:31:18.950734891Z",
                "expires_at": "2023-07-26T23:36:18.950734891Z",
                "fingerprints": {
                    "browser_fingerprint": "browser-fingerprint-14ba6d33-ddfc-3f36-b6d7-c7fb0c649fc6",
                    "browser_id": "browser-id-cc487856-e9ed-35cb-829a-6bbc36c95f13",
                    "hardware_fingerprint": "hardware-fingerprint-e7faa291-ade1-371e-a339-6e540b3c092a",
                    "network_fingerprint": "network-fingerprint-26a3646c-7782-304a-83bc-65ef41319593",
                    "visitor_fingerprint": "visitor-fingerprint-af0aa3fa-4d99-3e75-b24f-08e6623ab6b9",
                    "visitor_id": "visitor-2317bebe-d7cb-3d23-8674-62423c5e1126"
                },
                "status_code": 200,
                "telemetry_id": "309d6757-d439-4e02-8546-ba8f3e65c288",
                "verdict": {
                    "action": "CHALLENGE",
                    "detected_device_type": "APPLE_CHROME",
                    "is_authentic_device": false,
                    "reasons": ["KNOWN_DATACENTER_IP", "SOMETHING_ELSE_YO", "POSSIBLE_FAKE_APPLE_CHROME_OR_MITM", "POSSIBLE_TLS_MITM"]
                }
            }
        )
    }

    #[test]
    pub fn test_arm8_32_bit_android_old() {
        assert_eq!(
            Reason::Arm8_32BitAndroidOld,
            Reason::try_from("ARM8_32BIT_ANDROID_OLD").unwrap()
        );
    }
}

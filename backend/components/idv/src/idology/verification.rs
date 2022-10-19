use newtypes::{
    AuditTrailEvent, OnboardingStatus, ReasonCode, SignalScope, SignalSeverity, Vendor, VerificationInfo,
    VerificationInfoStatus,
};
use std::{collections::HashMap, str::FromStr};

use crate::IdvResponse;

fn parse_response(value: serde_json::Value) -> Result<IDologyResponse, super::Error> {
    let response: IDologyResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

pub type IdNumber = String;

pub fn process(
    value: serde_json::Value,
    pending_attributes: Vec<SignalScope>,
) -> Result<(IdvResponse, Option<IdNumber>), super::Error> {
    let (status, audit_events, id_number) = match parse_response(value.clone()) {
        Ok(response) => process_success(response.response, pending_attributes)?,
        Err(_) => process_error(),
    };
    let idv_response = IdvResponse {
        status,
        audit_events,
        raw_response: value,
    };
    // For now, if we return a non-null id_number, this indicates that we should create a DocumentRequest
    Ok((idv_response, id_number))
}

fn process_success(
    response: IDologySuccess,
    pending_attributes: Vec<SignalScope>,
) -> Result<(Option<OnboardingStatus>, Vec<AuditTrailEvent>, Option<IdNumber>), super::Error> {
    // TODO is it concerning if there are no qualifiers?
    if !response.id_located() {
        // TODO probably want to waterfall to another vendor
        let audit_trail = AuditTrailEvent::Verification(VerificationInfo {
            attributes: vec![SignalScope::Identity],
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::NotFound,
        });
        // TODO do we have to do this if response.id_located()?
        let id_number = if response.is_id_scan_required() {
            response.id_number
        } else {
            None
        };
        return Ok((Some(OnboardingStatus::ManualReview), vec![audit_trail], id_number));
    }

    let qualifiers = if let Some(ref qualifiers) = response.qualifiers {
        qualifiers.parse_qualifiers()
    } else {
        vec![]
    };
    let signals: Vec<_> = qualifiers.into_iter().map(|r| r.signal()).collect();
    // Create a map of SignalScope -> Vec<SignalSeverity>
    let mut attribute_to_signals = HashMap::<SignalScope, Vec<_>>::new();
    for signal in signals {
        for attr in signal.scopes {
            let signals_for_attr = attribute_to_signals.entry(attr).or_default();
            signals_for_attr.push(signal.kind);
        }
    }
    // Look at the maximum signal for each attribute. If it is more severe than INFO, we shouldn't
    // include the field in the list of verified attributes in the audit log
    // Note that there may be attributes in failed_attributes that aren't included in pending_attributes.
    let failed_attributes: Vec<_> = attribute_to_signals
        .into_iter()
        .filter_map(|(attr, signal_kinds)| {
            let max_signal = signal_kinds.into_iter().max()?;
            if max_signal <= SignalSeverity::Info {
                // If we have a TODO, NotImportant, or Info signal on this piece of data, treat it as nothing
                None
            } else {
                // If we have a NotFound, InvalidRequest, Alert, or Fraud signal on this piece of data, fail (for now)
                Some(attr)
            }
        })
        .collect();
    let verified_fields: Vec<_> = pending_attributes
        .into_iter()
        .filter(|a| !failed_attributes.contains(a))
        .collect();

    // TODO: determine our own response, don't just use what we get from IDology
    let new_status = response.status();
    let events = vec![
        (!verified_fields.is_empty()).then_some(VerificationInfo {
            attributes: verified_fields,
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::Verified,
        }),
        (!failed_attributes.is_empty()).then_some(VerificationInfo {
            attributes: failed_attributes,
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::Failed,
        }),
    ]
    .into_iter()
    .flatten()
    .map(AuditTrailEvent::Verification)
    .collect();
    Ok((Some(new_status), events, None))
}

fn process_error() -> (Option<OnboardingStatus>, Vec<AuditTrailEvent>, Option<IdNumber>) {
    let events = vec![AuditTrailEvent::Verification(VerificationInfo {
        attributes: vec![],
        vendor: Vendor::Footprint,
        status: VerificationInfoStatus::Failed,
    })];
    (Some(OnboardingStatus::ManualReview), events, None)
}

#[derive(Debug, serde::Deserialize)]
struct IDologyResponse {
    response: IDologySuccess,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
struct IDologySuccess {
    qualifiers: Option<IDologyQualifiers>,
    // TODO should these be options?
    results: Option<KeyResponse>,
    summary_result: Option<KeyResponse>,
    id_number: Option<IdNumber>,
    id_scan: Option<String>,
}

impl IDologySuccess {
    /// IDology-determined status for verifying the customer
    fn status(&self) -> OnboardingStatus {
        match self.summary_result.as_ref().map(|x| x.key.as_str()) {
            Some("id.success") => OnboardingStatus::Verified,
            Some("id.failure") => OnboardingStatus::Failed,
            _ => OnboardingStatus::ManualReview,
        }
    }

    /// Whether the ID was located on IDology
    fn id_located(&self) -> bool {
        if let Some(ref results) = self.results {
            results.key.as_str() == "result.match"
        } else {
            false
        }
    }

    /// Whether IDology tells us that we need to upload an ID scan
    fn is_id_scan_required(&self) -> bool {
        match self.id_scan {
            Some(ref id_scan) => id_scan.as_str() == "yes",
            None => false,
        }
    }
}

#[derive(Debug, serde::Deserialize)]
struct IDologyQualifiers {
    qualifier: serde_json::Value,
}

#[derive(Debug, serde::Deserialize)]
struct KeyResponse {
    key: String,
}

impl KeyResponse {
    fn parse_key(value: serde_json::Value) -> Option<String> {
        let response: Self = serde_json::value::from_value(value).ok()?;
        Some(response.key)
    }
}

impl IDologyQualifiers {
    fn parse_qualifiers(&self) -> Vec<ReasonCode> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here
        match self.qualifier {
            serde_json::Value::Object(_) => {
                if let Some(qualifier) = Self::parse_qualifier(self.qualifier.clone()) {
                    vec![qualifier]
                } else {
                    vec![]
                }
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .cloned()
                .flat_map(Self::parse_qualifier)
                .collect(),
            _ => vec![],
        }
    }

    fn parse_qualifier(qualifier: serde_json::Value) -> Option<ReasonCode> {
        let key = KeyResponse::parse_key(qualifier)?;
        ReasonCode::from_str(key.as_str()).ok()
    }
}

#[cfg(test)]
mod tests {
    use newtypes::IDologyReasonCode;
    use serde_json::json;

    use super::*;

    #[test]
    fn test_idology_response_single() {
        let response = json!({
            "response": {
              "id-number": "3010453",
              "summary-result": {
                "key": "id.success",
                "message": "Pass"
              },
              "results": {
                "key": "result.match",
                "message": "ID Located"
              },
              "qualifiers": {
                "qualifier": {
                  "key": "resultcode.ip.not.located",
                  "message": "IP Not Located"
                }
              }
            }
          }
        );
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response.response.qualifiers.unwrap().parse_qualifiers();
        assert_eq!(
            reason_codes,
            vec![ReasonCode::IDology(IDologyReasonCode::IpNotLocated)],
        )
    }

    #[test]
    fn test_idology_response_list() {
        let response = json!({
            "response": {
              "id-number": "3010453",
              "summary-result": {
                "key": "id.success",
                "message": "Pass"
              },
              "results": {
                "key": "result.match",
                "message": "ID Located"
              },
              "qualifiers": {
                "qualifier": [
                  {
                    "key": "resultcode.ip.not.located",
                    "message": "IP Not Located"
                  },
                  {
                    "key": "resultcode.street.name.does.not.match",
                    "message": "Street name does not match"
                  },
                ]
              }
            }
          }
        );
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response.response.qualifiers.unwrap().parse_qualifiers();
        let expected = vec![
            ReasonCode::IDology(IDologyReasonCode::IpNotLocated),
            ReasonCode::IDology(IDologyReasonCode::StreetNameDoesNotMatch),
        ];
        assert_eq!(reason_codes, expected);
    }

    #[test]
    fn test_idology_response_invalid() {
        let response = json!({
            "response": {
              "qualifiers": {
                "qualifier": "invalid",
              }
            }
          }
        );
        let response = parse_response(response).expect("Could not parse response");
        assert_eq!(response.response.qualifiers.unwrap().parse_qualifiers().len(), 0);
        assert!(response.response.results.is_none());
        assert!(response.response.summary_result.is_none());
    }

    #[test]
    fn test_idology_response_no_data() {
        let response = json!({
            "response": {
                "id-number": "2972309",
            }
        });
        let response = parse_response(response).expect("Could not parse response");
        assert!(response.response.qualifiers.is_none());
        assert!(response.response.results.is_none());
        assert!(response.response.summary_result.is_none());
    }
}

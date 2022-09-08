use newtypes::{
    AuditTrailEvent, ReasonCode, SignalAttribute, SignalKind, Status, Vendor, VerificationInfo,
    VerificationInfoStatus,
};
use std::{collections::HashMap, str::FromStr};

fn parse_qualifiers(value: serde_json::Value) -> Result<Vec<ReasonCode>, super::Error> {
    let response: IDologyResponse = serde_json::value::from_value(value)?;
    let results = response.response.qualifiers.parse_qualifiers();
    Ok(results)
}

pub fn process(
    value: serde_json::Value,
    pending_attributes: Vec<SignalAttribute>,
) -> Result<(Status, Vec<AuditTrailEvent>), super::Error> {
    match parse_qualifiers(value) {
        Ok(qualifiers) => process_success(qualifiers, pending_attributes),
        Err(_) => Ok(process_error()),
    }
}

fn process_success(
    qualifiers: Vec<ReasonCode>,
    pending_attributes: Vec<SignalAttribute>,
) -> Result<(Status, Vec<AuditTrailEvent>), super::Error> {
    let signals: Vec<_> = qualifiers.into_iter().map(|r| r.signal()).collect();
    // Create a map of SignalAttribute -> Vec<SignalKind>
    let mut attribute_to_signals = HashMap::<SignalAttribute, Vec<_>>::new();
    for signal in signals {
        for attr in signal.attributes {
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
            if max_signal <= SignalKind::Info {
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

    // TODO more advanced decision engine than just failing if there's info for any piece of data
    let (new_status, final_audit_status) = if failed_attributes.is_empty() {
        (Status::Verified, VerificationInfoStatus::Verified)
    } else {
        (Status::ManualReview, VerificationInfoStatus::Failed)
    };
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
        Some(VerificationInfo {
            attributes: vec![],
            vendor: Vendor::Footprint,
            status: final_audit_status,
        }),
    ]
    .into_iter()
    .flatten()
    .map(AuditTrailEvent::Verification)
    .collect();
    Ok((new_status, events))
}

fn process_error() -> (Status, Vec<AuditTrailEvent>) {
    let events = vec![AuditTrailEvent::Verification(VerificationInfo {
        attributes: vec![],
        vendor: Vendor::Footprint,
        status: VerificationInfoStatus::Failed,
    })];
    (Status::ManualReview, events)
}

#[derive(Debug, serde::Deserialize)]
struct IDologyResponse {
    response: IDologySuccess,
}

#[derive(Debug, serde::Deserialize)]
struct IDologySuccess {
    qualifiers: IDologyQualifiers,
}

#[derive(Debug, serde::Deserialize)]
struct IDologyQualifiers {
    qualifier: serde_json::Value,
}

impl IDologyQualifiers {
    fn parse_qualifiers(&self) -> Vec<ReasonCode> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here
        match self.qualifier {
            serde_json::Value::Object(ref qualifier) => {
                if let Some(qualifier) = Self::parse_qualifier(qualifier) {
                    vec![qualifier]
                } else {
                    vec![]
                }
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .filter_map(|x| x.as_object())
                .flat_map(Self::parse_qualifier)
                .collect(),
            _ => vec![],
        }
    }

    fn parse_qualifier(qualifier: &serde_json::Map<String, serde_json::Value>) -> Option<ReasonCode> {
        let key_value = qualifier.get("key")?;
        let key_str = key_value.as_str()?;
        ReasonCode::from_str(key_str).ok()
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
        let reason_codes = parse_qualifiers(response).expect("Could not parse response");
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
        let reason_codes = parse_qualifiers(response).expect("Could not parse response");
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
        let reason_codes = parse_qualifiers(response).expect("Could not parse response");
        assert_eq!(reason_codes, vec![]);
    }
}

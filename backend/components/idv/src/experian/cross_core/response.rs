use super::error_code::ErrorCode;
use crate::experian::error::CrossCoreResponseError;
use crate::experian::error::Error;
use crate::experian::precise_id::response::PreciseIDAPIResponse;
use newtypes::ExperianAddressAndNameMatchReasonCodes;
use newtypes::ExperianDobMatchReasonCodes;
use newtypes::ExperianFraudShieldCodes;
use newtypes::ExperianPhoneMatchReasonCodes;
use newtypes::ExperianSSNReasonCodes;
use newtypes::ExperianWatchlistReasonCodes;
use std::str::FromStr;

pub fn parse_response(response: serde_json::Value) -> Result<CrossCoreAPIResponse, Error> {
    let r: CrossCoreAPIResponse = serde_json::from_value(response)?;

    Ok(r)
}

/// This is the top level response from CrossCore
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CrossCoreAPIResponse {
    pub response_header: ResponseHeader,
    // Experian sends us back all the data we sent to them
    #[serde(skip)] // TODO: why did we have skip_serializing here? wouldn't it cause deser errors?
    pub original_request_data: Option<super::request::BodyPayload>,
    pub client_response_payload: ClientResponsePayload,
}

impl CrossCoreAPIResponse {
    fn get_precise_id_decision_element(&self) -> Result<&DecisionElement, Error> {
        let de = self
            .client_response_payload
            .decision_elements
            .iter()
            .find(|de| {
                de.service_name
                    .as_ref()
                    .map(|n| n == "PreciseId")
                    .unwrap_or(false)
            })
            .ok_or(CrossCoreResponseError::PreciseIDResponseNotFound)?;

        Ok(de)
    }

    // Helper to dig down to the precise id response from cross core wrapper
    pub fn precise_id_response(&self) -> Result<PreciseIDAPIResponse, Error> {
        let response = self.get_precise_id_decision_element()?.clone();
        let precise_id_response = response
            .other_data
            .and_then(|o| o.json)
            .and_then(|j| j.fraud_solutions)
            .and_then(|j| j.response)
            .and_then(|r| r.products)
            .and_then(|p| p.precise_id_server);

        if let Some(r) = precise_id_response {
            Ok(r)
        } else {
            Err(Error::MissingPreciseIDResponse)
        }
    }

    pub fn fraud_shield_reason_codes(&self) -> Result<Vec<ExperianFraudShieldCodes>, Error> {
        let codes = self.precise_id_response()?.fraud_shield_reason_codes();

        Ok(codes)
    }

    pub fn dob_match_reason_codes(&self) -> Result<ExperianDobMatchReasonCodes, Error> {
        let code = self.precise_id_response()?.dob_match_reason_code();

        Ok(code)
    }

    pub fn name_and_address_match_reason_codes(
        &self,
    ) -> Result<ExperianAddressAndNameMatchReasonCodes, Error> {
        let code = self.get_precise_id_decision_element()?.address_reason_code();

        Ok(code)
    }

    pub fn watchlist_match_reason_codes(&self) -> Result<ExperianWatchlistReasonCodes, Error> {
        let code = self.get_precise_id_decision_element()?.watchlist_reason_code();

        Ok(code)
    }

    pub fn ssn_match_reason_codes(&self) -> Result<ExperianSSNReasonCodes, Error> {
        let code = self.precise_id_response()?.ssn_match_reason_code();

        Ok(code)
    }

    pub fn phone_match_reason_codes(&self) -> Result<ExperianPhoneMatchReasonCodes, Error> {
        let code = self.precise_id_response()?.phone_match_reason_code();

        Ok(code)
    }

    pub fn validate(&self) -> Result<(), Error> {
        let pm = self.precise_id_response()?;
        let err = pm.error.as_ref().and_then(|e| e.error_code.clone());
        // just to be careful
        let error_codes = self.error_codes();
        let error_from_error_codes = error_codes.first().cloned().map(|(raw, _)| raw);
        let final_err = err.or(error_from_error_codes).map(|code| {
            let description = ErrorCode::from_str(&code).unwrap_or(ErrorCode::Other(code.clone()));
            Error::ResponseError(CrossCoreResponseError::Error(description, code))
        });

        // Check for errors
        if let Some(e) = final_err {
            return Err(e);
        }

        // Check precise match and precise ID model versions, otherwise our reason codes and score
        // thresholds are not correct
        if !(pm.precise_id_model_version_is_correct() && pm.precise_match_version_is_correct()) {
            return Err(Error::IncorrectPreciseIdVersion);
        }

        Ok(())
    }
}

impl CrossCoreAPIResponse {
    pub fn error_codes(&self) -> Vec<(String, ErrorCode)> {
        self.get_precise_id_decision_element()
            .ok()
            .and_then(|de| de.warnings_errors.as_ref())
            .map(|we| {
                we.iter()
                    .filter_map(|e| e.response_code.clone())
                    .collect::<Vec<_>>()
            })
            .map(|codes| {
                codes
                    .into_iter()
                    .map(|c| {
                        (
                            c.clone(),
                            ErrorCode::from_str(c.as_str()).unwrap_or(ErrorCode::Other(c.clone())),
                        )
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseHeader {
    #[serde(rename(deserialize = "tenantID"))]
    pub tenant_id: Option<String>,
    pub request_type: Option<String>,
    pub client_reference_id: Option<String>,
    pub exp_request_id: Option<String>,
    pub message_time: Option<String>,
    pub overall_response: OverallResponse,
    pub response_code: Option<String>,
    pub response_type: Option<String>,
    pub response_message: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OverallResponse {
    pub decision: Option<String>,
    pub score: Option<i32>,
    // unfortunately no enum values listed
    pub decision_text: Option<String>,
    // unfortunately no enum values listed
    pub decision_reasons: Option<Vec<String>>,
    // unfortunately no enum values listed
    pub recommended_next_actions: Option<Vec<String>>,
    // idk what this is
    pub spare_objects: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientResponsePayload {
    pub orchestration_decisions: Vec<OrchestrationStepDecision>,
    pub decision_elements: Vec<DecisionElement>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationStepDecision {
    // Sequence/point in workflow that decision point was generated.
    pub sequence_id: Option<String>,
    pub decision_source: Option<String>,
    // Decision from service.
    pub decision: Option<String>,
    // List of reasons for decision
    pub decision_reasons: Option<Vec<String>>,
    pub score: Option<i32>,
    // Informational decision text
    pub decision_text: Option<String>,
    // Next action recommended from the fraud engine
    pub next_action: Option<String>,
    // Reference from backing application
    pub app_reference: Option<String>,
    // Time of decision. FORMAT: YYYY-MM-DDTHH:MM:SSZ
    // TODO: parse?
    pub decision_time: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElement {
    pub service_name: Option<String>,
    pub applicant_id: Option<String>,
    pub normalized_score: Option<i32>,
    pub warnings_errors: Option<Vec<WarningError>>,
    pub other_data: Option<OtherData>,
    pub matches: Option<Vec<MatchValue>>,
    pub decisions: Option<Vec<DecisionElementDecision>>,
}

impl DecisionElement {
    fn get_match_value(&self, name: &str) -> Option<MatchValue> {
        self.matches.clone().and_then(|match_values| {
            match_values
                .into_iter()
                .find(|mv| mv.name.as_ref().map(|n| n.as_str() == name).unwrap_or(false))
        })
    }

    pub fn address_reason_code(&self) -> ExperianAddressAndNameMatchReasonCodes {
        self.get_match_value("pmAddressVerificationResult1")
            .and_then(|mv| mv.value)
            .and_then(|val| ExperianAddressAndNameMatchReasonCodes::try_from(val.as_str()).ok())
            .unwrap_or(ExperianAddressAndNameMatchReasonCodes::DefaultNoMatch)
    }

    pub fn watchlist_reason_code(&self) -> ExperianWatchlistReasonCodes {
        self.get_match_value("pmOFACVerificationResult")
            .and_then(|mv| mv.value)
            .and_then(|val| ExperianWatchlistReasonCodes::try_from(val.as_str()).ok())
            .unwrap_or(ExperianWatchlistReasonCodes::R1)
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElementDecision {
    // This is unlikely to be an enum - no indication we can use that.
    pub element: Option<String>,
    // This contains reason codes from across all the experian products, so will need to coalesce or have all
    // reason codes in one enum (IEN, CrossCore, PreciseID etc) See the test_fixture response for an
    // example
    pub value: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WarningError {
    pub response_type: Option<String>,
    pub response_code: Option<String>,
    pub response_message: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchValue {
    pub name: Option<String>,
    pub value: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OtherData {
    pub json: Option<JsonOtherData>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonOtherData {
    pub fraud_solutions: Option<FraudSolutions>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutions {
    pub response: Option<FraudSolutionResponse>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponse {
    pub products: Option<FraudSolutionResponseProducts>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponseProducts {
    #[serde(rename(deserialize = "preciseIDServer"))]
    pub precise_id_server: Option<PreciseIDAPIResponse>,
    // This is data from the Identity Element Network (IEN). This data is returned separately, but also
    // rolls up into the preciseID score and response
    pub customer_management: Option<serde_json::Value>,
    // we'd add syntheticID etc here
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CCErrorResponse {
    pub code: String,
    pub description: String,
    pub reason: String,
    pub details: serde_json::Value,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_fixtures::cross_core_response_with_error;
    use crate::test_fixtures::cross_core_response_with_fraud_shield_codes;
    use crate::test_fixtures::experian_cross_core_response;
    use crate::tests::assert_have_same_elements;
    use newtypes::ExperianFraudShieldCodes;

    #[test]
    fn test_parses() {
        let r: CrossCoreAPIResponse = serde_json::from_value(experian_cross_core_response(None, None))
            .expect("could not parse experian cross core");

        assert!(r
            .precise_id_response()
            .unwrap()
            .summary
            .unwrap()
            .scores
            .unwrap()
            .precise_id_score
            .is_some());
    }

    #[test]
    fn test_serializes() {
        // test we scrub sensitive data in a hack way
        let response = cross_core_response_with_fraud_shield_codes(
            ExperianAddressAndNameMatchReasonCodes::A1,
            ExperianSSNReasonCodes::EA,
            ExperianWatchlistReasonCodes::R1,
        );
        assert!(response.to_string().contains("BRIAN"));

        let r: CrossCoreAPIResponse =
            serde_json::from_value(response).expect("could not parse experian cross core");

        let s = serde_json::to_value(&r).unwrap().to_string();
        assert!(s.contains("<SCRUBBED>"));
        assert!(!s.contains("BRIAN"))
    }
    #[test]
    fn test_parse_reason_codes_from_cc() {
        let response = cross_core_response_with_fraud_shield_codes(
            ExperianAddressAndNameMatchReasonCodes::A1,
            ExperianSSNReasonCodes::EA,
            ExperianWatchlistReasonCodes::R1,
        );
        let r: CrossCoreAPIResponse =
            serde_json::from_value(response).expect("could not parse experian cross core");

        let fs_matches = r.fraud_shield_reason_codes().unwrap();
        let dob_match = r.dob_match_reason_codes().unwrap();
        let address_and_name_match = r.name_and_address_match_reason_codes().unwrap();
        let ssn_match = r.ssn_match_reason_codes().unwrap();
        let watchlist_match = r.watchlist_match_reason_codes().unwrap();
        let phone_match = r.phone_match_reason_codes().unwrap();

        assert_have_same_elements(fs_matches, vec![ExperianFraudShieldCodes::InputSSNDeceased]);

        assert_eq!(dob_match, ExperianDobMatchReasonCodes::YobOnlyExactMatch);
        assert_eq!(address_and_name_match, ExperianAddressAndNameMatchReasonCodes::A1);
        assert_eq!(ssn_match, ExperianSSNReasonCodes::EA);
        assert_eq!(watchlist_match, ExperianWatchlistReasonCodes::R1);
        assert_eq!(phone_match, ExperianPhoneMatchReasonCodes::EA);

        let response_with_not_parsable_address = cross_core_response_with_fraud_shield_codes(
            ExperianAddressAndNameMatchReasonCodes::DefaultNoMatch,
            ExperianSSNReasonCodes::EA,
            ExperianWatchlistReasonCodes::R1,
        );
        let r2_not_parsable: CrossCoreAPIResponse =
            serde_json::from_value(response_with_not_parsable_address)
                .expect("could not parse experian cross core");
        let address_and_name_match_not_parsable =
            r2_not_parsable.name_and_address_match_reason_codes().unwrap();
        assert_eq!(
            address_and_name_match_not_parsable,
            ExperianAddressAndNameMatchReasonCodes::DefaultNoMatch
        );
    }

    #[test]
    fn test_error_codes() {
        let response = cross_core_response_with_error();
        let r: CrossCoreAPIResponse =
            serde_json::from_value(response).expect("could not parse experian cross core");

        assert_eq!(
            r.error_codes(),
            vec![("709".to_string(), ErrorCode::InvalidUserIdOrPassword)]
        );

        match r.validate() {
            Ok(_) => panic!("should have errored"),
            Err(e) => match e {
                Error::ResponseError(err) => {
                    let CrossCoreResponseError::Error(e, _) = err else {
                        panic!("wrong inner error");
                    };

                    assert_eq!(e, ErrorCode::InvalidUserIdOrPassword)
                }
                wrong_e => panic!("{}", format!("expecting ResponseError, got {:?}", wrong_e)),
            },
        }
    }
}

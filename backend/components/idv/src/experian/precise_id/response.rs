use crate::experian::error::Error as ExperianError;
use newtypes::{
    scrub_pii_value,
    scrub_value,
    ExperianDobMatchReasonCodes,
    ExperianFraudShieldCodes,
    ExperianPhoneMatchReasonCodes,
    ExperianSSNReasonCodes,
    PiiJsonValue,
    ScrubbedPiiString,
};
use std::str::FromStr;

/// This is the top level response from PreciseID (which we receive embedded in the CrossCore API
/// response)
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreciseIDAPIResponse {
    #[serde(rename(deserialize = "sessionID"))]
    pub session_id: Option<String>,
    #[serde(serialize_with = "scrub_pii_value")] // TODO: can we just make all these ScrubbedPiiJsonValue
    pub header: Option<PiiJsonValue>,
    pub summary: Option<Summary>,
    // Gives per-data attribute matching details and summaries
    //
    // Note: this is also where to find
    //   - OFAC
    //   - standardized address
    //   - previous addresses
    //   - ssn finder
    //   - change of address record
    //   - other information about the located individual
    pub precise_match: Option<PreciseMatch>,
    // Unclear if we get this, but just in case
    #[serde(rename(deserialize = "onFileSSN"))]
    #[serde(serialize_with = "scrub_pii_value")]
    pub on_file_ssn: Option<PiiJsonValue>,
    // in the docs this is included but isn't populated yet as it's
    // a future feature. Might as well start recording it
    #[serde(serialize_with = "scrub_pii_value")]
    pub ip_address: Option<PiiJsonValue>,
    // GLB refers to the Gramm-Leach-Bliley Act. Experian uses this terminology
    // to refer to their data around consumers (as opposed to Credit-related-FCRA-regulated data. or
    // something.)
    pub glb_detail: Option<GLBDetail>,

    pub error: Option<Error>,
    pub pidxmlversion: Option<String>,
}

/// Experian uses a variety of fields and values to indicate various scores
#[derive(PartialEq, Eq, Debug)]
pub enum PreciseIDParsedScore {
    Deceased,
    BlockedFile,
    Score(i32),
}

impl PreciseIDAPIResponse {
    // Models return scores in [1,999]. Codes in [9000-9999] are exception codes
    pub fn score(&self) -> Result<PreciseIDParsedScore, ExperianError> {
        let score = self
            .summary
            .as_ref()
            .and_then(|s| s.scores.as_ref())
            .and_then(|sc| sc.precise_id_score.as_ref())
            .ok_or(ExperianError::ScoreNotFound)?;

        let score_from_response = match score.as_str() {
            "9001" => Ok(PreciseIDParsedScore::Deceased),
            "9013" => Ok(PreciseIDParsedScore::BlockedFile),
            "9999" => Err(ExperianError::InvalidScore(
                "missing or invalid input data".into(),
            )),
            s => s
                .parse::<i32>()
                .map(PreciseIDParsedScore::Score)
                .map_err(ExperianError::from),
        }?;

        let score = score_from_response;

        let res = match score {
            PreciseIDParsedScore::Score(i) => {
                // This is found in the v3 Model Governance Doc from https://groups.google.com/a/onefootprint.com/g/vendor-archive/c/F4-foDh5gG8/m/3XTNIyX0CgAJ
                // If we get a score that isn't an exception that's above 999, there's an issue
                if !(0..=999).contains(&i) {
                    Err(ExperianError::InvalidScore("invalid score".to_string()))
                } else {
                    Ok(score)
                }
            }
            _ => Ok(score),
        }?;

        Ok(res)
    }

    pub fn fraud_shield_reason_codes(&self) -> Vec<ExperianFraudShieldCodes> {
        let fs_indicator = self
            .glb_detail
            .as_ref()
            .and_then(|glb| glb.fraud_shield.as_ref())
            .and_then(|fs| fs.indicator.as_ref());
        if let Some(indicators) = fs_indicator {
            indicators.iter().filter_map(|i| {
                i.value.as_ref().and_then(|v| {
                    i.code.as_ref().and_then(|c| {
                        // Experian returns all indicators in the response, so we need to choose which ones are present
                        if v == "Y" {
                            let res = ExperianFraudShieldCodes::from_str(c.as_str().trim());

                            match res {
                                c @ Ok(_) => c.ok(),
                                Err(err) => {
                                    tracing::error!(code=%c, ?err, "could not parse response code for experian");
                                    None
                                }
                            }
                        } else {
                            None
                        }
                    })
                })
            }).collect()
        } else {
            vec![]
        }
    }

    pub fn dob_match_reason_code(&self) -> ExperianDobMatchReasonCodes {
        self.precise_match
            .as_ref()
            .and_then(|pm| pm.date_of_birth.as_ref())
            .and_then(|dob| dob.summary.as_ref())
            .and_then(|summary| summary.match_result.as_ref())
            .and_then(|mr| mr.code.as_ref())
            .and_then(|dob_code| {
                let deser = ExperianDobMatchReasonCodes::try_from(dob_code.as_str().trim());
                match deser {
                    Ok(code) => Some(code),
                    Err(_) => {
                        // not erroring because we expect them
                        log_unknown_match_code(dob_code, "dob");
                        None
                    }
                }
            })
            .unwrap_or(ExperianDobMatchReasonCodes::NoMatch)
    }

    pub fn ssn_match_reason_code(&self) -> ExperianSSNReasonCodes {
        self.precise_match
            .as_ref()
            .and_then(|pm| pm.consumer_id.as_ref())
            .and_then(|ci: &ConsumerIdMatch| ci.summary.as_ref())
            .and_then(|summary| summary.verification_result.as_ref())
            .and_then(|mr| mr.code.as_ref())
            .and_then(|ssn_code| {
                let deser = ExperianSSNReasonCodes::try_from(ssn_code.as_str().trim());
                match deser {
                    Ok(code) => Some(code),
                    Err(_) => {
                        // not erroring because we expect them
                        log_unknown_match_code(ssn_code, "ssn");
                        None
                    }
                }
            })
            .unwrap_or(ExperianSSNReasonCodes::NX)
    }

    pub fn phone_match_reason_code(&self) -> ExperianPhoneMatchReasonCodes {
        self.precise_match
            .as_ref()
            .and_then(|pm| pm.phones.as_ref())
            .and_then(|ps: &PhoneMatch| ps.phone.as_ref())
            .and_then(|pmi| {
                pmi.clone()
                    .first()
                    .and_then(|item| item.summary.as_ref())
                    .and_then(|s| s.verification_result.as_ref())
                    .and_then(|mr| mr.code.as_ref())
                    .and_then(|phone_code| {
                        let deser = ExperianPhoneMatchReasonCodes::try_from(phone_code.as_str().trim());
                        match deser {
                            Ok(code) => Some(code),
                            Err(_) => {
                                // not erroring because we expect them
                                log_unknown_match_code(phone_code, "phone");
                                None
                            }
                        }
                    })
            })
            .unwrap_or(ExperianPhoneMatchReasonCodes::NX)
    }

    pub fn precise_match_version_is_correct(&self) -> bool {
        self.precise_match
            .as_ref()
            .and_then(|pm| pm.version.clone())
            .map(|v| v == "04.00")
            .unwrap_or(false)
    }

    pub fn precise_id_model_version_is_correct(&self) -> bool {
        self.summary
            .as_ref()
            .and_then(|s| s.scores.as_ref())
            .and_then(|scores| scores.precise_id_score_card.clone())
            .map(|v| v == "IDS_V3.0")
            .unwrap_or(false)
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    #[serde(rename(deserialize = "transactionID"))]
    pub transaction_id: Option<String>,
    //   Code indicating the initial disposition of the transaction.
    //       -> Refer to the Precise ID Summary & Appendix (Decision Codes) for a list of generic decision
    // codes. NOTE: This object is not returned for a blocked file (deceased or consumer not found)
    //  See the blocked example in the “Exclusion Conditions” section.
    // 3 character in length
    pub initial_decision: Option<String>,
    // 3 character in length
    pub final_decision: Option<String>,
    pub scores: Option<Scores>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Scores {
    // Overall Precise ID score
    #[serde(rename(deserialize = "preciseIDScore"))]
    pub precise_id_score: Option<String>,
    #[serde(rename(deserialize = "preciseIDScorecard"))]
    pub precise_id_score_card: Option<String>,
    // How closely information provided matches experian data on record
    pub validation_score: Option<String>,
    pub validation_scorecard: Option<String>,
    // Unsure what this does
    pub compliance_indicator: Option<String>,
    pub compliance_description: Option<String>,
    // Most Likely Fraud Type object (High- Risk Fraud Classification)
    pub most_likely_fraud_type: Option<serde_json::Value>,
    pub reasons: Option<Vec<ValueCodeDatum>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Error {
    pub report_date: Option<String>,
    pub report_time: Option<String>,
    pub error_code: Option<String>,
    pub error_description: Option<String>,
    pub action_indicator: Option<ValueCodeDatum>,
    pub reference_number: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValueCodeDatum {
    pub value: Option<String>,
    pub code: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GLBDetail {
    pub fraud_shield: Option<FraudShieldIndicator>,
    pub glb_rules: Option<GLBRule>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudShieldIndicator {
    pub indicator: Option<Vec<ValueCodeDatum>>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GLBRule {
    pub glb_rule: Option<Vec<ValueCodeDatum>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreciseMatch {
    pub version: Option<String>,
    pub response_status_code: Option<serde_json::Value>,
    #[serde(rename(deserialize = "preciseMatchTransactionID"))]
    pub precise_match_transaction_id: Option<String>,
    pub precise_match_score: Option<serde_json::Value>,
    #[serde(serialize_with = "scrub_value")]
    pub precise_match_decision: Option<serde_json::Value>,
    // get this from cross core
    #[serde(serialize_with = "scrub_pii_value")]
    pub addresses: Option<PiiJsonValue>,
    pub phones: Option<PhoneMatch>,
    #[serde(rename(deserialize = "consumerID"))]
    pub consumer_id: Option<ConsumerIdMatch>,
    // get this from cross core
    pub date_of_birth: Option<DateOfBirthMatch>,
    pub driver_license: Option<PiiJsonValue>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub change_of_addresses: Option<PiiJsonValue>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub ofac: Option<PiiJsonValue>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub previous_addresses: Option<PiiJsonValue>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub ssn_finder: Option<PiiJsonValue>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsumerIdMatch {
    pub summary: Option<ConsumerIdMatchSummary>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub detail: Option<PiiJsonValue>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsumerIdMatchSummary {
    pub verification_result: Option<ValueCodeDatum>,
    pub deceased_result: Option<ValueCodeDatum>,
    pub format_result: Option<ValueCodeDatum>,
    pub issue_result: Option<ValueCodeDatum>,
    pub counts: Option<serde_json::Value>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DateOfBirthMatch {
    pub summary: Option<DateOfBirthMatchSummary>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DateOfBirthMatchSummary {
    pub match_result: Option<ValueCodeDatum>,
    pub month_of_birth: Option<ScrubbedPiiString>,
    pub day_of_birth: Option<ScrubbedPiiString>,
    pub year_of_birth: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneMatch {
    pub phone: Option<Vec<PhoneMatchItem>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneMatchItem {
    pub summary: Option<PhoneMatchItemSummary>,
    // has a lot of good stuff in here we could potentially use
    #[serde(serialize_with = "scrub_pii_value")]
    pub detail: Option<PiiJsonValue>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneMatchItemSummary {
    pub verification_result: Option<ValueCodeDatum>,
    pub classification: Option<ValueCodeDatum>,
    pub high_risk_result: Option<ValueCodeDatum>,
    pub counts: Option<serde_json::Value>,
}

pub(crate) fn log_unknown_match_code(code: &str, attribute: &str) {
    tracing::error!(attribute=%attribute, code=%code, "Unknown match code received")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::experian::error::Error as ExperianError;
    use crate::test_fixtures::experian_precise_id_response;
    use test_case::test_case;

    #[test_case("656" => PreciseIDParsedScore::Score(656))]
    #[test_case("9001" => PreciseIDParsedScore::Deceased)]
    #[test_case("9013" => PreciseIDParsedScore::BlockedFile)]
    fn test_score_success(score: &str) -> PreciseIDParsedScore {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response(score, None, None, None))
                .expect("could not parse experian precise id");

        r.score().unwrap()
    }

    #[test_case("1000" => "invalid score".to_string())]
    #[test_case("9999" => "missing or invalid input data".to_string())]
    fn test_score_errors(score: &str) -> String {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response(score, None, None, None))
                .expect("could not parse experian precise id");

        match r.score() {
            Ok(_) => panic!("should have failed"),
            Err(e) => match e {
                ExperianError::InvalidScore(p) => p,
                _ => panic!("wrong error returned"),
            },
        }
    }
    #[test]
    fn test_parses() {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response("656", None, None, None))
                .expect("could not parse experian precise id");
        let pm = r.precise_match.unwrap();
        assert!(pm.clone().consumer_id.unwrap().summary.is_some());
        assert!(pm.phones.unwrap().phone.unwrap().pop().unwrap().summary.is_some());
    }

    #[test_case("02.00" => false)]
    #[test_case("04.00" => true)]
    fn test_precise_match_version(version: &str) -> bool {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response("656", Some(version), None, None)).unwrap();

        r.precise_match_version_is_correct()
    }

    #[test_case("bad model" => false)]
    #[test_case("IDS_V3.0" => true)]
    fn test_precise_id_model_score(version: &str) -> bool {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response("656", None, Some(version), None)).unwrap();

        r.precise_id_model_version_is_correct()
    }
}

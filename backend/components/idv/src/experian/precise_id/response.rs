use std::str::FromStr;

use newtypes::ExperianFraudShieldCodes;

use crate::experian::error::Error as ExperianError;

/// This is the top level response from PreciseID (which we receive embedded in the CrossCore API response)
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreciseIDAPIResponse {
    #[serde(rename(deserialize = "sessionID"))]
    pub session_id: Option<String>,
    pub header: Option<serde_json::Value>,
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
    pub precise_match: Option<serde_json::Value>,
    // Unclear if we get this, but just in case
    #[serde(rename(deserialize = "onFileSSN"))]
    pub on_file_ssn: Option<serde_json::Value>,
    // in the docs this is included but isn't populated yet as it's
    // a future feature. Might as well start recording it
    pub ip_address: Option<serde_json::Value>,
    // GLB refers to the Gramm-Leach-Bliley Act. Experian uses this terminology
    // to refer to their data around consumers (as opposed to Credit-related-FCRA-regulated data. or something.)
    pub glb_detail: Option<GLBDetail>,

    pub error: Option<Error>,
    pub pidxmlversion: Option<String>,
}

/// Experian uses a variety of fields and values to indicate various scores
#[derive(PartialEq, Eq, Debug)]
pub enum PreciseIDParsedScore {
    ConsumerNotFound,
    Deceased,
    BlockedFile,
    Score(i32),
}

impl PreciseIDAPIResponse {
    // Models return scores in [1,999]. Codes in [9000-9999] are exception codes
    pub fn score(&self) -> Result<PreciseIDParsedScore, ExperianError> {
        let consumer_not_found = self
            .glb_detail
            .as_ref()
            .map(|detail| detail.consumer_not_found())
            .unwrap_or(false);

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

        if consumer_not_found {
            Ok(PreciseIDParsedScore::ConsumerNotFound)
        } else {
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
                            let res = ExperianFraudShieldCodes::from_str(c.as_str());

                            match res {
                                c @ Ok(_) => c.ok(),
                                Err(e) => {
                                    tracing::error!(code=%c, err=%e, "could not parse response code for experian");
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
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    #[serde(rename(deserialize = "transactionID"))]
    pub transaction_id: Option<String>,
    //   Code indicating the initial disposition of the transaction.
    //       -> Refer to the Precise ID Summary & Appendix (Decision Codes) for a list of generic decision codes.
    // NOTE: This object is not returned for a blocked file (deceased or consumer not found)
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
impl GLBDetail {
    pub fn consumer_not_found(&self) -> bool {
        // Occasionally, an inquiry to Experian’s credit files results in a “not found” condition. This condition is identified by the GLB Shared Application Rule 3001 (Consumer Not Found on File One)
        self.glb_rules
            .as_ref()
            .and_then(|rules| rules.glb_rule.as_ref())
            .map(|rule| rule.iter().any(|r| r.code == Some("3001".to_string())))
            .unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::experian::error::Error as ExperianError;
    use crate::test_fixtures::experian_precise_id_response;
    use test_case::test_case;

    #[test_case(false, "656" => PreciseIDParsedScore::Score(656))]
    #[test_case(true, "656" => PreciseIDParsedScore::ConsumerNotFound)]
    #[test_case(false, "9001" => PreciseIDParsedScore::Deceased)]
    #[test_case(false, "9013" => PreciseIDParsedScore::BlockedFile)]
    fn test_score_success(consumer_not_found: bool, score: &str) -> PreciseIDParsedScore {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response(consumer_not_found, score))
                .expect("could not parse experian precise id");

        r.score().unwrap()
    }

    #[test_case(false, "1000" => "invalid score".to_string())]
    #[test_case(false, "9999" => "missing or invalid input data".to_string())]
    fn test_score_errors(consumer_not_found: bool, score: &str) -> String {
        let r: PreciseIDAPIResponse =
            serde_json::from_value(experian_precise_id_response(consumer_not_found, score))
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
        let r: PreciseIDAPIResponse = serde_json::from_value(experian_precise_id_response(false, "656"))
            .expect("could not parse experian precise id");

        assert!(r.precise_match.is_some());
    }
}

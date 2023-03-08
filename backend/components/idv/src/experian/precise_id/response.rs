/// This is the top level response from PreciseID (which we receive embedded in the CrossCore API response)
#[derive(Debug, Clone, serde::Deserialize)]
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
    pub glb_detail: Option<serde_json::Value>,
    pub error: Option<Error>,
    pub pidxmlversion: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
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

#[derive(Debug, Clone, serde::Deserialize)]
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
    pub reasons: Option<Vec<ScoreReason>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoreReason {
    pub value: Option<String>,
    // Reason codes are returned for V3 Models; however, the 5th Reason is always returned as emtpy. Refer to the Precise ID Summary & Appendix (Reason Codes – Version 3 Model Codes – V3 ID Screening Model Codes) for a list of available codes.
    pub code: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Error {
    pub report_date: Option<String>,
    pub report_time: Option<String>,
    pub error_code: Option<String>,
    pub error_description: Option<String>,
    pub action_indicator: Option<ActionIndicator>,
    pub reference_number: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionIndicator {
    pub value: Option<String>,
    pub code: Option<String>,
}

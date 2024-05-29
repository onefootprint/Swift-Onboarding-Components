/// The experian enum lists are numerous and large.
///
/// As of 2023-03-08:
///   - we don't have a need to parse the response into a structured format
///   - it's unclear if the enums will change
///   - it's unclear if the docs represent the enums correctly
///
/// so we'll keep only the enums required for requests around, and deal with the response enums as
/// we need to

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TypeOfPerson {
    Applicant,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum PersonNameType {
    Current,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AddressType {
    Current,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DocumentType {
    Ssn,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]

pub enum ApplicantType {
    // 2023-02-23 just using this one, but others kept around
    Applicant,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
pub enum ProductOptions {
    #[strum(serialize = "1")]
    IDScreeningScore,
}

// The following is a list of the decision codes that can be returned from the Precise ID
// application. Due to
#[derive(Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq)]
pub enum DecisionCodes {
    // Accept
    #[strum(
        serialize = "ACC",
        serialize = "ACCEPT",
        serialize = "accept",
        serialize = "acc"
    )]
    Accept,
    // Refer
    #[strum(serialize = "REF")]
    Refer,
    // Highest Priority Referral R10 Priority 10 Referral
    #[strum(serialize = "R01")]
    HighestPriorityReferral,
    //  Priority 20 Referral
    #[strum(serialize = "R20")]
    R20Referral,
    //  Priority 30 Referral
    #[strum(serialize = "R30")]
    R30Referral,
    //  Priority 40 Referral
    #[strum(serialize = "R40")]
    R40Referral,
    // Priority 50 Referral
    #[strum(serialize = "R50")]
    R50Referral,
    // Priority 60 Referral
    #[strum(serialize = "R60")]
    R60Referral,
    // Priority 70 Referral
    #[strum(serialize = "R70")]
    R70Referral,
    // Priority 80 Referral
    #[strum(serialize = "R80")]
    R80Referral,
    // Priority 90 Referral
    #[strum(serialize = "R90")]
    R90Referral,
    // Lowest Priority Referral
    #[strum(serialize = "R99")]
    LowPriorityReferral,
    // No Decision
    #[strum(serialize = "XXX")]
    NoDecision,
    // Indicates we have a new decision code
    CodeNotFound,
}

#[derive(
    Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize,
)]
pub enum ResponseCode {
    // JSON request has invalid fields.
    #[serde(rename = "R0105")]
    InvalidJson,
    // An error occurred. Please see log file for de- tails.
    #[serde(rename = "R0110")]
    ErrorOccurred,
    //  Wrong clientId .
    #[serde(rename = "R0111")]
    WrongClientId,
    // Workflow complete. Note: This code may indicate an unknown mapper when a responseCode of Error is
    // returned.
    #[serde(rename = "R0201")]
    WorkflowComplete,
    //  Workflow paused.
    #[serde(rename = "R0202")]
    WorkflowPaused,
    //  The message is outdated.
    #[serde(rename = "R0203")]
    MessageOutdated,
    //  Undefined scenario. Verify that the request- Type value matches the solution.
    #[serde(rename = "R0205")]
    UndefinedScenario,
    //  Undefined strategy return.
    #[serde(rename = "R0206")]
    UndefinedStrategyReturn,
    //  CrossCore configuration is missing.
    #[serde(rename = "R0207")]
    CrossCoreConfigurationMissing,
    //  Indicates that following a pause, the workflow cannot be completed because the resume point (i.e.,
    // sequenceId) cannot be found. Check your CrossCore configuration file to make sure that the target
    // sequenceId ex- ists, and that the sequenceId returned by the pauseScript matches the target
    // sequenceId .
    #[serde(rename = "R0208")]
    WorflowCannotBecompletedAfterPause,
}

use crate::ExperianFraudShieldCodes;

/// The experian enum lists are numerous and large.
///
/// As of 2023-03-08:
///   - we don't have a need to parse the response into a structured format
///   - it's unclear if the enums will change
///   - it's unclear if the docs represent the enums correctly
///   
/// so we'll keep only the enums required for requests around, and deal with the response enums as we need to

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

// The following is a list of the decision codes that can be returned from the Precise ID application.
// Due to
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
    // Workflow complete. Note: This code may indicate an unknown mapper when a responseCode of Error is returned.
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
    //  Indicates that following a pause, the workflow cannot be completed because the resume point (i.e., sequenceId) cannot be found. Check your CrossCore configuration file to make sure that the target sequenceId ex- ists, and that the sequenceId returned by the pauseScript matches the target sequenceId .
    #[serde(rename = "R0208")]
    WorflowCannotBecompletedAfterPause,
}

#[derive(strum::Display, Debug, strum::EnumString, Eq, PartialEq)]
pub enum CrossCoreMatchNames {
    #[strum(serialize = "pmAddressVerificationResult1")]
    AddressVerificationMatchResult,
    #[strum(serialize = "pmPhoneVerificationResult1")]
    PhoneVerificationMatchResult,
    #[strum(serialize = "pmConsumerIDVerificationResult")]
    ConsumerIdMatchResult,
    #[strum(serialize = "pmDateOfBirthMatchResult")]
    DobMatchResult,
    #[strum(serialize = "pmDriverLicenseVerificationResult")]
    DriverLicenseVerificationResult,
    #[strum(serialize = "pmChangeOfAddressVerificationResult1")]
    ChangeOfAddressVerificationResult,
    #[strum(serialize = "pmOFACVerificationResult")]
    WatchlistVerificationResult,
    #[strum(serialize = "glbFSIndicator01")]
    FSIndicator01,
    #[strum(serialize = "glbFSIndicator02")]
    FSIndicator02,
    #[strum(serialize = "glbFSIndicator03")]
    FSIndicator03,
    #[strum(serialize = "glbFSIndicator04")]
    FSIndicator04,
    #[strum(serialize = "glbFSIndicator05")]
    FSIndicator05,
    #[strum(serialize = "glbFSIndicator06")]
    FSIndicator06,
    #[strum(serialize = "glbFSIndicator10")]
    FSIndicator10,
    #[strum(serialize = "glbFSIndicator11")]
    FSIndicator11,
    #[strum(serialize = "glbFSIndicator13")]
    FSIndicator13,
    #[strum(serialize = "glbFSIndicator14")]
    FSIndicator14,
    #[strum(serialize = "glbFSIndicator15")]
    FSIndicator15,
    #[strum(serialize = "glbFSIndicator16")]
    FSIndicator16,
    #[strum(serialize = "glbFSIndicator17")]
    FSIndicator17,
    #[strum(serialize = "glbFSIndicator18")]
    FSIndicator18,
    #[strum(serialize = "glbFSIndicator21")]
    FSIndicator21,
    #[strum(serialize = "glbFSIndicator25")]
    FSIndicator25,
    #[strum(serialize = "glbFSIndicator26")]
    FSIndicator26,
    Unknown(String),
}

impl From<CrossCoreMatchNames> for Option<ExperianFraudShieldCodes> {
    fn from(value: CrossCoreMatchNames) -> Self {
        // Note: there are some addition FS indicators that don't get returned in precise ID requests, and this is because
        // precise ID is GLB (e.g. non-credit) and those indicators are related to credit
        match value {
            CrossCoreMatchNames::AddressVerificationMatchResult => None,
            CrossCoreMatchNames::PhoneVerificationMatchResult => None,
            CrossCoreMatchNames::ConsumerIdMatchResult => None,
            CrossCoreMatchNames::DobMatchResult => None,
            CrossCoreMatchNames::DriverLicenseVerificationResult => None,
            CrossCoreMatchNames::ChangeOfAddressVerificationResult => None,
            CrossCoreMatchNames::WatchlistVerificationResult => None,
            CrossCoreMatchNames::FSIndicator01 => Some(ExperianFraudShieldCodes::InputAddressConflict),
            CrossCoreMatchNames::FSIndicator02 => {
                Some(ExperianFraudShieldCodes::InputAddressFirstResponseRecently)
            }
            CrossCoreMatchNames::FSIndicator03 => Some(ExperianFraudShieldCodes::InputAddressNotOnFile),
            CrossCoreMatchNames::FSIndicator04 => {
                Some(ExperianFraudShieldCodes::InputSSNIssueDataCannotBeVerified)
            }
            CrossCoreMatchNames::FSIndicator05 => Some(ExperianFraudShieldCodes::InputSSNDeceased),
            CrossCoreMatchNames::FSIndicator06 => Some(ExperianFraudShieldCodes::InputAgeYoungerThanSSN),
            CrossCoreMatchNames::FSIndicator10 => Some(ExperianFraudShieldCodes::InputAddressAlert),
            CrossCoreMatchNames::FSIndicator11 => Some(ExperianFraudShieldCodes::InputAddressNonResidential),
            CrossCoreMatchNames::FSIndicator13 => {
                Some(ExperianFraudShieldCodes::InputAddressProbablyBelongsToAnother)
            }
            CrossCoreMatchNames::FSIndicator14 => Some(ExperianFraudShieldCodes::InputSSNFormatInvalid),
            CrossCoreMatchNames::FSIndicator15 => Some(ExperianFraudShieldCodes::InputAddressCautious),
            CrossCoreMatchNames::FSIndicator16 => Some(ExperianFraudShieldCodes::LocatedAddressAlert),
            CrossCoreMatchNames::FSIndicator17 => {
                Some(ExperianFraudShieldCodes::LocatedAddressNonResidential)
            }
            CrossCoreMatchNames::FSIndicator18 => Some(ExperianFraudShieldCodes::LocatedAddressCautious),
            // As of April 15, 2022, Fraud Shield 21 (Telephone Number Inconsistent w/ Address) will be deprecated and no longer be active
            // but is still returned
            CrossCoreMatchNames::FSIndicator21 => None,
            CrossCoreMatchNames::FSIndicator25 => Some(ExperianFraudShieldCodes::BestLocatedSSNDeceased),
            CrossCoreMatchNames::FSIndicator26 => {
                Some(ExperianFraudShieldCodes::BestLocatedSSNCannotBeVerified)
            }
            CrossCoreMatchNames::Unknown(_) => None,
        }
    }
}

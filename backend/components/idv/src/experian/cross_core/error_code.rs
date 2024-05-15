use strum::Display;
use strum_macros::EnumString;

#[derive(EnumString, Display, PartialEq, Eq, Debug, Clone)]
pub enum ErrorCode {
    #[strum(serialize = "010", to_string = "ConsumerIsMinor")]
    ConsumerIsMinor,
    #[strum(serialize = "013", to_string = "FormatError")]
    FormatError,
    #[strum(
        serialize = "018",
        to_string = "InformationOnInquiryReportedAsFraudByConsumer"
    )]
    InformationOnInquiryReportedAsFraudByConsumer,
    #[strum(serialize = "045", serialize = "106", to_string = "InvalidSurname")]
    InvalidSurname,
    #[strum(serialize = "049", to_string = "CurrentZipCodeError")]
    CurrentZipCodeError,
    #[strum(serialize = "092", to_string = "StateRequiresMoreInfoForMatch")]
    StateRequiresMoreInfoForMatch,
    #[strum(serialize = "258", to_string = "ResubmitLater")]
    ResubmitLater,
    #[strum(serialize = "259", to_string = "ResubmitCheckpointSystem")]
    ResubmitCheckpointSystem,
    #[strum(serialize = "304", to_string = "NFDUnavailable")]
    NFDUnavailable,
    #[strum(serialize = "313", to_string = "NFDNotColoradoZip")]
    NFDNotColoradoZip,
    #[strum(serialize = "323", to_string = "NotEnoughInfoForExperianDetect")]
    NotEnoughInfoForExperianDetect,
    #[strum(serialize = "324", to_string = "ExperianDetectNotAvailable")]
    ExperianDetectNotAvailable,
    #[strum(serialize = "352", to_string = "PreciseIdNotAvailable")]
    PreciseIdNotAvailable,
    #[strum(serialize = "358", to_string = "FraudShieldNotAvailable")]
    FraudShieldNotAvailable,
    #[strum(serialize = "362", to_string = "CreditReportingNotAvailable")]
    CreditReportingNotAvailable,
    #[strum(serialize = "388", to_string = "InvalidPreambleForSubcode")]
    InvalidPreambleForSubcode,
    #[strum(serialize = "403", to_string = "SsnRequiredToAccessConsumerFile")]
    SsnRequiredToAccessConsumerFile,
    #[strum(serialize = "404", to_string = "GenerationCodeRequiredToAccessConsumerFile")]
    GenerationCodeRequiredToAccessConsumerFile,
    #[strum(serialize = "405", to_string = "YobRequiredToAccessConsumerFile")]
    YobRequiredToAccessConsumerFile,
    #[strum(serialize = "406", to_string = "MiddleNameRequiredToAccessConsumerFile")]
    MiddleNameRequiredToAccessConsumerFile,
    #[strum(serialize = "407", to_string = "CannotStandardizeAddress")]
    CannotStandardizeAddress,
    #[strum(serialize = "627", to_string = "InvalidStreetAddressFiled")]
    InvalidStreetAddressFiled,
    #[strum(serialize = "633", to_string = "CurrentAddressExceedsMaxLength")]
    CurrentAddressExceedsMaxLength,
    #[strum(serialize = "708", to_string = "InputValidationError")]
    InputValidationError,
    #[strum(serialize = "709", to_string = "InvalidUserIdOrPassword")]
    InvalidUserIdOrPassword,
    #[strum(serialize = "710", to_string = "KiqSessionTimeout")]
    KiqSessionTimeout,
    #[strum(serialize = "711", to_string = "EndUserRequired")]
    EndUserRequired,
    #[strum(serialize = "720", to_string = "OtherPreciseIdError")]
    OtherPreciseIdError,
    #[strum(default)]
    Other(String),
}


#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::ErrorCode;
    use test_case::test_case;
    #[test_case(
        "018",
        ErrorCode::InformationOnInquiryReportedAsFraudByConsumer,
        "InformationOnInquiryReportedAsFraudByConsumer"
    )]
    fn test_serialize(s: &str, expected_enum: ErrorCode, expected_ser: &str) {
        let deser = ErrorCode::from_str(s).unwrap();
        assert_eq!(deser, expected_enum);
        assert_eq!(deser.to_string(), String::from(expected_ser));
    }
}

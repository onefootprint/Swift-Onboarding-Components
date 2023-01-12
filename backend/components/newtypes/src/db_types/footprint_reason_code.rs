use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::SignalScope;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    JsonSchema,
    PartialEq,
    Eq,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum FootprintReasonCode {
    // TODO these are just test values
    SubjectDeceased,
    SsnIssuedPriorToDob,
    MobileNumber,
    CorporateEmailDomain,
    SsnDoesNotMatchWithinTolerance,
    LastNameDoesNotMatch,
}
crate::util::impl_enum_str_diesel!(FootprintReasonCode);

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum SignalSeverity {
    Low,
    Medium,
    High,
}

impl FootprintReasonCode {
    pub fn scopes(&self) -> Vec<SignalScope> {
        match self {
            Self::SubjectDeceased => vec![SignalScope::Identity],
            Self::SsnIssuedPriorToDob => vec![SignalScope::Ssn],
            Self::MobileNumber => vec![SignalScope::PhoneNumber],
            Self::CorporateEmailDomain => vec![SignalScope::Email],
            Self::SsnDoesNotMatchWithinTolerance => vec![SignalScope::Ssn],
            Self::LastNameDoesNotMatch => vec![SignalScope::Name],
        }
    }

    pub fn description(&self) -> String {
        match self {
            Self::SubjectDeceased => "Records indicate that the subject in question is deceased.",
            Self::SsnIssuedPriorToDob => "This indicates that the SSN number was issued before the individual’s DOB, a serious fraud flag.",
            Self::MobileNumber =>  "The consumer's phone number is possibly a wireless mobile number.",
            Self::CorporateEmailDomain =>  "Indicates that the domain of the email address has been identified as belonging to a corporate entity.",
            Self::SsnDoesNotMatchWithinTolerance => "This indicates a discrepancy of one digit between the SSN submitted and the SSN located. If the SSN submitted is off by one digit from the located SSN, the ID Note is presented.",
            Self::LastNameDoesNotMatch => "This indicates that the located last name does not match the input last name.",
            
            
        }.to_owned()
    }

    pub fn severity(&self) -> SignalSeverity {
        match self {
            Self::SubjectDeceased => SignalSeverity::High,
            Self::SsnIssuedPriorToDob => SignalSeverity::High,
            Self::MobileNumber => SignalSeverity::Low,
            Self::CorporateEmailDomain => SignalSeverity::Low,
            Self::SsnDoesNotMatchWithinTolerance => SignalSeverity::Medium,
            Self::LastNameDoesNotMatch => SignalSeverity::Medium,            
        }
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::SignalSeverity;
    use std::cmp::Ordering;

    #[test_case(SignalSeverity::Low, SignalSeverity::High => Ordering::Less)]
    #[test_case(SignalSeverity::Low, SignalSeverity::Medium => Ordering::Less)]
    #[test_case(SignalSeverity::Medium, SignalSeverity::High => Ordering::Less)]
    fn test_cmp_signal_severity(s1: SignalSeverity, s2: SignalSeverity) -> Ordering {
        // Test ordering since we rely on it to sort risk signals
        s1.cmp(&s2)
    }
}

use crate::IdentityDataKind as IDK;
use serde::Serialize;
use strum::EnumIter;


#[derive(Clone, Copy, Serialize, Debug, EnumIter)]
pub enum SentilinkProduct {
    #[serde(rename = "sentilink_synthetic_score")]
    SyntheticScore,
    #[serde(rename = "sentilink_id_theft_score")]
    IdTheftScore,
}

impl SentilinkProduct {
    // These are the strict minimums from sentilink
    // We check our "minimum required to use Sentilink" at the VerificationCheck level
    pub fn required_identity_data_kinds(&self) -> Vec<IDK> {
        match self {
            SentilinkProduct::SyntheticScore => {
                vec![
                    IDK::FirstName,
                    IDK::LastName,
                    IDK::Dob,
                    IDK::AddressLine1,
                    IDK::City,
                    IDK::State,
                    IDK::Zip,
                    IDK::Ssn9,
                ]
            }
            SentilinkProduct::IdTheftScore => {
                vec![
                    IDK::FirstName,
                    IDK::LastName,
                    IDK::Dob,
                    IDK::AddressLine1,
                    IDK::City,
                    IDK::State,
                    IDK::Zip,
                    IDK::PhoneNumber,
                ]
            }
        }
    }
}

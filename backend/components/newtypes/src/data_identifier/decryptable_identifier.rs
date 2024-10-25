use crate::DataIdentifier;
use crate::DataLifetimeSeqno;
use itertools::Itertools;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use std::fmt::Display;
use std::str::FromStr;

#[derive(Debug, Clone, Hash, Eq, PartialEq, DeserializeFromStr, SerializeDisplay)]
pub struct VersionedDataIdentifier {
    pub di: DataIdentifier,
    pub version: Option<DataLifetimeSeqno>,
}

impl VersionedDataIdentifier {
    /// Create a new VersionedDataIdentifier with no version
    pub fn new(di: DataIdentifier) -> Self {
        Self { di, version: None }
    }
}

impl From<DataIdentifier> for VersionedDataIdentifier {
    fn from(di: DataIdentifier) -> Self {
        Self::new(di)
    }
}

// For now, we don't want to expose VersionedDI in the api docs, so just pass through to the DI
// implementation
impl paperclip::v2::schema::Apiv2Schema for VersionedDataIdentifier {
    fn name() -> Option<String> {
        DataIdentifier::name()
    }

    fn description() -> &'static str {
        DataIdentifier::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        DataIdentifier::raw_schema()
    }
}
impl paperclip::actix::OperationModifier for VersionedDataIdentifier {}

#[derive(Debug, Clone, thiserror::Error)]
pub enum VersionedDataIdentifierError {
    #[error("Cannot parse version: {0}")]
    CannotParseVersion(String),
    #[error("No data identifier provided: {0}")]
    NoDi(String),
    #[error("No version provided: {0}")]
    NoVersion(String),
    #[error("Must provide versioned identifier in the format \"{{identifier}}:{{version}}\"")]
    InvalidFormat,
    #[error("Version must be a positive integer")]
    InvalidVersion,
}

impl FromStr for VersionedDataIdentifier {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if !s.contains(':') {
            let di = DataIdentifier::from_str(s)?;
            Ok(Self { di, version: None })
        } else {
            let parts = s.split(':').collect_vec();
            if parts.len() > 2 {
                return Err(VersionedDataIdentifierError::InvalidFormat.into());
            }
            let di = parts
                .first()
                .ok_or_else(|| VersionedDataIdentifierError::NoDi(s.to_owned()))?;
            let version = parts
                .get(1)
                .ok_or_else(|| VersionedDataIdentifierError::NoVersion(s.to_owned()))?;
            let di = DataIdentifier::from_str(di)?;
            let version = DataLifetimeSeqno::from_str(version)
                .map_err(|_| VersionedDataIdentifierError::CannotParseVersion((*version).to_string()))?;
            if version < DataLifetimeSeqno::from(0) {
                return Err(VersionedDataIdentifierError::InvalidVersion.into());
            }
            Ok(Self {
                di,
                version: Some(version),
            })
        }
    }
}

impl Display for VersionedDataIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.version {
            Some(version) => write!(f, "{}:{}", self.di, version),
            None => write!(f, "{}", self.di),
        }
    }
}

#[cfg(test)]
mod test {
    use super::VersionedDataIdentifier;
    use crate::DataLifetimeSeqno;
    use crate::IdentityDataKind as IDK;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case("id.ssn9:1234" => Some(VersionedDataIdentifier{di: IDK::Ssn9.into(), version: Some(DataLifetimeSeqno::from(1234))}))]
    #[test_case("id.ssn9:-1234" => None)]
    #[test_case("id.ssn9:\"123\"" => None)]
    #[test_case("id.ssn9:1234.5" => None)]
    #[test_case("id.ssn9:1234:1234" => None)]
    #[test_case("id.flerp:1234" => None)]
    fn test_parse(value: &str) -> Option<VersionedDataIdentifier> {
        VersionedDataIdentifier::from_str(value).ok()
    }

    #[test_case(VersionedDataIdentifier{di: IDK::Ssn9.into(), version: Some(DataLifetimeSeqno::from(1234))} => "id.ssn9:1234".to_owned())]
    fn test_display(value: VersionedDataIdentifier) -> String {
        format!("{}", value)
    }
}

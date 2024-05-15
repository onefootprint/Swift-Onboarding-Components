use std::str::FromStr;

use diesel::{deserialize::FromSqlRow, expression::AsExpression, sql_types::Text};
use strum::{EnumIter, EnumString};

use crate::{
    fingerprinter::GlobalFingerprintKind, util::impl_enum_string_diesel, DataIdentifier,
    IdentityDataKind as IDK, ValidationError,
};


#[derive(Debug, Clone, derive_more::From, AsExpression, FromSqlRow)]
#[diesel(sql_type = Text)]
pub enum FingerprintKind {
    Composite(CompositeFingerprintKind),
    DI(DataIdentifier),
}

impl_enum_string_diesel!(FingerprintKind);

impl FingerprintKind {
    pub fn is_fingerprintable(&self) -> bool {
        match self {
            Self::Composite(_) => true,
            Self::DI(di) => di.is_fingerprintable(),
        }
    }

    /// Returns true if the FingerprintKind can be globally fingerprinted (vs tenant-scoped)
    pub fn is_globally_fingerprintable(&self) -> bool {
        match self {
            Self::Composite(_) => true,
            Self::DI(di) => GlobalFingerprintKind::try_from(di).is_ok(),
        }
    }

    pub fn store_plaintext(&self) -> bool {
        match self {
            Self::Composite(_) => false,
            Self::DI(di) => di.store_plaintext(),
        }
    }
}

impl DataIdentifier {
    /// Returns true if the DI can be fingerprinted. Will automatically fingerprint non-document
    /// data with these types when added to the vault
    pub fn is_fingerprintable(&self) -> bool {
        Self::searchable().contains(self)
    }
}

impl FromStr for FingerprintKind {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if let Ok(kind) = CompositeFingerprintKind::from_str(s) {
            return Ok(Self::Composite(kind));
        }
        if let Ok(kind) = DataIdentifier::from_str(s) {
            return Ok(Self::DI(kind));
        }
        Err(ValidationError(&format!("Cannot parse FingerprintKind: {}", s)).into())
    }
}

impl std::fmt::Display for FingerprintKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            FingerprintKind::Composite(cfk) => write!(f, "{}", cfk),
            FingerprintKind::DI(di) => write!(f, "{}", di),
        }
    }
}

#[derive(Debug, Clone, strum_macros::Display, EnumIter, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum CompositeFingerprintKind {
    #[strum(serialize = "composite.name_dob")]
    NameDob,
}

impl CompositeFingerprintKind {
    pub fn data_identifiers(&self) -> Vec<DataIdentifier> {
        match self {
            Self::NameDob => vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Dob.into()],
        }
    }
}

use itertools::{chain, Itertools};
use strum::{EnumIter, IntoEnumIterator};

use crate::{BusinessDataKind as BDK, DataIdentifier, FingerprintScope, IdentityDataKind as IDK, TenantId};

impl DataIdentifier {
    /// Given a DataIdentifier and its corresponding data, returns the fingerprintable payloads
    /// that will be sent to the enclave
    pub fn get_fingerprint_payload<'a, T: Copy>(
        &'a self,
        v: T,
        tenant_id: Option<&'a TenantId>,
    ) -> Vec<(FingerprintSalt, T)> {
        let tenant_salt = self
            .is_fingerprintable()
            .then_some(tenant_id)
            .flatten()
            .map(|t_id| FingerprintSalt::Tenant(self.clone(), t_id.clone()));
        // Generate a tenant-scoped fingerprint and globally-scoped fingerprint (if possible)
        let global_salt = GlobalFingerprintKind::try_from(self)
            .ok()
            .map(FingerprintSalt::from);
        // Generate a fingerprint for use to compute a composite fingerprint, but don't save it to the DB
        let partial_salt = PartialFingerprintKind::try_from(self)
            .ok()
            .map(FingerprintSalt::from);
        chain!(global_salt, tenant_salt, partial_salt)
            .map(|scope| (scope, v))
            .collect_vec()
    }
}

/// Each unique salt essentially builds a unique space of fingerprints.
/// This allows us to make tenant-scoped fingerprints and globally-scoped fingerprints
#[derive(Debug, Clone, derive_more::From, Eq, PartialEq, Hash)]
pub enum FingerprintSalt {
    /// Searchable across all tenants
    Global(GlobalFingerprintKind),
    /// Searchable within a tenant
    Tenant(DataIdentifier, TenantId),
    /// Represents pieces of data that are fingerprinted in order to build a composite fingerprint.
    /// These are not saved to the database.
    Partial(PartialFingerprintKind),
}

impl FingerprintSalt {
    const PARTIAL_FINGERPRINT_SALT: &'static [u8] = &[112, 97, 114, 116, 105, 97, 108];

    /// The fingerprint scope is used to salt fingerprints in the enclave.
    /// This returns the salt we send to the enclave when generating fingerprints.
    pub fn salt_bytes(&self) -> Vec<u8> {
        match self {
            Self::Global(s) => crypto::sha256(s.di().to_string().as_bytes()).to_vec(),
            Self::Partial(s) => {
                crypto::sha256(&[s.di().to_string().as_bytes(), Self::PARTIAL_FINGERPRINT_SALT].concat())
                    .to_vec()
            }
            Self::Tenant(di, tenant_id) => crypto::sha256(
                &[
                    crypto::sha256(di.to_string().as_bytes()),
                    crypto::sha256(tenant_id.to_string().as_bytes()),
                ]
                .concat(),
            )
            .to_vec(),
        }
    }

    /// Returns the FingerprintVariant for this salt, if exists.
    /// Only FingerprintSalts with a corresponding variant are saved into the database.
    pub fn kind(&self) -> Option<FingerprintScope> {
        match self {
            Self::Global(_) => Some(FingerprintScope::Global),
            Self::Tenant(_, _) => Some(FingerprintScope::Tenant),
            Self::Partial(_) => None,
        }
    }

    pub fn di(&self) -> DataIdentifier {
        match self {
            Self::Global(s) => s.di(),
            Self::Tenant(di, _) => (*di).clone(),
            Self::Partial(s) => s.di(),
        }
    }
}

#[derive(Clone, Copy, Debug, EnumIter, Eq, PartialEq, Hash)]
pub enum GlobalFingerprintKind {
    PhoneNumber,
    Email,
    Ssn9,
    Tin,
}

impl GlobalFingerprintKind {
    pub fn data_identifiers() -> Vec<DataIdentifier> {
        Self::iter().map(|s| s.di()).collect()
    }

    pub fn di(&self) -> DataIdentifier {
        match self {
            GlobalFingerprintKind::PhoneNumber => DataIdentifier::from(IDK::PhoneNumber),
            GlobalFingerprintKind::Email => DataIdentifier::from(IDK::Email),
            GlobalFingerprintKind::Ssn9 => DataIdentifier::from(IDK::Ssn9),
            GlobalFingerprintKind::Tin => DataIdentifier::from(BDK::Tin),
        }
    }
}

impl<'a> TryFrom<&'a DataIdentifier> for GlobalFingerprintKind {
    type Error = crate::Error;

    fn try_from(value: &'a DataIdentifier) -> Result<Self, Self::Error> {
        Self::iter()
            .find(|g| &g.di() == value)
            .ok_or(crate::Error::Custom(
                "Data is not globally fingerprintable".into(),
            ))
    }
}

#[derive(Clone, Copy, Debug, EnumIter, Eq, PartialEq, Hash, strum::Display)]
#[strum(serialize_all = "snake_case")]
/// Represents pieces of data that are fingerprinted in order to build a composite fingerprint.
/// These are not saved to the database.
pub enum PartialFingerprintKind {
    Dob,
    FirstName,
    LastName,
}

impl PartialFingerprintKind {
    pub fn di(&self) -> DataIdentifier {
        match self {
            PartialFingerprintKind::Dob => DataIdentifier::from(IDK::Dob),
            PartialFingerprintKind::FirstName => DataIdentifier::from(IDK::FirstName),
            PartialFingerprintKind::LastName => DataIdentifier::from(IDK::LastName),
        }
    }
}

impl<'a> TryFrom<&'a DataIdentifier> for PartialFingerprintKind {
    type Error = crate::Error;

    fn try_from(value: &'a DataIdentifier) -> Result<Self, Self::Error> {
        Self::iter()
            .find(|g| &g.di() == value)
            .ok_or(crate::Error::Custom(
                "Data is not partially fingerprintable as a composite fingerprint".into(),
            ))
    }
}

#[cfg(test)]
mod tests {
    use super::FingerprintSalt;
    use crate::{
        fingerprint_salt::{GlobalFingerprintKind, PartialFingerprintKind},
        IdentityDataKind as IDK, TenantId,
    };
    use test_case::test_case;

    fn test_org_id() -> TenantId {
        TenantId::test_data("org_hello_world".into())
    }

    #[test_case(GlobalFingerprintKind::PhoneNumber.into() => "d3d059cf8cb307035ab86a728dc4a1774a9dad641925d1b54bfd767c75352797".to_string())]
    #[test_case(GlobalFingerprintKind::Email.into() => "9f9b892d2e59405899706bbd46b7477a47684385efed538475e785108c298615".to_string())]
    #[test_case(GlobalFingerprintKind::Ssn9.into() => "525339bc5289b4848ed65342337aef5f6ae8254967d13f368ab073bdcb1a2088".to_string())]
    #[test_case(FingerprintSalt::Tenant(IDK::PhoneNumber.into(), test_org_id()) => "6f930e083b99ac46ef5ce0acfe28ea15454fd8c0f035b41fe866ddc521ab3d0b".to_string())]
    #[test_case(FingerprintSalt::Tenant(IDK::Email.into(), test_org_id()) => "ff41f7640520c8fe77574f839706cdde2eafbd1d852c507cf76662ef3380cf52".to_string())]
    #[test_case(FingerprintSalt::Tenant(IDK::FirstName.into(), test_org_id()) => "618954b917c536cd90cdb556f0f8153a63d89048dba2894f00895169414a30db".to_string())]
    #[test_case(PartialFingerprintKind::Dob.into() => "c4729af039e10bf709bb34f347c9d02e4eecb8883c5a11110f73e1556cdda130")]
    #[test_case(PartialFingerprintKind::FirstName.into() => "fc1cb06526ec348cd2c3061c46c5169ece69568e15bd91ae5b3829515370f1fe")]
    fn test_unchanged_fingerprint_salt_bytes(scope: FingerprintSalt) -> String {
        // If this test fails, it means you've changed the way we compute the salt for the tested
        // fingerprint scopes, which will in turn modify ever fingerprint generated with this salt.
        // Don't do this.
        crypto::hex::encode(scope.salt_bytes())
    }
}

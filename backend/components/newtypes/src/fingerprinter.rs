use itertools::{chain, Itertools};
use strum::{EnumIter, IntoEnumIterator};

use crate::{
    BusinessDataKind as BDK, DataIdentifier, FingerprintScopeKind, IdentityDataKind as IDK, TenantId,
};


impl DataIdentifier {
    /// Given a DataIdentifier and its corresponding data, returns the fingerprintable payloads
    /// that will be sent to the enclave
    pub fn get_fingerprint_payload<'a, T: Copy>(
        &'a self,
        v: T,
        tenant_id: Option<&'a TenantId>,
    ) -> Vec<(FingerprintScope, T)> {
        if !self.is_fingerprintable() {
            return vec![];
        }
        let tenant_scope = tenant_id.map(|t_id| FingerprintScope::Tenant(self.clone(), t_id.clone()));
        // Generate a tenant-scoped fingerprint and globally-scoped fingerprint (if possible)
        let global_scope = GlobalFingerprintKind::try_from(self)
            .ok()
            .map(FingerprintScope::Global);
        chain(global_scope, tenant_scope)
            .map(|scope| (scope, v))
            .collect_vec()
    }
}

/// The scope to which we will fingerprint data.
/// Each unique scope essentially builds a unique space of fingerprints.
#[derive(Debug, Clone, derive_more::From)]
pub enum FingerprintScope {
    /// Searchable across all tenants
    Global(GlobalFingerprintKind),
    /// Searchable within a tenant
    Tenant(DataIdentifier, TenantId),
}

impl FingerprintScope {
    /// The fingerprint scope is used to salt fingerprints in the enclave.
    /// This returns the salt we send to the enclave when generating fingerprints.
    pub fn salt_bytes(&self) -> Vec<u8> {
        match self {
            FingerprintScope::Global(s) => crypto::sha256(s.di().to_string().as_bytes()).to_vec(),
            FingerprintScope::Tenant(di, tenant_id) => crypto::sha256(
                &[
                    crypto::sha256(di.to_string().as_bytes()),
                    crypto::sha256(tenant_id.to_string().as_bytes()),
                ]
                .concat(),
            )
            .to_vec(),
        }
    }

    pub fn kind(&self) -> FingerprintScopeKind {
        match self {
            Self::Global(_) => FingerprintScopeKind::Global,
            Self::Tenant(_, _) => FingerprintScopeKind::Tenant,
        }
    }

    pub fn di(&self) -> DataIdentifier {
        match self {
            FingerprintScope::Global(s) => s.di(),
            FingerprintScope::Tenant(di, _) => (*di).clone(),
        }
    }
}

/// This is the one place where we define what can be GLOBALLY fingerprinted
#[derive(Clone, Copy, Debug, EnumIter)]
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

#[cfg(test)]
mod tests {
    use super::FingerprintScope;
    use crate::{fingerprinter::GlobalFingerprintKind, IdentityDataKind as IDK, TenantId};
    use test_case::test_case;

    fn test_org_id() -> TenantId {
        TenantId::test_data("org_hello_world".into())
    }

    #[test_case(GlobalFingerprintKind::PhoneNumber.into() => "d3d059cf8cb307035ab86a728dc4a1774a9dad641925d1b54bfd767c75352797".to_string())]
    #[test_case(GlobalFingerprintKind::Email.into() => "9f9b892d2e59405899706bbd46b7477a47684385efed538475e785108c298615".to_string())]
    #[test_case(GlobalFingerprintKind::Ssn9.into() => "525339bc5289b4848ed65342337aef5f6ae8254967d13f368ab073bdcb1a2088".to_string())]
    #[test_case(FingerprintScope::Tenant(IDK::PhoneNumber.into(), test_org_id()) => "6f930e083b99ac46ef5ce0acfe28ea15454fd8c0f035b41fe866ddc521ab3d0b".to_string())]
    #[test_case(FingerprintScope::Tenant(IDK::Email.into(), test_org_id()) => "ff41f7640520c8fe77574f839706cdde2eafbd1d852c507cf76662ef3380cf52".to_string())]
    #[test_case(FingerprintScope::Tenant(IDK::FirstName.into(), test_org_id()) => "618954b917c536cd90cdb556f0f8153a63d89048dba2894f00895169414a30db".to_string())]
    fn test_unchanged_fingerprint_salting(scope: FingerprintScope) -> String {
        // If this test fails, it means you've changed the way we compute the salt for the tested
        // fingerprint scopes, which will in turn modify ever fingerprint generated with this salt.
        // Don't do this.
        crypto::hex::encode(scope.salt_bytes())
    }
}

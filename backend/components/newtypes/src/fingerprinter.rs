//! These traits form the source of truth of what can be fingerprinted and what scopes fingerprints can have.
//! By `scope` we mean visibilty:
//! - Global: given a unique `data` we produce a unique `fingerprint`.
//! - Tenant: given a unique `data` we produce `n` fingerprints, one for each tenant.
//! The key difference is that if someone were to leak the database the fingerprints should be minimaly revealing.
use async_trait::async_trait;
use itertools::Itertools;
use strum::{EnumIter, IntoEnumIterator};

use crate::{
    BusinessDataKind as BDK, DataIdentifier, Fingerprint, FingerprintScopeKind, IdentityDataKind as IDK,
    PiiString, TenantId,
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
        vec![global_scope, tenant_scope]
            .into_iter()
            .flatten()
            .map(|scope| (scope, v))
            .collect_vec()
    }
}

/// The scope to which we will fingerprint data
#[derive(Debug, Clone, derive_more::From)]
pub enum FingerprintScope {
    /// Searchable across all tenants
    Global(GlobalFingerprintKind),
    /// Searchable within a tenant
    Tenant(DataIdentifier, TenantId),
}

impl FingerprintScope {
    /// convert into bytes for fingerprinting
    pub fn bytes(&self) -> Vec<u8> {
        match self {
            FingerprintScope::Global(s) => {
                crypto::sha256(s.data_identifier().to_string().as_bytes()).to_vec()
            }
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

    pub fn data_identifier(&self) -> DataIdentifier {
        match self {
            FingerprintScope::Global(s) => s.data_identifier(),
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
        Self::iter().map(|s| s.data_identifier()).collect()
    }

    pub fn data_identifier(&self) -> DataIdentifier {
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
            .find(|g| &g.data_identifier() == value)
            .ok_or(crate::Error::Custom(
                "Data is not globally fingerprintable".into(),
            ))
    }
}

/// Signed hasher interface. Needed since we have logic inside newtypes to generate fingerprints
/// but the EnclaveClient that implements this is defined in api_core.
#[async_trait]
pub trait Fingerprinter: std::marker::Sync {
    type Error: From<crate::Error>;

    async fn compute_fingerprints(
        &self,
        data: Vec<(FingerprintScope, &PiiString)>,
    ) -> Result<Vec<(FingerprintScope, Fingerprint)>, Self::Error>;
}

#[cfg(test)]
mod tests {
    enum Scope {
        Global,
        Tenant,
    }
    use std::str::FromStr;

    use super::{FingerprintScope, GlobalFingerprintKind};
    use crate::{DataIdentifier, TenantId};
    use test_case::test_case;
    use Scope::*;

    #[test_case("id.phone_number", Global => "d3d059cf8cb307035ab86a728dc4a1774a9dad641925d1b54bfd767c75352797".to_string())]
    #[test_case("id.email", Global => "9f9b892d2e59405899706bbd46b7477a47684385efed538475e785108c298615".to_string())]
    #[test_case("id.phone_number", Tenant => "6f930e083b99ac46ef5ce0acfe28ea15454fd8c0f035b41fe866ddc521ab3d0b".to_string())]
    #[test_case("id.email", Tenant => "ff41f7640520c8fe77574f839706cdde2eafbd1d852c507cf76662ef3380cf52".to_string())]
    #[test_case("id.first_name", Tenant => "618954b917c536cd90cdb556f0f8153a63d89048dba2894f00895169414a30db".to_string())]
    #[test_case("id.ssn9", Global => "525339bc5289b4848ed65342337aef5f6ae8254967d13f368ab073bdcb1a2088".to_string())]
    fn test_unchanged_fingerprint_salting(di: &str, scope: Scope) -> String {
        let id = DataIdentifier::from_str(di).expect("invalid di");
        let bytes = match scope {
            Global => {
                let global = GlobalFingerprintKind::try_from(&id).expect("invalid global scope");
                FingerprintScope::Global(global).bytes()
            }
            Tenant => {
                let tenant_id = TenantId::test_data("org_hello_world".into());
                FingerprintScope::Tenant(id, tenant_id).bytes()
            }
        };
        crypto::hex::encode(bytes)
    }
}

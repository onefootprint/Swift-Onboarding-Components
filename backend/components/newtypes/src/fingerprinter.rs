//! These traits form the source of truth of what can be fingerprinted and what scopes fingerprints can have.
//! By `scope` we mean visibilty:
//! - Global: given a unique `data` we produce a unique `fingerprint`.
//! - Tenant: given a unique `data` we produce `n` fingerprints, one for each tenant.
//! The key difference is that if someone were to leak the database the fingerprints should be minimaly revealing.
use async_trait::async_trait;
use strum::EnumIter;
use strum::IntoEnumIterator;

use crate::DataLifetimeKind;
use crate::{
    BusinessDataKind as BDK, DataIdentifier, Fingerprint, IdentityDataKind as IDK, PiiString, TenantId,
};

/// The scope to fingerprint data to
#[derive(Debug, Clone)]
pub enum FingerprintScope<'a> {
    /// Searchable across all tenants
    Global(GlobalFingerprintKind),
    /// Searchable within a tenant
    Tenant(&'a DataIdentifier, &'a TenantId),
}

impl<'a> FingerprintScope<'a> {
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
}

pub trait FingerprintScopable {
    fn scope(&self) -> FingerprintScope;
}

impl<'a> FingerprintScopable for (&'a DataIdentifier, &'a TenantId) {
    fn scope(&self) -> FingerprintScope {
        let (id, tenant_id) = self;
        FingerprintScope::Tenant(id, tenant_id)
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

impl FingerprintScopable for GlobalFingerprintKind {
    fn scope(&self) -> FingerprintScope {
        FingerprintScope::Global(*self)
    }
}
impl GlobalFingerprintKind {
    pub fn data_identifiers() -> Vec<DataIdentifier> {
        Self::iter().map(|s| s.data_identifier()).collect()
    }

    pub fn data_lifetime_kind(&self) -> DataLifetimeKind {
        match self {
            GlobalFingerprintKind::PhoneNumber => DataLifetimeKind::from(IDK::PhoneNumber),
            GlobalFingerprintKind::Email => DataLifetimeKind::from(IDK::Email),
            GlobalFingerprintKind::Ssn9 => DataLifetimeKind::from(IDK::Ssn9),
            GlobalFingerprintKind::Tin => DataLifetimeKind::from(BDK::Tin),
        }
    }

    pub fn data_identifier(&self) -> DataIdentifier {
        DataIdentifier::from(self.data_lifetime_kind())
    }
}

/// Signed hasher interface
#[async_trait]
pub trait Fingerprinter: std::marker::Sync {
    type Error: From<crate::Error>;

    async fn compute_fingerprints<S: FingerprintScopable + Send + Sync>(
        &self,
        data: &[(S, &PiiString)],
    ) -> Result<Vec<Fingerprint>, Self::Error>;

    async fn compute_fingerprint<S: FingerprintScopable + Send + Sync>(
        &self,
        id: S,
        data: &PiiString,
    ) -> Result<Fingerprint, Self::Error> {
        Ok(self
            .compute_fingerprints(&[(id, data)])
            .await?
            .into_iter()
            .next()
            .ok_or(crate::Error::Custom("missing fingerprints".into()))?)
    }

    /// TODO: remove this once migration done
    async fn legacy_compute_fingerprints(
        &self,
        data: &[(DataIdentifier, &PiiString)],
    ) -> Result<Vec<Fingerprint>, Self::Error>;

    /// For legacy clients we compute both kinds of fingerprints
    /// TODO: remove once migration is done
    async fn compute_fingerprints_opts(
        &self,
        data: &[(DataIdentifier, &PiiString)],
        tenant_id: TenantId,
        legacy: bool,
    ) -> Result<Vec<Fingerprint>, Self::Error> {
        let legacy_fp = if legacy {
            self.legacy_compute_fingerprints(data).await?
        } else {
            vec![]
        };

        let scopable: Vec<_> = data.iter().map(|(di, pii)| ((di, &tenant_id), *pii)).collect();

        let fp = self.compute_fingerprints(&scopable).await?;

        Ok(fp.into_iter().chain(legacy_fp).collect())
    }

    async fn compute_legacy_fingerprint(
        &self,
        id: DataIdentifier,
        data: &PiiString,
    ) -> Result<Fingerprint, Self::Error> {
        Ok(self
            .legacy_compute_fingerprints(&[(id, data)])
            .await?
            .into_iter()
            .next()
            .ok_or(crate::Error::Custom("missing fingerprints".into()))?)
    }
}

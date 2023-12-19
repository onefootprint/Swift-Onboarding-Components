use std::str::FromStr;

use super::{Any, PatchDataResult, Person, VaultWrapper};
use crate::enclave_client::VaultKeyPair;
use crate::errors::onboarding::OnboardingError;
use crate::errors::user::UserError;
use crate::errors::{ApiResult, AssertionError};
use crate::telemetry::RootSpan;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::{ScopedVault, ScopedVaultUpdate};
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::email::Email;
use newtypes::{
    DataIdentifier as DI, DataLifetimeSource, DataRequest, Fingerprint, FingerprintRequest,
    FingerprintScopeKind, OnboardingStatus, PhoneNumber, PiiString, SandboxId,
};
use newtypes::{IdentityDataKind as IDK, VaultKind};
use newtypes::{Locked, ValidateArgs};

pub struct VaultContext {
    pub data: Vec<InitialVaultData>,
    pub keypair: VaultKeyPair,
    pub sandbox_id: Option<SandboxId>,
    pub obc: Option<ObConfiguration>,
}

/// Represents pieces of data that will be added to the vault upon its creation
pub struct InitialVaultData {
    pub is_verified: bool,
    pub di: DI,
    pub value: PiiString,
    pub global_sh: Fingerprint,
    pub tenant_sh: Option<Fingerprint>,
}

impl InitialVaultData {
    fn is_fixture(&self) -> ApiResult<bool> {
        let is_fixture = match self.di {
            DI::Id(IDK::PhoneNumber) => PhoneNumber::parse(self.value.clone())?.is_fixture_phone_number(),
            DI::Id(IDK::Email) => Email::from_str(self.value.leak())?.is_fixture(),
            _ => false,
        };
        Ok(is_fixture)
    }
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault with its phone/email and scoped vault. The
    /// contact info will remain unverified
    #[tracing::instrument("VaultWrapper::create_unverified", skip_all)]
    pub fn create_unverified(
        conn: &mut TxnPgConn,
        ctx: VaultContext,
        root_span: &RootSpan,
    ) -> ApiResult<(Locked<Vault>, ScopedVault, PatchDataResult)> {
        let VaultContext {
            data: initial_data,
            keypair,
            sandbox_id,
            obc,
        } = ctx;
        // Must have ob_info to create a new user vault
        let obc = obc.ok_or(OnboardingError::MissingObPkAuth)?;
        // Verify that the ob config is_live matches the user vault
        if obc.is_live != sandbox_id.is_none() {
            return Err(UserError::SandboxMismatch.into());
        }
        let is_fixture_data = initial_data
            .iter()
            .map(|d| d.is_fixture())
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .any(|x| x);
        if obc.is_live && is_fixture_data {
            return Err(UserError::FixtureCIInLive.into());
        }

        if initial_data.iter().any(|d| !d.di.is_contact_info()) {
            return Err(
                AssertionError("Cannot create vault with initial data other than phone/email").into(),
            );
        }

        // Create the UV and SU
        let (public_key, e_private_key) = keypair;
        let new_user_vault = NewVaultArgs {
            e_private_key,
            public_key,
            is_live: obc.is_live, // Must derive is_live from the ob config used to create it
            kind: VaultKind::Person,
            is_fixture: is_fixture_data,
            sandbox_id,
            is_created_via_api: false,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, obc.id)?;
        // Since this vault is created for the first time here, it starts as billable, incomplete, and hidden from search
        let update = ScopedVaultUpdate {
            is_billable: Some(true),
            status: Some(OnboardingStatus::Incomplete),
            show_in_search: Some(false),
            last_activity_at: None,
        };
        ScopedVault::update(conn, &su.id, update)?;

        // Record some properties on the root span
        root_span.record("tenant_id", su.tenant_id.to_string());
        root_span.record("fp_id", su.fp_id.to_string());
        root_span.record("vault_id", su.vault_id.to_string());
        root_span.record("is_live", su.is_live);

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number and/or email to the vault
        let data = initial_data
            .iter()
            .map(|d| (d.di.clone(), d.value.clone()))
            .collect();
        let request = DataRequest::clean_and_validate_str(data, ValidateArgs::for_bifrost(obc.is_live))?;
        let fingerprints = initial_data
            .into_iter()
            .map(|d| -> ApiResult<_> {
                Ok(vec![
                    Some(FingerprintRequest {
                        kind: d.di.clone(),
                        fingerprint: d.global_sh,
                        scope: FingerprintScopeKind::Global,
                    }),
                    d.tenant_sh.map(|tenant_sh| FingerprintRequest {
                        kind: d.di,
                        fingerprint: tenant_sh,
                        scope: FingerprintScopeKind::Tenant,
                    }),
                ])
            })
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .flatten()
            .collect();
        let request = request.manual_fingerprints(fingerprints);
        let source = DataLifetimeSource::Hosted;
        let result = uvw.patch_data(conn, request, source, None)?;

        Ok((uv, su, result))
    }
}

use std::str::FromStr;

use super::{Any, PatchDataResult, Person, VaultWrapper};
use crate::{
    enclave_client::VaultKeyPair,
    errors::{user::UserError, ApiResult, AssertionError},
    telemetry::RootSpan,
};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        scoped_vault::{ScopedVault, ScopedVaultUpdate},
        vault::{NewVaultArgs, Vault},
    },
    TxnPgConn,
};
use newtypes::{
    email::Email, DataIdentifier as DI, DataLifetimeSource, DataRequest, Fingerprint, FingerprintRequest,
    FingerprintScopeKind, IdentityDataKind as IDK, Locked, ObConfigurationKind, OnboardingStatus,
    PhoneNumber, PiiString, SandboxId, ValidateArgs, VaultId, VaultKind,
};

pub struct VaultContext {
    pub data: Vec<InitialVaultData>,
    pub keypair: VaultKeyPair,
    pub sandbox_id: Option<SandboxId>,
    pub obc: ObConfiguration,
}

/// Represents pieces of data that will be added to the vault upon its creation
pub struct InitialVaultData {
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
        duplicate_of_id: Option<VaultId>,
    ) -> ApiResult<(Locked<Vault>, ScopedVault, PatchDataResult)> {
        let VaultContext {
            data: initial_data,
            keypair,
            sandbox_id,
            obc,
        } = ctx;
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

        if let Some(duplicate_of_id) = duplicate_of_id.as_ref() {
            if !obc.tenant_id.is_integration_test_tenant() {
                tracing::error!(%duplicate_of_id, "Duplicate vault created");
            }
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
            duplicate_of_id,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let (su, _) = ScopedVault::get_or_create(conn, &uv, obc.id)?;

        // Since this vault is created for the first time here, it starts as billable and hidden from search
        let status = match obc.kind {
            // For now, when auth playbooks are super lightweight, just mark them as no status
            ObConfigurationKind::Auth => None,
            ObConfigurationKind::Kyb | ObConfigurationKind::Kyc | ObConfigurationKind::Document => {
                Some(OnboardingStatus::Incomplete)
            }
        };
        let update = ScopedVaultUpdate {
            is_billable: Some(true),
            status,
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
        // TODO this could be bootstrapped
        let source = DataLifetimeSource::Hosted;
        let result = uvw.patch_data(conn, request, source, None)?;

        Ok((uv, su, result))
    }
}

use super::{
    Any,
    DataLifetimeSources,
    DataRequestSource,
    FingerprintedDataRequest,
    PatchDataResult,
    Person,
    VaultWrapper,
    WriteableVw,
};
use crate::enclave_client::VaultKeyPair;
use crate::errors::user::UserError;
use crate::errors::{
    ApiResult,
    AssertionError,
};
use crate::telemetry::RootSpan;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::{
    NewScopedVaultArgs,
    ScopedVault,
};
use db::models::vault::{
    NewVaultArgs,
    Vault,
};
use db::TxnPgConn;
use newtypes::email::Email;
use newtypes::{
    DataIdentifier as DI,
    DataLifetimeSource,
    IdentityDataKind as IDK,
    Locked,
    ObConfigurationKind,
    OnboardingStatus,
    PhoneNumber,
    SandboxId,
    VaultId,
    VaultKind,
};
use std::collections::HashMap;
use std::str::FromStr;

pub struct VaultContext {
    pub data: FingerprintedDataRequest,
    pub sources: HashMap<DI, DataLifetimeSource>,
    pub keypair: VaultKeyPair,
    pub sandbox_id: Option<SandboxId>,
    pub obc: ObConfiguration,
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
            data,
            sources,
            keypair,
            sandbox_id,
            obc,
        } = ctx;
        // Verify that the ob config is_live matches the user vault
        if obc.is_live != sandbox_id.is_none() {
            return Err(UserError::SandboxMismatch.into());
        }
        let is_fixture_data = data
            .iter()
            .map(|(di, pii)| -> ApiResult<_> {
                let is_fixture = match di {
                    DI::Id(IDK::PhoneNumber) => PhoneNumber::parse(pii.clone())?.is_fixture_phone_number(),
                    DI::Id(IDK::Email) => Email::from_str(pii.leak())?.is_fixture(),
                    _ => false,
                };
                Ok(is_fixture)
            })
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .any(|x| x);
        if obc.is_live && is_fixture_data {
            return Err(UserError::FixtureCIInLive.into());
        }

        if data.iter().any(|(di, _)| !di.is_contact_info()) {
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
        let status = match obc.kind {
            // For now, when auth playbooks are super lightweight, just mark them as no status
            ObConfigurationKind::Auth => None,
            ObConfigurationKind::Kyb | ObConfigurationKind::Kyc | ObConfigurationKind::Document => {
                Some(OnboardingStatus::Incomplete)
            }
        };
        // The vault starts as inactive since the phone/email haven't been verified by the user.
        // It will be marked as active when the user logs into this vault for the first time.
        let args = NewScopedVaultArgs {
            is_active: false,
            status,
        };
        let su = ScopedVault::create_for_playbook(conn, &uv, obc, args)?;

        // Record some properties on the root span
        root_span.record("tenant_id", su.tenant_id.to_string());
        root_span.record("fp_id", su.fp_id.to_string());
        root_span.record("vault_id", su.vault_id.to_string());
        root_span.record("is_live", su.is_live);

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number and/or email to the vault
        let sources = DataLifetimeSources::overrides(DataLifetimeSource::LikelyHosted, sources);
        let request = uvw.validate_request(conn, data, sources, None, DataRequestSource::CreateVault)?;
        let result = WriteableVw::<Any>::internal_save_data(&uvw, conn, request, None)?;

        Ok((uv, su, result))
    }
}

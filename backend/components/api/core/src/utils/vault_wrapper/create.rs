use super::{Any, PatchDataResult, Person, VaultWrapper};
use crate::enclave_client::VaultKeyPair;
use crate::errors::user::UserError;
use crate::errors::{ApiResult, AssertionError};
use db::models::contact_info::{ContactInfo, VerificationLevel};
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{
    DataIdentifier as DI, DataLifetimeSource, DataRequest, Fingerprint, FingerprintRequest,
    FingerprintScopeKind, PhoneNumber, PiiString, SandboxId,
};
use newtypes::{IdentityDataKind as IDK, VaultKind};
use newtypes::{Locked, ValidateArgs};

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
        if self.di != DI::from(IDK::PhoneNumber) {
            return Ok(false);
        }
        let is_fixture = PhoneNumber::parse(self.value.clone())?.is_fixture_phone_number();
        Ok(is_fixture)
    }
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("VaultWrapper::create_user_vault", skip_all)]
    pub fn create_user_vault(
        conn: &mut TxnPgConn,
        keypair: VaultKeyPair,
        ob_config: ObConfiguration,
        initial_data: Vec<InitialVaultData>,
        sandbox_id: Option<SandboxId>,
    ) -> ApiResult<(Locked<Vault>, ScopedVault)> {
        // Verify that the ob config is_live matches the user vault
        if ob_config.is_live != sandbox_id.is_none() {
            return Err(UserError::SandboxMismatch.into());
        }
        let is_fixture_data = initial_data
            .iter()
            .map(|d| d.is_fixture())
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .any(|x| x);
        if ob_config.is_live && is_fixture_data {
            return Err(UserError::FixtureNumberInLive.into());
        }

        if initial_data
            .iter()
            .any(|d| !matches!(d.di, DI::Id(IDK::PhoneNumber) | DI::Id(IDK::Email)))
        {
            return Err(
                AssertionError("Cannot create vault with initial data other than phone/email").into(),
            );
        }
        let verified_dis = initial_data.iter().filter(|d| d.is_verified).collect_vec();
        if verified_dis.len() > 1 {
            return Err(AssertionError("Can only create vault with 1 piece of verified info").into());
        }
        let verified_di = verified_dis
            .into_iter()
            .next()
            .map(|d| d.di.clone())
            .ok_or(AssertionError("Must create vault with 1 piece of verified info"))?;

        // Create the UV and SU
        let (public_key, e_private_key) = keypair;
        let new_user_vault = NewVaultArgs {
            e_private_key,
            public_key,
            is_live: ob_config.is_live, // Must derive is_live from the ob config used to create it
            is_portable: true,
            kind: VaultKind::Person,
            is_fixture: is_fixture_data,
            sandbox_id,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, ob_config.id)?;

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number and/or email to the vault
        let data = initial_data
            .iter()
            .map(|d| (d.di.clone(), d.value.clone()))
            .collect();
        let request =
            DataRequest::clean_and_validate_str(data, ValidateArgs::for_bifrost(ob_config.is_live))?;
        let fingerprints = initial_data
            .into_iter()
            .map(|d| -> ApiResult<_> {
                Ok(vec![
                    // Don't create a globally-scoped fingerprint for our fixture phone number,
                    // otherwise these test users' data will become portable across tenants
                    (!(d.is_fixture()?)).then_some(FingerprintRequest {
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
        let PatchDataResult { new_ci, seqno } = uvw.patch_data(conn, request, source)?;
        // Immediately mark the phone as verified and portablized since it was proven to be owned
        // by the user in order to create this vault
        let (_, ci) = new_ci
            .into_iter()
            .find(|(d, _)| d == &verified_di)
            .ok_or(AssertionError("No CI made with new vault"))?;
        // Mark the verified piece of data as verified, and portablize it so it can be used to
        // log into other tenants
        ContactInfo::mark_verified(conn, &ci.id, VerificationLevel::OtpVerified)?;
        DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;

        Ok((uv, su))
    }
}

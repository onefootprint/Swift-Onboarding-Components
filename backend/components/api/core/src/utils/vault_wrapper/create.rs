use super::{Any, PatchDataResult, Person, VaultWrapper};
use crate::enclave_client::VaultKeyPair;
use crate::errors::user::UserError;
use crate::errors::{ApiResult, AssertionError};
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::{
    DataIdentifier, DataRequest, Fingerprint, FingerprintRequest, FingerprintScopeKind, PhoneNumber,
    SandboxId, SealedVaultBytes,
};
use newtypes::{IdentityDataKind as IDK, PiiString, VaultKind};
use newtypes::{Locked, ValidateArgs};
use std::collections::{HashMap, HashSet};

#[derive(Debug)]
pub struct NewPhoneNumberArgs {
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: newtypes::Fingerprint,
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    #[tracing::instrument("VaultWrapper::create_user_vault", skip_all)]
    pub fn create_user_vault(
        conn: &mut TxnPgConn,
        keypair: VaultKeyPair,
        ob_config: ObConfiguration,
        phone_number: PiiString,
        global_sh_phone_number: Fingerprint,
        tenant_sh_phone_number: Fingerprint,
        sandbox_id: Option<SandboxId>,
    ) -> ApiResult<(Locked<Vault>, ScopedVault)> {
        let phone_number_parsed = PhoneNumber::parse(phone_number)?;
        // Verify that the ob config is_live matches the user vault
        if ob_config.is_live != sandbox_id.is_none() {
            return Err(UserError::SandboxMismatch.into());
        }
        if ob_config.is_live && phone_number_parsed.is_fixture_phone_number() {
            return Err(UserError::FixtureNumberInLive.into());
        }

        // Create the UV and SU
        let (public_key, e_private_key) = keypair;
        let new_user_vault = NewVaultArgs {
            e_private_key,
            public_key,
            is_live: ob_config.is_live, // Must derive is_live from the ob config used to create it
            is_portable: true,
            kind: VaultKind::Person,
            is_fixture: phone_number_parsed.is_fixture_phone_number(),
            sandbox_id,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, ob_config.id)?;

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number to the vault since it was used to create it
        let data = HashMap::from_iter([(IDK::PhoneNumber.into(), phone_number_parsed.e164())].into_iter());
        let request = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(ob_config.is_live))?;
        let request = request.manual_fingerprints(HashSet::from_iter(
            [
                // Don't create a globally-scoped fingerprint for our fixture phone number, otherwise
                // these test users' data will become portable across tenants
                (!uv.is_fixture).then_some(FingerprintRequest {
                    kind: IDK::PhoneNumber.into(),
                    fingerprint: global_sh_phone_number,
                    scope: FingerprintScopeKind::Global,
                }),
                Some(FingerprintRequest {
                    kind: IDK::PhoneNumber.into(),
                    fingerprint: tenant_sh_phone_number,
                    scope: FingerprintScopeKind::Tenant,
                }),
            ]
            .into_iter()
            .flatten(),
        ));
        let PatchDataResult { new_ci, seqno } = uvw.patch_data(conn, request)?;
        // Immediately mark the phone as verified and portablized since it was proven to be owned
        // by the user in order to create this vault
        let (_, ci) = new_ci
            .into_iter()
            .find(|(di, _)| di == &DataIdentifier::from(IDK::PhoneNumber))
            .ok_or(AssertionError("No CI made with new vault"))?;
        ContactInfo::mark_verified(conn, &ci.id)?;
        DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;

        Ok((uv, su))
    }
}

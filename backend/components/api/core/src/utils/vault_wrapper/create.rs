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
use newtypes::email::Email;
use newtypes::{
    DataIdentifier, DataLifetimeSource, DataRequest, Fingerprint, FingerprintRequest, FingerprintScopeKind,
    PhoneNumber, PiiString, SandboxId,
};
use newtypes::{IdentityDataKind as IDK, VaultKind};
use newtypes::{Locked, ValidateArgs};
use std::collections::{HashMap, HashSet};

pub enum AuthedData {
    Phone(PhoneNumber),
    Email(Email),
}

impl From<&AuthedData> for DataIdentifier {
    fn from(value: &AuthedData) -> Self {
        match value {
            AuthedData::Phone(_) => IDK::PhoneNumber,
            AuthedData::Email(_) => IDK::Email,
        }
        .into()
    }
}

impl AuthedData {
    pub fn is_fixture(&self) -> bool {
        match self {
            AuthedData::Phone(p) => p.is_fixture_phone_number(),
            AuthedData::Email(_) => false,
        }
    }

    pub fn data(&self) -> PiiString {
        match self {
            AuthedData::Phone(p) => p.e164(),
            AuthedData::Email(e) => e.to_piistring(),
        }
    }
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    #[tracing::instrument("VaultWrapper::create_user_vault", skip_all)]
    pub fn create_user_vault(
        conn: &mut TxnPgConn,
        keypair: VaultKeyPair,
        ob_config: ObConfiguration,
        authed_data: AuthedData,
        global_sh: Fingerprint,
        tenant_sh: Fingerprint,
        sandbox_id: Option<SandboxId>,
    ) -> ApiResult<(Locked<Vault>, ScopedVault)> {
        // Verify that the ob config is_live matches the user vault
        if ob_config.is_live != sandbox_id.is_none() {
            return Err(UserError::SandboxMismatch.into());
        }
        if ob_config.is_live && authed_data.is_fixture() {
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
            is_fixture: authed_data.is_fixture(),
            sandbox_id,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, ob_config.id)?;

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number to the vault since it was used to create it
        let data = HashMap::from_iter([((&authed_data).into(), authed_data.data())].into_iter());
        let request = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(ob_config.is_live))?;
        let request = request.manual_fingerprints(HashSet::from_iter(
            [
                // Don't create a globally-scoped fingerprint for our fixture phone number, otherwise
                // these test users' data will become portable across tenants
                (!uv.is_fixture).then_some(FingerprintRequest {
                    kind: (&authed_data).into(),
                    fingerprint: global_sh,
                    scope: FingerprintScopeKind::Global,
                }),
                Some(FingerprintRequest {
                    kind: (&authed_data).into(),
                    fingerprint: tenant_sh,
                    scope: FingerprintScopeKind::Tenant,
                }),
            ]
            .into_iter()
            .flatten(),
        ));
        let source = DataLifetimeSource::Hosted;
        let PatchDataResult { new_ci, seqno } = uvw.patch_data(conn, request, source)?;
        // Immediately mark the phone as verified and portablized since it was proven to be owned
        // by the user in order to create this vault
        let (_, ci) = new_ci
            .into_iter()
            .find(|(d, _)| d == &DataIdentifier::from(&authed_data))
            .ok_or(AssertionError("No CI made with new vault"))?;
        ContactInfo::mark_verified(conn, &ci.id, VerificationLevel::OtpVerified)?;
        DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;

        Ok((uv, su))
    }
}

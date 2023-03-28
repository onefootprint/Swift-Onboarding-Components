use super::{Person, VaultWrapper};
use crate::errors::{ApiError, ApiResult};
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault::{NewVaultArgs, NewVaultInfo};
use db::TxnPgConn;
use newtypes::{DataIdentifier, DataRequest, Fingerprint, SealedVaultBytes};
use newtypes::{IdentityDataKind as IDK, PiiString, VaultKind};
use newtypes::{Locked, ParseOptions};
use std::collections::HashMap;

#[derive(Debug)]
pub struct NewPhoneNumberArgs {
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: newtypes::Fingerprint,
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    pub fn create_user_vault(
        conn: &mut TxnPgConn,
        user_info: NewVaultInfo,
        ob_config: ObConfiguration,
        phone_number: PiiString,
        sh_phone_number: Fingerprint,
    ) -> ApiResult<(Locked<Vault>, ScopedVault)> {
        let new_user_vault = NewVaultArgs {
            e_private_key: user_info.e_private_key,
            public_key: user_info.public_key,
            is_live: user_info.is_live,
            is_portable: true,
            kind: VaultKind::Person,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, ob_config.id)?;

        // This performs some superfluous DB queries to rebuild the UVW, but allows us to share code
        // to add data to the vault
        let uvw = VaultWrapper::lock_for_onboarding(conn, &su.id)?;

        // Add the phone number to the vault since it was used to create it
        let data = HashMap::from_iter([(IDK::PhoneNumber.into(), phone_number)].into_iter());
        let request = DataRequest::clean_and_validate(data, ParseOptions::for_bifrost())?;
        let request =
            request.manual_fingerprints(HashMap::from_iter([(IDK::PhoneNumber.into(), sh_phone_number)]));
        let new_ci = uvw.put_person_data(conn, request)?;
        // Immediately mark the phone as verified and portablized since it was proven to be owned
        // by the user in order to create this vault
        let (_, ci) = new_ci
            .into_iter()
            .find(|(di, _)| di == &DataIdentifier::from(IDK::PhoneNumber))
            .ok_or_else(|| ApiError::AssertionError("No CI made with new vault".to_owned()))?;
        ContactInfo::mark_verified(conn, &ci.id)?;
        // I don't love this trick, but it is tricky to propogate the created_seqno of the DL through
        let seqno = DataLifetime::get_current_seqno(conn)?;
        DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;

        Ok((uv, su))
    }
}

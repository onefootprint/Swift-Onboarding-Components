use super::uvw_data::UvwData;
use super::UserVaultWrapper;
use super::UvwArgs;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::KeyValueData;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::NewPhoneNumberArgs;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_timeline::UserTimeline;
use db::models::user_vault::NewUserInfo;
use db::models::user_vault::UserVault;
use db::models::user_vault_data::UserVaultData;
use db::HasLifetime;
use db::PgConnection;
use db::TxnPgConnection;
use newtypes::CollectedDataOption;
use newtypes::DataCollectedInfo;
use newtypes::DataLifetimeSeqno;
use newtypes::DataPriority;
use newtypes::Locked;
use std::marker::PhantomData;

impl UserVaultWrapper {
    #[allow(clippy::too_many_arguments)]
    pub(super) fn build_internal(
        user_vault: UserVault,
        seqno: Option<DataLifetimeSeqno>,
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        kv_data: Vec<KeyValueData>,
        lifetimes: Vec<DataLifetime>,
    ) -> ApiResult<Self> {
        let (committed, speculative) =
            UvwData::partition(uvd, phone_numbers, emails, identity_documents, kv_data, lifetimes)?;
        let result = Self {
            user_vault,
            committed,
            speculative,
            _seqno: seqno,
            is_hydrated: PhantomData,
        };
        Ok(result)
    }

    pub fn build(conn: &mut PgConnection, args: UvwArgs) -> ApiResult<Self> {
        let (uv, su_id, seqno) = args.build(conn)?;
        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(conn, &uv.id, su_id.as_ref(), seqno)?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, &uv.id, su_id.as_ref())?
        };
        let active_lifetime_ids: Vec<_> = active_lifetimes.iter().map(|l| l.id.clone()).collect();

        // Fetch all the data related to the active lifetimes
        // Split into committed + uncommitted data
        let data = UserVaultData::get_for(conn, &active_lifetime_ids)?;
        let phone_numbers = PhoneNumber::get_for(conn, &active_lifetime_ids)?;
        let emails = Email::get_for(conn, &active_lifetime_ids)?;
        let identity_documents = IdentityDocument::get_for(conn, &active_lifetime_ids)?;
        let kv_data = if su_id.is_some() {
            KeyValueData::get_for(conn, &active_lifetime_ids)?
        } else {
            vec![]
        };

        let result = Self::build_internal(
            uv,
            seqno,
            data,
            phone_numbers,
            emails,
            identity_documents,
            kv_data,
            active_lifetimes,
        )?;
        Ok(result)
    }

    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    pub fn create_user_vault(
        conn: &mut TxnPgConnection,
        user_info: NewUserInfo,
        ob_config: Option<ObConfiguration>,
        phone_args: NewPhoneNumberArgs,
    ) -> ApiResult<Locked<UserVault>> {
        let new_user_vault = db::models::user_vault::NewUserVaultArgs {
            e_private_key: user_info.e_private_key,
            public_key: user_info.public_key,
            is_live: user_info.is_live,
            is_portable: true,
        };
        let uv = UserVault::create(conn, new_user_vault)?;
        let su_id = if let Some(ob_config) = ob_config {
            let su = ScopedUser::get_or_create(conn, &uv, ob_config.id)?;
            Some(su.id)
        } else {
            None
        };
        // Primary since we just made the UVW and there can't already be another phone
        PhoneNumber::create_verified(conn, &uv.id, phone_args, DataPriority::Primary, su_id.as_ref())?;
        let data_collected_info = DataCollectedInfo {
            attributes: vec![CollectedDataOption::PhoneNumber],
        };
        // Create a log of the piece of data being added
        UserTimeline::create(conn, data_collected_info, uv.id.clone(), su_id)?;

        Ok(uv)
    }
}

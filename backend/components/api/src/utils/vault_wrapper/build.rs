use super::vw_data::VwData;
use super::VwArgs;
use super::{Person, VaultWrapper};
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::NewPhoneNumberArgs;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::vault::{NewVaultArgs, NewVaultInfo};
use db::models::vault_data::VaultData;
use db::HasLifetime;
use db::PgConn;
use db::TxnPgConn;
use newtypes::DataCollectedInfo;
use newtypes::DataLifetimeSeqno;
use newtypes::DataPriority;
use newtypes::Locked;
use newtypes::{CollectedDataOption, VaultKind};
use std::marker::PhantomData;

impl<Type> VaultWrapper<Type> {
    #[allow(clippy::too_many_arguments)]
    pub(super) fn build_internal(
        user_vault: Vault,
        seqno: Option<DataLifetimeSeqno>,
        vd: Vec<VaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        documents: Vec<DocumentData>,
        lifetimes: Vec<DataLifetime>,
    ) -> ApiResult<Self> {
        let (portable, speculative) = VwData::partition(
            vd,
            phone_numbers,
            emails,
            identity_documents,
            documents,
            lifetimes,
        )?;
        let result = Self {
            vault: user_vault,
            portable,
            speculative,
            _seqno: seqno,
            is_hydrated: PhantomData,
        };
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn build(conn: &mut PgConn, args: VwArgs) -> ApiResult<Self> {
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
        // Split into portable + speculative data
        let data = VaultData::get_for(conn, &active_lifetime_ids)?;
        let phone_numbers = PhoneNumber::get_for(conn, &active_lifetime_ids)?;
        let emails = Email::get_for(conn, &active_lifetime_ids)?;
        let identity_documents = IdentityDocumentAndRequest::get_for(conn, &active_lifetime_ids)?;
        let documents = DocumentData::get_for(conn, &active_lifetime_ids)?;

        let result = Self::build_internal(
            uv,
            seqno,
            data,
            phone_numbers,
            emails,
            identity_documents,
            documents,
            active_lifetimes,
        )?;
        Ok(result)
    }
}

impl VaultWrapper<Person> {
    /// Custom util function to create a user vault, its phone number, and optionally associate it
    /// with a provided ob_config
    pub fn create_user_vault(
        conn: &mut TxnPgConn,
        user_info: NewVaultInfo,
        ob_config: ObConfiguration,
        phone_args: NewPhoneNumberArgs,
    ) -> ApiResult<Locked<Vault>> {
        let new_user_vault = NewVaultArgs {
            e_private_key: user_info.e_private_key,
            public_key: user_info.public_key,
            is_live: user_info.is_live,
            is_portable: true,
            kind: VaultKind::Person,
        };
        let uv = Vault::create(conn, new_user_vault)?;
        let su = ScopedVault::get_or_create(conn, &uv, ob_config.id)?;
        // Primary since we just made the UVW and there can't already be another phone
        PhoneNumber::create_verified(conn, &uv.id, phone_args, DataPriority::Primary, &su.id)?;
        let data_collected_info = DataCollectedInfo {
            attributes: vec![CollectedDataOption::PhoneNumber],
        };
        // Create a log of the piece of data being added
        UserTimeline::create(conn, data_collected_info, uv.id.clone(), Some(su.id))?;

        Ok(uv)
    }
}

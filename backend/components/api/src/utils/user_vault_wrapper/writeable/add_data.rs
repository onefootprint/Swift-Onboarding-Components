use super::uvd_builder::UvdBuilder;
use super::WriteableUvw;
use crate::auth::AuthError;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::utils::fingerprint::NewFingerprints;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::TxnPgConn;
use newtypes::email::Email as NewtypeEmail;
use newtypes::put_data_request::DecomposedPutRequest;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataPriority, EmailId, Fingerprint, IdentityDataKind,
    IdentityDataUpdate, KvDataKey, PiiString,
};
use std::collections::HashMap;

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the UserVaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a UserVaultWrapper.
/// They use the private, xxx_unsafe methods, which cannot be exposed publically because they don't
/// take ownership over the UserVaultWrapper that is potentially stale after an update
impl WriteableUvw {
    #[allow(unused)]
    pub fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConn,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        self.add_email_unsafe(conn, email, fingerprint)
    }

    /// Applies the provided IdentityDataUpdate to the UVW.
    /// NOTE: if the update contains a phone number or email, we will ignore it
    #[allow(unused)]
    pub fn update_identity_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        update: IdentityDataUpdate,
        fingerprints: NewFingerprints,
    ) -> ApiResult<()> {
        self.update_identity_data_unsafe(conn, update, fingerprints)
    }

    pub fn update_custom_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        self.update_custom_data_unsafe(conn, update)
    }

    /// Util function to make updates to multiple pieces of the UserVault in one transaction
    pub fn put_all_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DecomposedPutRequest,
        fingerprints: NewFingerprints,
        for_bifrost: bool,
    ) -> ApiResult<Option<EmailId>> {
        let DecomposedPutRequest {
            phone_number,
            email,
            id_update,
            custom_data,
        } = request;
        // TODO can we combine these codepaths with POST /hosted/user/email,
        // POST /hosted/user/identity_data, and identify verify (where we make phone numbers)
        let mut fingerprints = fingerprints;
        let assert_non_portable = || -> Result<_, _> {
            // Cannot add identity data to a portable vault unless we are in bifrost
            if !for_bifrost && self.user_vault().is_portable {
                return Err(AuthError::CannotModifyPortableUser);
            }
            Ok(())
        };
        if !custom_data.is_empty() {
            self.update_custom_data_unsafe(conn, custom_data)?;
        }
        if let Some(phone_number) = phone_number {
            assert_non_portable()?;
            let Some(fp) = fingerprints.remove(&IdentityDataKind::PhoneNumber) else {
                return Err(ApiError::AssertionError("No fingerprint found for phone number".to_owned()));
            };
            self.add_phone_number_unsafe(conn, phone_number, fp)?;
        }
        let new_email_id = if let Some(email) = email {
            assert_non_portable()?;
            let Some(fp) = fingerprints.remove(&IdentityDataKind::Email) else {
                return Err(ApiError::AssertionError("No fingerprint found for email".to_owned()));
            };
            let email_id = self.add_email_unsafe(conn, email, fp)?;
            Some(email_id)
        } else {
            None
        };
        if !id_update.is_empty() {
            assert_non_portable()?;
            self.update_identity_data_unsafe(conn, id_update, fingerprints)?;
        }
        Ok(new_email_id)
    }
}

// Private methods that don't consume self to allow batching multiple
impl WriteableUvw {
    fn add_phone_number_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        phone_number: PiiString,
        fingerprint: Fingerprint,
    ) -> ApiResult<()> {
        // Only used to add a phone number to a non-portable vault for now
        if !self.portable.phone_numbers.is_empty() {
            // We don't currently support adding a secondary phone
            return Err(UserError::CannotReplaceData(IdentityDataKind::PhoneNumber.into()).into());
        }

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative phone, if exists
        let kinds = vec![IdentityDataKind::PhoneNumber.into()];
        DataLifetime::bulk_deactivate_speculative(conn, &self.scoped_user_id, kinds, seqno)?;

        // Add the new speculative phone
        let public_key = &self.user_vault.public_key;
        let phone_info = NewPhoneNumberArgs {
            e_phone_number: public_key.seal_pii(&phone_number)?,
            sh_phone_number: fingerprint,
        };
        PhoneNumber::create(
            conn,
            &self.user_vault.id,
            phone_info,
            DataPriority::Primary,
            Some(&self.scoped_user_id),
            seqno,
            false,
        )?;
        self.add_user_timeline(conn, vec![CollectedDataOption::PhoneNumber])?;

        Ok(())
    }

    fn add_email_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        if !self.portable.emails.is_empty() {
            // We don't currently support adding a secondary email
            return Err(UserError::CannotReplaceData(IdentityDataKind::Email.into()).into());
        }

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative email, if exists
        let kinds = vec![IdentityDataKind::Email.into()];
        DataLifetime::bulk_deactivate_speculative(conn, &self.scoped_user_id, kinds, seqno)?;

        // Add the new speculative email
        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let email = Email::create(
            conn,
            &self.user_vault.id,
            e_data,
            fingerprint,
            DataPriority::Primary,
            &self.scoped_user_id,
            seqno,
        )?;
        self.add_user_timeline(conn, vec![CollectedDataOption::Email])?;

        Ok(email.id)
    }

    fn update_identity_data_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        update: IdentityDataUpdate,
        fingerprints: NewFingerprints,
    ) -> Result<(), ApiError> {
        let existing_fields = self.get_populated_identity_fields();
        let uv = self.user_vault();

        let builder = UvdBuilder::build(update, uv.public_key.clone())?;
        let created_cd_options = builder.validate_and_save(
            conn,
            existing_fields,
            uv.id.clone(),
            self.scoped_user_id.clone(),
            fingerprints,
        )?;
        self.add_user_timeline(conn, created_cd_options)?;

        Ok(())
    }

    fn update_custom_data_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        let existing_lifetime_ids = update
            .keys()
            .flat_map(|k| self.kv_data().get(k))
            .map(|k| k.lifetime_id.clone())
            .collect();
        let updates = update
            .into_iter()
            .map(|(data_key, pii)| {
                let e_data = self.user_vault().public_key.seal_pii(&pii)?;
                Ok(NewKeyValueDataArgs { data_key, e_data })
            })
            .collect::<Result<Vec<_>, ApiError>>()?;

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // TODO: Should we use bulk_deactivate_speculative here? When we denormalize `key` onto DataLifetimeKind
        DataLifetime::bulk_deactivate(conn, existing_lifetime_ids, seqno)?;
        KeyValueData::bulk_create(conn, &self.user_vault().id, &self.scoped_user_id, updates, seqno)?;
        Ok(())
    }

    fn add_user_timeline(&self, conn: &mut TxnPgConn, attributes: Vec<CollectedDataOption>) -> ApiResult<()> {
        if !attributes.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo { attributes },
                self.user_vault.id.clone(),
                Some(self.scoped_user_id.clone()),
            )?;
        }
        Ok(())
    }
}

use super::uvd_builder::UvdBuilder;
use super::WriteableUvw;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::utils::fingerprint::FingerprintMap;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::TxnPgConn;
use newtypes::email::Email as NewtypeEmail;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataPriority, EmailId, Fingerprint, IdentityDataKind,
    IdentityDataUpdate, KvDataKey, PiiString, ValidatedPhoneNumber,
};
use std::collections::HashMap;

// Right now, we only allow adding data to a user vault inside of a locked transaction and when
// we have built the UserVaultWrapper for a specific tenant.
impl WriteableUvw {
    pub fn add_phone_number(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConn,
        // TODO we shouldn't need ValidatedPhoneNumber here once we stop using the country code
        phone_number: ValidatedPhoneNumber,
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
            e_phone_number: public_key.seal_pii(&phone_number.to_piistring())?,
            e_phone_country: public_key.seal_pii(&phone_number.iso_country_code)?,
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

    pub fn add_email(
        self, // Intentionally consume to prevent using stale UVW
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

    /// Applies the provided IdentityDataUpdate to the UVW.
    /// NOTE: if the update contains a phone number or email, we will ignore it
    pub fn update_identity_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        update: IdentityDataUpdate,
        fingerprints: FingerprintMap,
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

    pub fn update_custom_data(
        self, // consume self, since we don't want stale data getting used
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

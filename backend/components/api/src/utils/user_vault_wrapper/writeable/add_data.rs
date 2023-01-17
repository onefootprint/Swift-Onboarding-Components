use super::uvd_builder::UvdBuilder;
use super::WriteableUvw;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;
use db::models::data_lifetime::DataLifetime;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::user_timeline::UserTimeline;
use db::TxnPgConnection;
use newtypes::email::Email as NewtypeEmail;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataLifetimeKind, DataPriority, EmailId, Fingerprint, KvDataKey,
    PiiString, UvdKind,
};
use std::collections::HashMap;

// Right now, we only allow adding data to a user vault inside of a locked transaction and when
// we have built the UserVaultWrapper for a specific tenant.
impl WriteableUvw {
    pub fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        self.add_user_timeline(conn, vec![CollectedDataOption::Email])?;
        if !self.committed.emails.is_empty() {
            // We don't currently support adding a secondary email
            return Err(UserError::InvalidDataUpdate.into());
        }

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative email, if exists
        let kinds = vec![DataLifetimeKind::Email];
        DataLifetime::bulk_deactivate_uncommitted(conn, &self.scoped_user_id, kinds, seqno)?;

        // Add the new speculative email
        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let email = db::models::email::Email::create(
            conn,
            &self.user_vault.id,
            e_data,
            fingerprint,
            DataPriority::Primary,
            &self.scoped_user_id,
            seqno,
        )?;

        Ok(email.id)
    }

    pub fn update_identity_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(UvdKind, Fingerprint)>,
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
        conn: &mut TxnPgConnection,
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
        // TODO: Should we use bulk_deactivate_uncommitted here? When we denormalize `key` onto DataLifetimeKind
        DataLifetime::bulk_deactivate(conn, existing_lifetime_ids, seqno)?;
        KeyValueData::bulk_create(conn, &self.user_vault().id, &self.scoped_user_id, updates, seqno)?;
        Ok(())
    }

    fn add_user_timeline(
        &self,
        conn: &mut TxnPgConnection,
        attributes: Vec<CollectedDataOption>,
    ) -> ApiResult<()> {
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

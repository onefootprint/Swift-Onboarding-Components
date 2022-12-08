use super::uvd_builder::UvdBuilder;
use super::UserVaultWrapper;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::user_timeline::UserTimeline;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use newtypes::email::Email as NewtypeEmail;
use newtypes::{
    DataCollectedInfo, DataPriority, EmailId, Fingerprint, KvDataKey, PiiString, TenantId, UvdKind,
};
use std::collections::HashMap;

impl UserVaultWrapper {
    pub fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        self.assert_is_locked(conn)?;
        let scoped_user_id = self
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let priority = if !self.emails().is_empty() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };
        let user_vault_id = self.user_vault.id.clone();
        let email = db::models::email::Email::create(
            conn,
            user_vault_id,
            e_data,
            fingerprint,
            priority,
            scoped_user_id,
        )?;
        Ok(email.id)
    }

    pub fn update_identity_data(
        self, // Intentionally consume UVW to prevent using stale UVW
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(UvdKind, Fingerprint)>,
    ) -> Result<(), ApiError> {
        self.assert_is_locked(conn)?;
        let existing_fields = self.get_populated_fields();

        let builder = UvdBuilder::build(update, self.user_vault.public_key, existing_fields)?;
        let scoped_user_id = self
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let collected_data = builder.save(conn, self.user_vault.id.clone(), scoped_user_id, fingerprints)?;
        if !collected_data.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: collected_data,
                },
                self.user_vault.id,
                self.scoped_user_id,
            )?;
        }

        Ok(())
    }

    pub fn update_custom_data(
        &self, // Doesn't need to consume since we don't currently store custom data on UVW
        conn: &mut TxnPgConnection,
        tenant_id: TenantId,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        self.assert_is_locked(conn)?;

        let update = update
            .into_iter()
            .map(|(data_key, pii)| {
                let e_data = self.user_vault.public_key.seal_pii(&pii)?;
                Ok(NewKeyValueDataArgs { data_key, e_data })
            })
            .collect::<Result<Vec<_>, ApiError>>()?;

        KeyValueData::update_or_insert(conn, self.user_vault.id.clone(), tenant_id, update)?;
        Ok(())
    }
}

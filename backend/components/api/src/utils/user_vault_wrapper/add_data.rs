use super::uvd_builder::UvdBuilder;
use super::{LockedUserVaultWrapper, UserVaultWrapper};
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use newtypes::email::Email as NewtypeEmail;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataPriority, EmailId, Fingerprint, KvDataKey, PiiString,
    TenantId, UvdKind,
};
use std::collections::HashMap;

impl LockedUserVaultWrapper {
    /// Currently only used in UserVaultWrapper::create
    pub(super) fn add_verified_phone_number(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        args: NewPhoneNumberArgs,
    ) -> ApiResult<()> {
        let uvw = self.into_inner();
        if !uvw.phone_numbers().is_empty() {
            // We don't currently support adding another phone number
            return Err(UserError::InvalidDataUpdate.into());
        }
        uvw.add_user_timeline(conn, vec![CollectedDataOption::PhoneNumber])?;

        PhoneNumber::create_verified(
            conn,
            uvw.user_vault.id,
            args,
            DataPriority::Primary,
            uvw.scoped_user_id,
        )?;

        Ok(())
    }

    pub fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        let uvw = self.into_inner();
        let scoped_user_id = uvw
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        uvw.add_user_timeline(conn, vec![CollectedDataOption::Email])?;

        let email = email.to_piistring();
        let e_data = uvw.user_vault.public_key.seal_pii(&email)?;
        let priority = if !uvw.emails().is_empty() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };
        let user_vault_id = uvw.user_vault.id;
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
        let uvw = self.into_inner();
        let existing_fields = uvw.get_populated_fields();

        let builder = UvdBuilder::build(update, uvw.user_vault.public_key.clone(), existing_fields)?;
        let scoped_user_id = uvw
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let collected_data = builder.save(conn, uvw.user_vault.id.clone(), scoped_user_id, fingerprints)?;
        uvw.add_user_timeline(conn, collected_data)?;

        Ok(())
    }

    pub fn update_custom_data(
        &self, // Doesn't need to consume since we don't currently store custom data on UVW
        conn: &mut TxnPgConnection,
        tenant_id: TenantId,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        let update = update
            .into_iter()
            .map(|(data_key, pii)| {
                let e_data = self.user_vault().public_key.seal_pii(&pii)?;
                Ok(NewKeyValueDataArgs { data_key, e_data })
            })
            .collect::<Result<Vec<_>, ApiError>>()?;

        KeyValueData::update_or_insert(conn, self.user_vault().id.clone(), tenant_id, update)?;
        Ok(())
    }
}

impl UserVaultWrapper {
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
                self.scoped_user_id.clone(),
            )?;
        }
        Ok(())
    }
}

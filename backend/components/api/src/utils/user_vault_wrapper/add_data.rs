use super::uvd_builder::UvdBuilder;
use super::{LockedUserVaultWrapper, UserVaultWrapper};
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;
use db::models::data_lifetime::DataLifetime;
use db::models::kv_data::{KeyValueData, NewKeyValueDataArgs};
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::{HasDataAttributeFields, TxnPgConnection};
use newtypes::email::Email as NewtypeEmail;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataLifetimeKind, DataPriority, EmailId, Fingerprint, KvDataKey,
    PiiString, TenantId, UvdKind,
};
use std::collections::HashMap;

// Need a trait to define functions on Locked<T>, which is defined outside the crate.
pub trait UvwAddData {
    fn add_verified_phone_number(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        args: NewPhoneNumberArgs,
    ) -> ApiResult<()>;

    fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId>;

    fn update_identity_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(UvdKind, Fingerprint)>,
    ) -> ApiResult<()>;

    fn update_custom_data(
        &self, // Doesn't need to consume since we don't currently store custom data on UVW
        conn: &mut TxnPgConnection,
        tenant_id: TenantId,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()>;
}

impl UvwAddData for LockedUserVaultWrapper {
    fn add_verified_phone_number(
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

    fn add_email(
        self, // Intentionally consume to prevent using stale UVW
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        let uvw = self.into_inner();
        if !uvw.committed.emails.is_empty() {
            // We don't currently support adding a secondary email
            return Err(UserError::InvalidDataUpdate.into());
        }
        let scoped_user_id = uvw
            .scoped_user_id
            .clone()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        uvw.add_user_timeline(conn, vec![CollectedDataOption::Email])?;

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative email, if exists
        let kinds = vec![DataLifetimeKind::Email];
        DataLifetime::bulk_deactivate_uncommitted(conn, &scoped_user_id, kinds, seqno)?;

        // Add the new speculative email
        let email = email.to_piistring();
        let e_data = uvw.user_vault.public_key.seal_pii(&email)?;
        let user_vault_id = uvw.user_vault.id;
        let email = db::models::email::Email::create(
            conn,
            user_vault_id,
            e_data,
            fingerprint,
            DataPriority::Primary,
            scoped_user_id,
            seqno,
        )?;

        Ok(email.id)
    }

    fn update_identity_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(UvdKind, Fingerprint)>,
    ) -> Result<(), ApiError> {
        let existing_fields = self.get_populated_fields();
        let uv = self.user_vault();
        let scoped_user_id = self
            .scoped_user_id()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        let builder = UvdBuilder::build(update, uv.public_key.clone())?;
        let created_cd_options = builder.validate_and_save(
            conn,
            existing_fields,
            uv.id.clone(),
            scoped_user_id.clone(),
            fingerprints,
        )?;
        self.add_user_timeline(conn, created_cd_options)?;

        Ok(())
    }

    fn update_custom_data(
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

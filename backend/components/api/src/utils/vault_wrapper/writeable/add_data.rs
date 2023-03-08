use super::pvd_builder::PvdBuilder;
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
    CollectedDataOption, DataCollectedInfo, DataPriority, DataRequest, EmailId, Fingerprint,
    IdentityDataKind, KvDataKey, PiiString,
};
use std::collections::HashMap;
use std::str::FromStr;

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the VaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a VaultWrapper.
/// They use the private, xxx_unsafe methods, which cannot be exposed publically because they don't
/// take ownership over the VaultWrapper that is potentially stale after an update
impl WriteableUvw {
    pub fn update_custom_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        update: HashMap<KvDataKey, PiiString>,
    ) -> ApiResult<()> {
        self.update_custom_data_unsafe(conn, update)
    }

    /// Util function to make updates to multiple pieces of the UserVault in one transaction
    pub fn put_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DecomposedPutRequest,
        fingerprints: NewFingerprints,
        for_bifrost: bool,
    ) -> ApiResult<Option<EmailId>> {
        let DecomposedPutRequest {
            id_update,
            custom_data,
        } = request;
        let new_cdos = CollectedDataOption::list_from(id_update.keys().cloned().collect());

        // Extract phone and email from identity data since they are handled separately (for now)
        let mut id_update = id_update;
        let mut fingerprints = fingerprints;
        let phone_number = id_update.remove(&IdentityDataKind::PhoneNumber);
        let email = id_update
            .remove(&IdentityDataKind::Email)
            .map(|p| newtypes::email::Email::from_str(p.leak()))
            .transpose()?;

        let assert_non_portable = || -> Result<_, _> {
            // Cannot add identity data to a portable vault unless we are in bifrost
            if !for_bifrost && self.user_vault().is_portable {
                return Err(AuthError::CannotModifyPortableUser);
            }
            Ok(())
        };
        // Update custom data
        if !custom_data.is_empty() {
            self.update_custom_data_unsafe(conn, custom_data)?;
        }
        // Update PhoneNumber
        if let Some(phone_number) = phone_number {
            assert_non_portable()?;
            let Some(fp) = fingerprints.remove(&IdentityDataKind::PhoneNumber) else {
                return Err(ApiError::AssertionError("No fingerprint found for phone number".to_owned()));
            };
            self.add_phone_number_unsafe(conn, phone_number, fp)?;
        }
        // Update Email
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
        // Update UserVaultData
        if !id_update.is_empty() {
            assert_non_portable()?;
            self.update_identity_data_unsafe(conn, id_update, fingerprints)?;
        }

        // Add UserTimeline for all the newly added data
        if !new_cdos.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: new_cdos.into_iter().collect(),
                },
                self.user_vault.id.clone(),
                Some(self.scoped_user_id.clone()),
            )?;
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

        Ok(email.id)
    }

    fn update_identity_data_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        update: DataRequest<IdentityDataKind>,
        fingerprints: NewFingerprints,
    ) -> Result<(), ApiError> {
        let existing_fields = self.get_populated_identity_fields();
        let uv = self.user_vault();

        let builder = PvdBuilder::build(update, uv.public_key.clone())?;
        builder.validate_and_save(
            conn,
            existing_fields,
            uv.id.clone(),
            self.scoped_user_id.clone(),
            fingerprints,
        )?;

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
}

#[cfg(test)]
mod test {
    use crate::{errors::ApiResult, utils::vault_wrapper::WriteableUvw};
    use db::TxnPgConn;
    use newtypes::{put_data_request::PutDataRequest, DataIdentifier, Fingerprint, PiiString};
    use std::collections::HashMap;

    impl WriteableUvw {
        /// Shorthand to add data to a user vault in tests
        pub fn add_data_test(
            self,
            conn: &mut TxnPgConn,
            data: Vec<(DataIdentifier, PiiString)>,
        ) -> ApiResult<()> {
            let request = PutDataRequest::from(HashMap::from_iter(data.into_iter()));
            let request = request.decompose(true)?;
            let fingerprints = request
                .id_update
                .keys()
                .map(|idk| (*idk, Fingerprint(vec![])))
                .collect();
            self.put_data(conn, request, fingerprints, true)?;
            Ok(())
        }
    }
}

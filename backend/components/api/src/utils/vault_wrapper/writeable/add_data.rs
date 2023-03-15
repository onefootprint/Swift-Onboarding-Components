use super::vault_data_builder::VaultDataBuilder;
use super::WriteableVw;
use crate::auth::AuthError;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::utils::fingerprint::NewFingerprints;
use crate::utils::vault_wrapper::{Business, Person};
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::TxnPgConn;
use newtypes::email::Email as NewtypeEmail;
use newtypes::put_data_request::DecomposedPutRequest;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataLifetimeKind, DataPriority, DataRequest, EmailId,
    Fingerprint, IdentityDataKind as IDK, IsDataIdentifierDiscriminant, KvDataKey, PiiString, VdKind,
};
use std::collections::{HashMap, HashSet};
use std::str::FromStr;

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the VaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a VaultWrapper.
/// They use the private, xxx_unsafe methods, which cannot be exposed publically because they don't
/// take ownership over the VaultWrapper that is potentially stale after an update
impl<Type> WriteableVw<Type> {
    pub fn update_custom_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        update: DataRequest<KvDataKey>,
    ) -> ApiResult<()> {
        self.update_data_unsafe(conn, update, HashMap::new())
    }
}

impl WriteableVw<Person> {
    /// Util function to make updates to multiple pieces of the Vault in one transaction
    pub fn put_person_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DecomposedPutRequest,
        id_fingerprints: NewFingerprints<IDK>,
        for_bifrost: bool,
    ) -> ApiResult<Option<EmailId>> {
        request.assert_no_business_data()?;
        // TODO combine the DB queries to add custom data and id data
        let DecomposedPutRequest {
            id_update,
            custom_data,
            business_data: _,
        } = request;
        let new_cdos = CollectedDataOption::list_from(id_update.keys().cloned().collect());

        // Extract phone and email from identity data since they are handled separately (for now)
        let mut id_update = id_update;
        let mut id_fingerprints = id_fingerprints;
        let phone_number = id_update.remove(&IDK::PhoneNumber);
        let email = id_update
            .remove(&IDK::Email)
            .map(|p| newtypes::email::Email::from_str(p.leak()))
            .transpose()?;

        let assert_non_portable = || -> Result<_, _> {
            // Cannot add identity data to a portable vault unless we are in bifrost
            if !for_bifrost && self.vault().is_portable {
                return Err(AuthError::CannotModifyPortableUser);
            }
            Ok(())
        };
        // Update custom data
        if !custom_data.is_empty() {
            self.update_data_unsafe(conn, custom_data, HashMap::new())?;
        }
        // Update PhoneNumber
        if let Some(phone_number) = phone_number {
            assert_non_portable()?;
            let Some(fp) = id_fingerprints.remove(&IDK::PhoneNumber) else {
                return Err(ApiError::AssertionError("No fingerprint found for phone number".to_owned()));
            };
            self.add_phone_number_unsafe(conn, phone_number, fp)?;
        }
        // Update Email
        let new_email_id = if let Some(email) = email {
            assert_non_portable()?;
            let Some(fp) = id_fingerprints.remove(&IDK::Email) else {
                return Err(ApiError::AssertionError("No fingerprint found for email".to_owned()));
            };
            let email_id = self.add_email_unsafe(conn, email, fp)?;
            Some(email_id)
        } else {
            None
        };
        // Update VaultData
        if !id_update.is_empty() {
            assert_non_portable()?;
            // Temporarily make sure we don't serialize a phone/email since they aren't stored in the VaultData table
            if let Some(idk) = [IDK::PhoneNumber, IDK::Email]
                .iter()
                .find(|k| id_update.contains_key(k))
            {
                return Err(UserError::InvalidDataKind(*idk).into());
            }
            self.update_data_unsafe(conn, id_update, id_fingerprints)?;
        }

        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, new_cdos)?;

        Ok(new_email_id)
    }
}

impl WriteableVw<Business> {
    /// Util function to make updates to multiple pieces of the Vault in one transaction
    pub fn put_business_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DecomposedPutRequest,
    ) -> ApiResult<()> {
        // Error if trying to add person data to business vault
        request.assert_no_id_data()?;
        let DecomposedPutRequest {
            id_update: _,
            custom_data,
            business_data,
        } = request;
        let new_cdos = CollectedDataOption::list_from(business_data.keys().cloned().collect());

        // Update business data
        if !business_data.is_empty() {
            self.update_data_unsafe(conn, business_data, HashMap::new())?; // TODO fingerprints
        }
        // Update custom data
        if !custom_data.is_empty() {
            self.update_data_unsafe(conn, custom_data, HashMap::new())?;
        }

        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, new_cdos)?;

        Ok(())
    }
}

// Private methods that don't consume self to allow batching multiple
impl WriteableVw<Person> {
    fn add_phone_number_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        phone_number: PiiString,
        fingerprint: Fingerprint,
    ) -> ApiResult<()> {
        // Only used to add a phone number to a non-portable vault for now
        if !self.portable.phone_numbers.is_empty() {
            // We don't currently support adding a secondary phone
            return Err(UserError::CannotReplaceData(IDK::PhoneNumber.into()).into());
        }

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative phone, if exists
        let kinds = vec![IDK::PhoneNumber.into()];
        DataLifetime::bulk_deactivate_speculative(conn, &self.scoped_user_id, kinds, seqno)?;

        // Add the new speculative phone
        let public_key = &self.vault.public_key;
        let phone_info = NewPhoneNumberArgs {
            e_phone_number: public_key.seal_pii(&phone_number)?,
            sh_phone_number: fingerprint,
        };
        PhoneNumber::create(
            conn,
            &self.vault.id,
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
            return Err(UserError::CannotReplaceData(IDK::Email.into()).into());
        }

        let seqno = DataLifetime::get_next_seqno(conn)?;
        // Deactivate the old speculative email, if exists
        let kinds = vec![IDK::Email.into()];
        DataLifetime::bulk_deactivate_speculative(conn, &self.scoped_user_id, kinds, seqno)?;

        // Add the new speculative email
        let email = email.to_piistring();
        let e_data = self.vault.public_key.seal_pii(&email)?;
        let email = Email::create(
            conn,
            &self.vault.id,
            e_data,
            fingerprint,
            DataPriority::Primary,
            &self.scoped_user_id,
            seqno,
        )?;

        Ok(email.id)
    }
}

impl<Type> WriteableVw<Type> {
    fn update_data_unsafe<T>(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        update: DataRequest<T>,
        fingerprints: NewFingerprints<T>,
    ) -> ApiResult<()>
    where
        T: IsDataIdentifierDiscriminant + Into<VdKind>,
        DataLifetimeKind: From<T>,
    {
        let existing_fields = self.populated();
        let v = self.vault();

        let builder = VaultDataBuilder::build(update, v.public_key.clone())?;
        builder.validate_and_save(
            conn,
            existing_fields, // not all logic uses this
            v.id.clone(),
            self.scoped_user_id.clone(),
            fingerprints,
        )?;
        Ok(())
    }

    fn add_timeline_event(&self, conn: &mut TxnPgConn, cdos: HashSet<CollectedDataOption>) -> ApiResult<()> {
        // Add UserTimeline for all the newly added data
        if !cdos.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: cdos.into_iter().collect(),
                },
                self.vault.id.clone(),
                Some(self.scoped_user_id.clone()),
            )?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use crate::{
        errors::ApiResult,
        utils::vault_wrapper::{Person, WriteableVw},
    };
    use db::TxnPgConn;
    use newtypes::{put_data_request::PutDataRequest, DataIdentifier, Fingerprint, PiiString};
    use std::collections::HashMap;

    impl WriteableVw<Person> {
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
            self.put_person_data(conn, request, fingerprints, true)?;
            Ok(())
        }
    }
}

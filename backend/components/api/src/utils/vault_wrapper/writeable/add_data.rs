use super::vault_data_builder::VaultDataBuilder;
use super::WriteableVw;
use crate::auth::AuthError;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::utils::file_upload::FileUpload;
use crate::utils::fingerprint::NewFingerprints;
use crate::utils::vault_wrapper::{Business, Person};
use crate::State;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::email::Email;
use db::models::phone_number::{NewPhoneNumberArgs, PhoneNumber};
use db::models::user_timeline::UserTimeline;
use db::TxnPgConn;
use newtypes::email::Email as NewtypeEmail;
use newtypes::put_data_request::DecomposedPutRequest;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataIdentifier, DataLifetimeKind, DataPriority, DataRequest,
    DocumentKind, EmailId, Fingerprint, IdentityDataKind as IDK, IsDataIdentifierDiscriminant, KvDataKey,
    PiiString, ScopedVaultId, SealedVaultDataKey, VaultId, VaultPublicKey, VdKind,
};
use std::collections::HashMap;
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
            keys,
            id_update,
            ip_update,
            custom_data,
            business_data: _,
        } = request;

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

        // Update IP data
        if !ip_update.is_empty() {
            assert_non_portable()?;
            self.update_data_unsafe(conn, ip_update, HashMap::new())?;
        }

        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, keys)?;

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
            keys,
            id_update: _,
            ip_update: _,
            custom_data,
            business_data,
        } = request;

        // Update business data
        if !business_data.is_empty() {
            self.update_data_unsafe(conn, business_data, HashMap::new())?; // TODO fingerprints
        }
        // Update custom data
        if !custom_data.is_empty() {
            self.update_data_unsafe(conn, custom_data, HashMap::new())?;
        }

        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, keys)?;

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

    fn add_timeline_event(&self, conn: &mut TxnPgConn, keys: Vec<DataIdentifier>) -> ApiResult<()> {
        let cdos = CollectedDataOption::list_from(keys);
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
    use newtypes::{put_data_request::PutDataRequest, DataIdentifier, Fingerprint, ParseOptions, PiiString};
    use std::collections::HashMap;

    impl WriteableVw<Person> {
        /// Shorthand to add data to a user vault in tests
        pub fn add_data_test(
            self,
            conn: &mut TxnPgConn,
            data: Vec<(DataIdentifier, PiiString)>,
        ) -> ApiResult<()> {
            let request = PutDataRequest::from(HashMap::from_iter(data.into_iter()));
            let opts = ParseOptions {
                for_bifrost: true,
                allow_extra_field_errors: false,
            };
            let request = request.decompose(opts)?;
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

impl WriteableVw<Person> {
    // TODO: could later figure out how to merge this into VaultDataBuilder or make a complimentary struct for docs
    // Docs are fun in that it sounds like we need to support having multiple docs of the same kind in general (eg: right now you can upload 2 FINRA docs)
    //  so the logic around deactivating/portabalizing DL's is a little divergent here
    pub fn put_document(
        self,
        conn: &mut TxnPgConn,
        kind: DocumentKind,
        mime_type: String,
        filename: String,
        e_data_key: SealedVaultDataKey,
        s3_url: String,
    ) -> ApiResult<DocumentData> {
        let vault_id = self.vault.id.clone();
        let scoped_user_id = self.scoped_user_id;

        // TODO: remove Dataliftime constraint on document.* so we can suppport multiple docs at once
        Ok(DocumentData::create(
            conn,
            &vault_id,
            Some(&scoped_user_id),
            kind,
            mime_type,
            filename,
            s3_url,
            e_data_key,
        )?)
        // TODO: whoopsie timeline events are CDO-specific so gunna be a little non-trivial to make for doc uploads
    }
}

pub async fn encrypt_to_s3(
    state: &State,
    file: &FileUpload,
    kind: DocumentKind,
    public_key: &VaultPublicKey,
    vault_id: &VaultId,
    scoped_vault_id: &ScopedVaultId,
) -> ApiResult<(SealedVaultDataKey, String)> {
    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            public_key.as_ref(),
        )?;
    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
    let sealed_bytes = data_key.seal_bytes(&file.bytes)?;

    let bucket = &state.config.document_s3_bucket.clone();
    let key = document_s3_key(vault_id, scoped_vault_id, kind);

    let s3_path = state
        .s3_client
        .put_object(bucket, key, sealed_bytes.0, Some(&file.mime_type))
        .await?;

    tracing::info!(s3_path = s3_path, scoped_vault_id=%scoped_vault_id, vault_id=%vault_id, filename=%file.filename, mime_type=%file.mime_type, "Uploaded Document to S3");

    Ok((e_data_key, s3_path))
}

fn hash_id<T: ToString>(id: &T) -> String {
    crypto::base64::encode_config(
        crypto::sha256(id.to_string().as_str().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    )
}

fn document_s3_key(vault_id: &VaultId, scoped_vault_id: &ScopedVaultId, kind: DocumentKind) -> String {
    format!(
        "docs/encrypted/{}/{}/{}/{}",
        hash_id(vault_id),
        hash_id(scoped_vault_id),
        kind,
        crypto::random::gen_random_alphanumeric_code(32),
    )
}

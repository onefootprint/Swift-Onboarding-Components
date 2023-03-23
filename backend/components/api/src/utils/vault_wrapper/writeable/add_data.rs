use super::vault_data_builder::VaultDataBuilder;
use super::WriteableVw;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::utils::file_upload::FileUpload;
use crate::utils::fingerprint::NewFingerprints;
use crate::utils::vault_wrapper::{Business, Person};
use crate::State;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::contact_info::{ContactInfo, NewContactInfoArgs};
use db::models::document_data::DocumentData;
use db::models::user_timeline::UserTimeline;
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{
    CollectedDataOption, ContactInfoPriority, DataCollectedInfo, DataIdentifier, DataRequest, DocumentKind,
    IdentityDataKind as IDK, ScopedVaultId, SealedVaultDataKey, VaultId, VaultPublicKey, VdKind,
};
use std::collections::HashMap;

type NewContactInfo = (DataIdentifier, ContactInfo);

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the VaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a VaultWrapper.
/// They use the private, update_data_unsafe method, which cannot be exposed publically because they don't
/// take ownership over the VaultWrapper that is potentially stale after an update
impl WriteableVw<Person> {
    /// Util function to make updates to multiple pieces of the Vault in one transaction
    pub fn put_person_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DataRequest,
        id_fingerprints: NewFingerprints<IDK>,
    ) -> ApiResult<Vec<NewContactInfo>> {
        request.assert_no_business_data()?;
        // Update VaultData
        let keys = request.keys().cloned().collect();
        let new_contact_info = if !request.is_empty() {
            let vds = self.update_data_unsafe(conn, request, id_fingerprints)?;
            Self::create_contact_info_if_needed(conn, vds)?
        } else {
            vec![]
        };
        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, keys)?;

        Ok(new_contact_info)
    }
}

impl WriteableVw<Business> {
    /// Util function to make updates to multiple pieces of the Vault in one transaction
    pub fn put_business_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DataRequest,
    ) -> ApiResult<()> {
        // Error if trying to add person data to business vault
        request.assert_no_id_data()?;
        let keys = request.keys().cloned().collect();
        // TODO fingerprints
        self.update_data_unsafe(conn, request, HashMap::new())?;
        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, keys)?;

        Ok(())
    }
}

impl<Type> WriteableVw<Type> {
    fn update_data_unsafe(
        &self, // NOTE: we should be consuming this but we are not, which makes it unsafe
        conn: &mut TxnPgConn,
        update: DataRequest,
        fingerprints: NewFingerprints<IDK>,
    ) -> ApiResult<Vec<VaultData>> {
        let existing_fields = self.populated_dis();
        let v = self.vault();

        // Don't allow replacing a committed phone/email yet
        let irreplaceable_idks = vec![IDK::PhoneNumber, IDK::Email];
        for idk in irreplaceable_idks {
            let update_has_idk = update.keys().any(|id| id == &DataIdentifier::from(idk));
            let vault_already_has_idk = self.portable.get(idk).is_some();
            if update_has_idk && vault_already_has_idk {
                // We don't currently support adding a phone/email
                return Err(UserError::CannotReplaceData(idk.into()).into());
            }
        }

        // Add the data
        let builder = VaultDataBuilder::build(update, v.public_key.clone())?;
        let vds = builder.validate_and_save(
            conn,
            existing_fields, // not all logic uses this
            v.id.clone(),
            self.scoped_user_id.clone(),
            fingerprints,
        )?;

        Ok(vds)
    }

    fn create_contact_info_if_needed(
        conn: &mut TxnPgConn,
        new_vds: Vec<VaultData>,
    ) -> ApiResult<Vec<NewContactInfo>> {
        // Create ContactInfo rows for new phone numbers/emails
        let new_contact_info = new_vds
            .iter()
            .filter(|vd| matches!(vd.kind, VdKind::Id(IDK::PhoneNumber) | VdKind::Id(IDK::Email)))
            .map(|vd| NewContactInfoArgs {
                is_verified: false,
                priority: ContactInfoPriority::Primary,
                lifetime_id: vd.lifetime_id.clone(),
            })
            .collect_vec();
        let cis = ContactInfo::bulk_create(conn, new_contact_info)?;
        // Zip CI with corresponding DI
        let cis = cis
            .into_iter()
            .map(|ci| -> ApiResult<_> {
                let di = new_vds
                    .iter()
                    .find(|vd| vd.lifetime_id == ci.lifetime_id)
                    .map(|vd| DataIdentifier::from(vd.kind.clone()))
                    .ok_or_else(|| ApiError::AssertionError("No lifetime ID".to_owned()))?;
                Ok((di, ci))
            })
            .collect::<ApiResult<Vec<_>>>()?;
        Ok(cis)
    }

    fn add_timeline_event(&self, conn: &mut TxnPgConn, keys: Vec<DataIdentifier>) -> ApiResult<()> {
        let cdos = CollectedDataOption::list_from(keys);
        // Add UserTimeline for all the newly added data
        if !cdos.is_empty() {
            // Create a timeline event that shows all the new data that was added
            let info = DataCollectedInfo {
                attributes: cdos.into_iter().collect(),
            };
            UserTimeline::create(conn, info, self.vault.id.clone(), self.scoped_user_id.clone())?;
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
    use newtypes::{DataIdentifier, DataRequest, Fingerprint, ParseOptions, PiiString};
    use std::collections::HashMap;

    impl WriteableVw<Person> {
        /// Shorthand to add data to a user vault in tests
        pub fn add_data_test(
            self,
            conn: &mut TxnPgConn,
            data: Vec<(DataIdentifier, PiiString)>,
        ) -> ApiResult<()> {
            let opts = ParseOptions {
                for_bifrost: true,
                allow_extra_field_errors: false,
            };
            let data = HashMap::from_iter(data.into_iter());
            let request = DataRequest::clean_and_validate(data, opts)?;
            let fingerprints = request
                .keys()
                .filter_map(|di| match di {
                    DataIdentifier::Id(idk) => Some(idk),
                    _ => None,
                })
                .map(|idk| (*idk, Fingerprint(vec![])))
                .collect();
            self.put_person_data(conn, request, fingerprints)?;
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
        let su_id = self.scoped_user_id;

        // TODO: remove Dataliftime constraint on document.* so we can suppport multiple docs at once
        Ok(DocumentData::create(
            conn, &vault_id, &su_id, kind, mime_type, filename, s3_url, e_data_key,
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

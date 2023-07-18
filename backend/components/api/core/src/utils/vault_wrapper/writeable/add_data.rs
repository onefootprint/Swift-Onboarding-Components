use super::WriteableVw;
use crate::errors::{ApiResult, AssertionError};
use crate::utils::file_upload::FileUpload;
use crate::utils::vault_wrapper::Person;
use crate::State;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::{ContactInfo, NewContactInfoArgs};
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::user_timeline::UserTimeline;
use db::models::vault_data::VaultData;
use db::{DbError, PgConn, TxnPgConn};
use itertools::Itertools;
use newtypes::{BusinessDataKind as BDK, DataLifetimeSeqno, S3Url};
use newtypes::{
    CollectedDataOption, ContactInfoPriority, DataCollectedInfo, DataIdentifier, DataRequest, DocumentDataId,
    DocumentUploadedInfo, Fingerprints, IdentityDataKind as IDK, KycedBusinessOwnerData, PiiString,
    ScopedVaultId, SealedVaultDataKey, VaultId, VaultPublicKey,
};

type NewContactInfo = (DataIdentifier, ContactInfo);

pub struct PatchDataResult {
    pub new_ci: Vec<NewContactInfo>,
    pub seqno: DataLifetimeSeqno,
}

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the VaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a VaultWrapper.
/// They use the private, update_data_unsafe method, which cannot be exposed publically because they don't
/// take ownership over the VaultWrapper that is potentially stale after an update
impl<Type> WriteableVw<Type> {
    pub fn patch_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: DataRequest<Fingerprints>,
    ) -> ApiResult<PatchDataResult> {
        request.assert_allowable_identifiers(self.vault.kind)?;
        let keys = request.keys().cloned().collect();
        let kyced_bos = request.get(&BDK::KycedBeneficialOwners.into()).cloned();
        let (new_ci, seqno) = if !request.is_empty() {
            // Must do this validation here inside the locked, WriteableUvw
            let request = self.validate_request(request)?;
            let (vds, seqno) = request.save(conn, self.vault(), self.scoped_vault_id.clone())?;
            let new_ci = Self::create_contact_info_if_needed(conn, vds)?;
            (new_ci, seqno)
        } else {
            // The request was a no-op, no reason to increment the seqno
            let seqno = DataLifetime::get_current_seqno(conn)?;
            (vec![], seqno)
        };
        self.create_bos_if_needed(conn, kyced_bos)?;
        // Add timeline event for all the newly added data
        self.add_timeline_event(conn, keys)?;

        let result = PatchDataResult { new_ci, seqno };
        Ok(result)
    }

    /// We have book-keeping for business owners that are KYCed outside of the vault. When BOs are
    /// added to the vault, also create those secondary records in the DB.
    fn create_bos_if_needed(&self, conn: &mut TxnPgConn, kyced_bos: Option<PiiString>) -> ApiResult<()> {
        let Some(kyced_bos) = kyced_bos else {
            return Ok(());
        };
        // When the KycedBos were added to the vault, we autogenerated a link_id for each BO that
        // should be used as the PK of the BusinessOwner row in order to tie the records together.
        let kyced_bos: Vec<KycedBusinessOwnerData> = serde_json::de::from_str(kyced_bos.leak())?;
        // Skip the first BO since it is the primary
        let bo_ids = kyced_bos.into_iter().skip(1).map(|bo| bo.link_id).collect_vec();
        BusinessOwner::bulk_create_secondary(conn, bo_ids, self.vault().id.clone())?;

        Ok(())
    }

    fn create_contact_info_if_needed(
        conn: &mut TxnPgConn,
        new_vds: Vec<VaultData>,
    ) -> ApiResult<Vec<NewContactInfo>> {
        // Create ContactInfo rows for new phone numbers/emails
        let new_contact_info = new_vds
            .iter()
            .filter(|vd| {
                matches!(
                    vd.kind,
                    DataIdentifier::Id(IDK::PhoneNumber) | DataIdentifier::Id(IDK::Email)
                )
            })
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
                    .map(|vd| vd.kind.clone())
                    .ok_or(AssertionError("No lifetime ID"))?;
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
            UserTimeline::create(conn, info, self.vault.id.clone(), self.scoped_vault_id.clone())?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use crate::{errors::ApiResult, utils::vault_wrapper::WriteableVw};
    use db::TxnPgConn;
    use newtypes::{
        DataIdentifier, DataRequest, Fingerprint, FingerprintRequest, FingerprintScopeKind, IdentityDataKind,
        PiiString, ValidateArgs,
    };
    use std::collections::HashMap;

    use super::NewContactInfo;

    impl<Type> WriteableVw<Type> {
        /// Shorthand to add data to a vault in tests
        pub fn patch_data_test(
            self,
            conn: &mut TxnPgConn,
            data: Vec<(DataIdentifier, PiiString)>,
            create_fingerprints: bool,
        ) -> ApiResult<Vec<NewContactInfo>> {
            let data = HashMap::from_iter(data.into_iter());
            let request =
                DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(self.vault.is_live))?;
            // Add fingerprints for ID data
            let fingerprints = request
                .iter()
                .filter_map(|(di, pii)| match di {
                    DataIdentifier::Id(idk) => Some((idk, pii)),
                    _ => None,
                })
                .map(|(idk, pii)| {
                    let scope = if *idk == IdentityDataKind::PhoneNumber {
                        FingerprintScopeKind::Global
                    } else {
                        FingerprintScopeKind::Tenant
                    };
                    // for testing: we just do a regular hash
                    let fingerprint = Fingerprint(crypto::sha256(pii.leak().as_bytes()).to_vec());
                    FingerprintRequest {
                        kind: (*idk).into(),
                        fingerprint,
                        scope,
                    }
                })
                .collect();
            let request = if create_fingerprints {
                request.manual_fingerprints(fingerprints)
            } else {
                request.no_fingerprints()
            };
            let new_ci = self.patch_data(conn, request)?.new_ci;
            Ok(new_ci)
        }
    }
}

impl WriteableVw<Person> {
    /// TODO: could later figure out how to merge this into VaultDataBuilder or make a complimentary struct for docs
    /// Docs are fun in that it sounds like we need to support having multiple docs of the same kind in general (eg: right now you can upload 2 FINRA docs)
    ///  so the logic around deactivating/portabalizing DL's is a little divergent here
    /// NOTE: do not read from `self` after using this util as `self` will be stale
    pub fn put_document_unsafe(
        &self,
        conn: &mut TxnPgConn,
        kind: DataIdentifier,
        mime_type: String,
        filename: String,
        e_data_key: SealedVaultDataKey,
        s3_url: S3Url,
    ) -> ApiResult<(DocumentData, DataLifetimeSeqno)> {
        let vault_id = self.vault.id.clone();
        let su_id = self.scoped_vault_id.clone();

        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_speculative(conn, &su_id, vec![kind.clone()], seqno)?;

        let doc = DocumentData::create(
            conn, &vault_id, &su_id, kind, mime_type, filename, s3_url, e_data_key, seqno,
        )?;

        self.add_document_uploaded_timeline_event(conn, doc.id.clone())?;

        Ok((doc, seqno))
    }

    fn add_document_uploaded_timeline_event(
        &self,
        conn: &mut PgConn,
        doc_id: DocumentDataId,
    ) -> Result<(), DbError> {
        let info = DocumentUploadedInfo { id: doc_id };
        UserTimeline::create(conn, info, self.vault().id.clone(), self.scoped_vault_id.clone())
    }
}

pub async fn seal_file_and_upload_to_s3(
    state: &State,
    file: &FileUpload,
    kind: DataIdentifier,
    public_key: &VaultPublicKey,
    vault_id: &VaultId,
    scoped_vault_id: &ScopedVaultId,
) -> ApiResult<(SealedVaultDataKey, S3Url)> {
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

    Ok((e_data_key, S3Url::from(s3_path)))
}

fn hash_id<T: ToString>(id: &T) -> String {
    crypto::base64::encode_config(
        crypto::sha256(id.to_string().as_str().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    )
}

fn document_s3_key(vault_id: &VaultId, scoped_vault_id: &ScopedVaultId, kind: DataIdentifier) -> String {
    format!(
        "docs/encrypted/{}/{}/{}/{}",
        hash_id(vault_id),
        hash_id(scoped_vault_id),
        kind,
        crypto::random::gen_random_alphanumeric_code(32),
    )
}

use super::DataRequestSource;
use super::FingerprintedDataRequest;
use super::SavedData;
use super::ValidatedDataRequest;
use super::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::errors::AssertionError;
use crate::utils::file_upload::FileUpload;
use crate::utils::vault_wrapper::Person;
use crate::FpResult;
use crate::State;
use chrono::Utc;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultUpdate;
use db::models::task::Task;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::BusinessDataKind as BDK;
use newtypes::CollectedDataOption;
use newtypes::DataCollectedInfo;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::KycedBusinessOwnerData;
use newtypes::PiiString;
use newtypes::S3Url;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultVersionNumber;
use newtypes::SealedVaultDataKey;
use newtypes::UserVaultUpdateSource;
use newtypes::UserVaultUpdatedPayload;
use newtypes::VaultId;
use newtypes::WebhookEvent;

type NewContactInfo = (DataIdentifier, ContactInfo);

pub struct PatchDataResult {
    pub new_vd: Vec<VaultData>,
    pub new_ci: Vec<NewContactInfo>,
    pub seqno: DataLifetimeSeqno,
    pub new_version: ScopedVaultVersionNumber,
}

pub struct NewDocument {
    pub kind: DataIdentifier,
    pub mime_type: String,
    pub filename: String,
    pub e_data_key: SealedVaultDataKey,
    pub s3_url: S3Url,
    pub source: DataLifetimeSource,
}

/// Right now, we only allow adding data to a user vault inside of a locked transaction and when
/// we have built the VaultWrapper for a specific tenant.
/// These are the publically accessible utils to update data on a VaultWrapper.
/// They use the private, update_data_unsafe method, which cannot be exposed publically because they
/// don't take ownership over the VaultWrapper that is potentially stale after an update
impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::patch_data", skip_all)]
    pub fn patch_data(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: FingerprintedDataRequest,
        request_source: DataRequestSource,
    ) -> FpResult<PatchDataResult> {
        let kyced_bos = request.get(&BDK::KycedBeneficialOwners.into()).cloned();
        let fields = request.data.keys().cloned().collect_vec();
        let request = self.validate_request(conn, request, &request_source)?;
        let result = self.internal_save_data(conn, request, request_source.actor().cloned())?;
        self.create_bos_if_needed(conn, kyced_bos)?;

        // create a webhook task for the vault update
        // currently we do this only for dashboard actors
        if matches!(
            request_source,
            DataRequestSource::TenantPatchVault(AuthActor::FirmEmployee(_))
                | DataRequestSource::TenantPatchVault(AuthActor::TenantUser(_))
        ) {
            let webhook_event = WebhookEvent::UserVaultUpdated(UserVaultUpdatedPayload {
                fp_id: self.sv.fp_id.clone(),
                timestamp: Utc::now(),
                is_live: self.sv.is_live,
                source: UserVaultUpdateSource::Dashboard,
                fields,
            });
            let task_data = self.sv.webhook_event(webhook_event);
            Task::create(conn, Utc::now(), task_data)?;
        }


        Ok(result)
    }

    pub(in crate::utils::vault_wrapper) fn internal_save_data(
        &self,
        conn: &mut TxnPgConn,
        request: ValidatedDataRequest,
        actor: Option<AuthActor>,
    ) -> FpResult<PatchDataResult> {
        let is_prefill = request.is_prefill;
        let keys = request.data.iter().map(|d| d.kind.clone()).collect_vec();
        let SavedData {
            vd,
            ci,
            seqno,
            new_version,
        } = request.save(conn, self, actor.clone())?;

        if keys.iter().any(|di| !di.is_vault_storage_free()) && !self.sv.is_billable_for_vault_storage {
            // If we just added the first billable DI, set the vault as billable
            let update = ScopedVaultUpdate {
                is_billable_for_vault_storage: Some(true),
                ..Default::default()
            };
            ScopedVault::update(conn, &self.sv.id, update)?;
        }

        // Add timeline event for all the newly added data.
        // NOTE: this must happen after saving data for the seqno to be correct on the timeline event.
        // TODO let's make this accept the seqno as an argument
        self.add_timeline_event(conn, keys, actor, is_prefill)?;

        // Zip new CIs with their DI
        let new_ci = ci
            .into_iter()
            .filter_map(|ci| -> Option<_> {
                let vd = vd.iter().find(|vd| vd.lifetime_id == ci.lifetime_id)?;
                Some((vd.kind.clone(), ci))
            })
            .collect();

        let result = PatchDataResult {
            new_vd: vd,
            new_ci,
            seqno,
            new_version,
        };
        Ok(result)
    }

    /// We have book-keeping for business owners that are KYCed outside of the vault. When BOs are
    /// added to the vault, also create those secondary records in the DB.
    #[tracing::instrument("WriteableVw::create_bos_if_needed", skip_all)]
    fn create_bos_if_needed(&self, conn: &mut TxnPgConn, kyced_bos: Option<PiiString>) -> FpResult<()> {
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

    #[tracing::instrument("WriteableVw::add_timeline_event", skip_all)]
    fn add_timeline_event(
        &self,
        conn: &mut TxnPgConn,
        keys: Vec<DataIdentifier>,
        actor: Option<AuthActor>,
        is_prefill: bool,
    ) -> FpResult<()> {
        // Add UserTimeline for all the newly added data
        if !keys.is_empty() {
            // Create a timeline event that shows all the new data that was added
            let cdos = CollectedDataOption::list_from(keys.clone());
            let info = DataCollectedInfo {
                attributes: cdos.into_iter().collect(),
                targets: keys,
                actor: actor.map(|a| a.into()),
                is_prefill,
            };
            UserTimeline::create(conn, info, self.vault.id.clone(), self.sv.id.clone())?;
        }
        Ok(())
    }
}

impl WriteableVw<Person> {
    /// TODO: could later figure out how to merge this into VaultDataBuilder or make a complimentary
    /// struct for docs Docs are fun in that it sounds like we need to support having multiple
    /// docs of the same kind in general (eg: right now you can upload 2 FINRA docs)
    ///  so the logic around deactivating/portabalizing DL's is a little divergent here
    /// NOTE: do not read from `self` after using this util as `self` will be stale
    #[allow(clippy::too_many_arguments)]
    pub fn put_document_unsafe(
        &self,
        conn: &mut TxnPgConn,
        kind: DataIdentifier,
        mime_type: String,
        filename: String,
        e_data_key: SealedVaultDataKey,
        s3_url: S3Url,
        source: DataLifetimeSource,
        actor: Option<AuthActor>,
        make_timeline_event: bool,
    ) -> FpResult<(DocumentData, DataLifetimeSeqno)> {
        let new_doc = NewDocument {
            kind,
            mime_type,
            filename,
            e_data_key,
            s3_url,
            source,
        };

        let (docs, seqno) = self.put_documents_unsafe(conn, vec![new_doc], actor, make_timeline_event)?;
        let doc = docs
            .into_iter()
            .next()
            .ok_or(AssertionError("No document inserted"))?;

        Ok((doc, seqno))
    }

    #[allow(clippy::too_many_arguments)]
    pub fn put_documents_unsafe(
        &self,
        conn: &mut TxnPgConn,
        docs: Vec<NewDocument>,
        actor: Option<AuthActor>,
        make_timeline_event: bool,
    ) -> FpResult<(Vec<DocumentData>, DataLifetimeSeqno)> {
        let vault_id = self.vault.id.clone();

        let seqno = DataLifetime::get_next_seqno(conn)?;
        let kinds = docs.iter().map(|d| d.kind.clone()).collect_vec();
        DataLifetime::bulk_deactivate_kinds(conn, &self.sv, kinds.clone(), seqno)?;

        let docs = docs
            .into_iter()
            .map(|d| {
                let NewDocument {
                    kind,
                    mime_type,
                    filename,
                    s3_url,
                    e_data_key,
                    source,
                } = d;
                DocumentData::create(
                    conn,
                    &vault_id,
                    &self.sv,
                    kind,
                    mime_type,
                    filename,
                    s3_url,
                    e_data_key,
                    seqno,
                    source,
                    actor.clone().map(|a| a.into()),
                )
            })
            .collect::<db::DbResult<Vec<_>>>()?;

        if make_timeline_event {
            self.add_timeline_event(conn, kinds, actor, false)?;
        }

        Ok((docs, seqno))
    }
}

pub async fn seal_file_and_upload_to_s3(
    state: &State,
    file: &FileUpload,
    kind: &DataIdentifier,
    vault: &Vault,
    scoped_vault_id: &ScopedVaultId,
) -> FpResult<(SealedVaultDataKey, S3Url)> {
    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            vault.public_key.as_ref(),
        )?;
    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
    let sealed_bytes = data_key.seal_bytes(file.bytes.leak_slice())?;

    let bucket = &state.config.document_s3_bucket.clone();
    let key = document_s3_key(&vault.id, scoped_vault_id, kind);

    let s3_path = state
        .s3_client
        .put_bytes(bucket, key, sealed_bytes.0, Some(file.mime_type.clone()))
        .await?;

    tracing::info!(s3_path = s3_path, scoped_vault_id=%scoped_vault_id, vault_id=%vault.id, filename=%file.filename, mime_type=%file.mime_type, "Uploaded Document to S3");

    Ok((e_data_key, S3Url::from(s3_path)))
}

fn hash_id<T: ToString>(id: &T) -> String {
    crypto::base64::encode_config(
        crypto::sha256(id.to_string().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    )
}

fn document_s3_key(vault_id: &VaultId, scoped_vault_id: &ScopedVaultId, kind: &DataIdentifier) -> String {
    format!(
        "docs/encrypted/{}/{}/{}/{}",
        hash_id(vault_id),
        hash_id(scoped_vault_id),
        kind,
        crypto::random::gen_random_alphanumeric_code(32),
    )
}

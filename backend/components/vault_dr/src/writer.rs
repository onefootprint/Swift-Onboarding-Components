use crate::AgeEncryptor;
use crate::BlobBaseName;
use crate::Error;
use crate::Knobs;
use crate::Manifest;
use crate::PublicKey;
use crate::PublicKeySet;
use crate::VaultDrAwsConfig;
use crate::WrappedKey;
use age::secrecy::Zeroize;
use api_core::utils::vault_wrapper::bulk_decrypt_dls_unchecked;
use api_core::utils::vault_wrapper::MimeTypedPii;
use api_core::utils::vault_wrapper::Pii;
use api_core::FpResult;
use api_core::State;
use api_errors::AssertionError;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::primitives::SdkBody;
use db::errors::FpOptionalExtension;
use db::helpers::bulk_get_vdr_blob_keys_active_at;
use db::helpers::incorrect_get_vault_dr_data_lifetime_batch;
use db::helpers::incorrect_get_vault_dr_scoped_vault_version_batch;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::IsLive;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_version::ScopedVaultVersion;
use db::models::tenant::Tenant;
use db::models::vault_dr::NewVaultDrBlob;
use db::models::vault_dr::NewVaultDrManifest;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrBlob;
use db::models::vault_dr::VaultDrConfig;
use db::models::vault_dr::VaultDrManifest;
use futures::future::BoxFuture;
use futures::FutureExt;
use futures::Stream;
use futures::StreamExt;
use futures::TryFutureExt;
use futures::TryStreamExt;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ScopedVaultVersionId;
use newtypes::ScopedVaultVersionNumber;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::collections::HashMap;
use std::fmt::Debug;
use tokio::task::JoinHandle;
use tokio::time::Instant;
use tracing::Instrument;

// https://www.iana.org/assignments/media-types/application/vnd.age
const AGE_CONTENT_TYPE: &str = "application/vnd.age";

// https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html?icmpid=docs_amazons3_console#UserMetadata
const X_AMZ_META_FP_DOC_MIME_TYPE: &str = "x-amz-meta-fp-doc-mime-type";

// The number of scoped vault versions to handle simultaneously in bulk DB queries after the initial
// loading of a batch of SVVs.
const SVV_CHUNK_SIZE: usize = 64;

#[derive(Debug, Clone)]
pub struct VaultDrWriter {
    config_id: VaultDrConfigId,
    tenant_id: TenantId,
    is_live: IsLive,

    aws_config: VaultDrAwsConfig,
    bucket_path_namespace: String,
    s3_client: aws_sdk_s3::Client,

    org_public_keys: PublicKeySet,
    recovery_public_key: PublicKey,

    knobs: Knobs,
}

pub struct EncryptedRecord {
    pub e_record: Vec<u8>,
    pub wrapped_record_key: WrappedKey,
    pub document_mime_type: Option<PiiString>,
}

pub struct BatchResult {
    pub num_blobs: u32,
    pub num_manifests: u32,
}

impl VaultDrWriter {
    pub async fn new(state: &State, config_id: &VaultDrConfigId, knobs: Knobs) -> FpResult<Self> {
        let state_config = state.config.vault_dr_config.clone();

        let config_id_0 = config_id.clone();
        let (config, aws_pre_enrollment) = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let config = VaultDrConfig::get(conn, &config_id_0)
                    .optional()?
                    .ok_or(Error::NotEnrolled)?;

                let aws_pre_enrollment = VaultDrAwsPreEnrollment::get(conn, &config.aws_pre_enrollment_id)?;

                Ok((config, aws_pre_enrollment))
            })
            .await?;

        let VaultDrConfig {
            tenant_id,
            is_live,
            aws_account_id,
            aws_role_name,
            s3_bucket_name,
            bucket_path_namespace,
            org_public_keys,
            recovery_public_key,
            ..
        } = config;

        let org_public_keys = PublicKeySet::new(
            org_public_keys
                .into_iter()
                .map(|k| k.parse::<PublicKey>())
                .collect::<Result<_, _>>()?,
        )?;
        let recovery_public_key: PublicKey = recovery_public_key.parse()?;

        let aws_config = VaultDrAwsConfig {
            state_config,
            aws_account_id,
            aws_external_id: aws_pre_enrollment.aws_external_id,
            aws_role_name,
            s3_bucket_name,
        };

        let s3_client = aws_config.s3_client().await?;

        let writer = VaultDrWriter {
            config_id: config_id.clone(),
            tenant_id,
            is_live,
            aws_config,
            s3_client,
            bucket_path_namespace,
            org_public_keys,
            recovery_public_key,
            knobs,
        };

        writer.aws_config.validate().await?;

        Ok(writer)
    }

    pub async fn write_batch(&self, state: &State, fp_id_filter: Option<Vec<FpId>>) -> FpResult<BatchResult> {
        let num_blobs = self
            .write_blob_batch(state, self.knobs.blob_batch_size, fp_id_filter.clone())
            .await?;

        let num_manifests = self
            .write_manifest_batch(state, self.knobs.manifest_batch_size, fp_id_filter)
            .await?;

        Ok(BatchResult {
            num_blobs,
            num_manifests,
        })
    }

    #[tracing::instrument("VaultDrWriter::write_blob_batch", skip_all)]
    async fn write_blob_batch(
        &self,
        state: &State,
        batch_size: u32,
        fp_id_filter: Option<Vec<FpId>>,
    ) -> FpResult<u32> {
        let tenant_id = self.tenant_id.clone();
        let config_id = self.config_id.clone();
        let is_live = self.is_live;

        let (dls, sv_id_to_fp_id) = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let dls = incorrect_get_vault_dr_data_lifetime_batch(
                    conn,
                    &tenant_id,
                    is_live,
                    &config_id,
                    batch_size,
                    fp_id_filter,
                )?;

                let sv_ids = dls.iter().map(|dl| &dl.scoped_vault_id).collect_vec();
                let sv_id_to_fp_id: HashMap<_, _> = ScopedVault::bulk_get(conn, sv_ids, &tenant_id, is_live)?
                    .into_iter()
                    .map(|(sv, _)| (sv.id, sv.fp_id))
                    .collect();

                Ok((dls, sv_id_to_fp_id))
            })
            .await?;

        let mut dls_by_id = dls.into_iter().map(|dl| (dl.id.clone(), dl)).collect();
        let pii_by_dl = bulk_decrypt_dls_unchecked(state, &self.tenant_id, self.is_live, &dls_by_id).await?;

        // Encrypt and write records to S3 in parallel tasks.
        let concurrency_limit = self.knobs.record_task_concurrency;
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live,
            concurrency_limit,
            "Encrypting and writing records to S3 in parallel"
        );

        let blob_futs = pii_by_dl
            .into_iter()
            .map(|(dl_id, pii)| {
                let dl = dls_by_id.remove(&dl_id).ok_or(AssertionError(
                    "Got DL ID in bulk_decrypt_dls_unchecked that was not present in dls_by_id",
                ))?;

                let fp_id = sv_id_to_fp_id
                    .get(&dl.scoped_vault_id)
                    .ok_or(AssertionError("Got DL with SV ID not in sv_id_to_fp_id"))?
                    .clone();

                let writer = self.clone();
                Ok(async move { writer.encrypt_and_write_record_to_s3(fp_id, dl, pii).await })
            })
            .collect::<FpResult<Vec<_>>>()?;

        // n.b. Constructing an iterator, tasks are not spawned until the iterator is consumed.
        let blob_tasks_iter = blob_futs.into_iter().map(|blob_fut| {
            let task = tokio::task::spawn(blob_fut.in_current_span());
            Ok(task)
        });

        let new_blobs = futures::stream::iter(blob_tasks_iter)
            // We don't care about the order in which we write blobs within a batch since blobs are
            // only acknowledged by clients once a corresponding manifest is written.
            .try_buffer_unordered(concurrency_limit)
            .try_collect::<Vec<_>>()
            .await?
            .into_iter()
            .collect::<FpResult<Vec<_>>>()?;

        let blob_count = new_blobs.len();
        state
            .db_pool
            .db_transaction(move |conn| VaultDrBlob::bulk_create(conn, new_blobs))
            .await?;

        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live,
            blob_count,
            concurrency_limit,
            "Wrote batch of encrypted record blobs to S3"
        );

        Ok(blob_count as u32)
    }

    #[tracing::instrument("VaultDrWriter::encrypt_and_write_record_to_s3", skip_all, fields(
        config_id=%self.config_id,
        tenant_id=%self.tenant_id,
        is_live=%self.is_live,
        fp_id=%fp_id,
        dl.id=%dl.id,
        dl.created_seqno=%dl.created_seqno,
        dl.kind=%dl.kind,
        dl.scoped_vault_id=%dl.scoped_vault_id,
    ))]
    async fn encrypt_and_write_record_to_s3(
        &self,
        fp_id: FpId,
        dl: DataLifetime,
        pii: MimeTypedPii,
    ) -> FpResult<NewVaultDrBlob> {
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live=%self.is_live,
            fp_id=%fp_id,
            dl.id=%dl.id,
            dl.created_seqno=%dl.created_seqno,
            dl.kind=%dl.kind,
            dl.scoped_vault_id=%dl.scoped_vault_id,
            "Encrypting and writing record",
        );

        let e_record = self.encrypt_record(pii).await?;
        let new_blob = self.write_blob_to_s3(fp_id, dl, e_record).await?;

        Ok(new_blob)
    }

    #[tracing::instrument("VaultDrWriter::encrypt_record", skip_all)]
    async fn encrypt_record(&self, pii: MimeTypedPii) -> FpResult<EncryptedRecord> {
        let MimeTypedPii {
            pii,
            document_mime_type,
        } = pii;

        let org_public_keys = self.org_public_keys.clone();
        let recovery_public_key = self.recovery_public_key.clone();

        // This can be relatively slow depending on data size (10s of ms).
        tokio::task::spawn_blocking(move || {
            let record_private_key = age::x25519::Identity::generate();
            let record_public_key = PublicKey::X15519Recipient(record_private_key.to_public());

            let wrapped_record_key = org_public_keys.wrap_key(record_private_key)?;

            let record_public_key_set = PublicKeySet::new(vec![record_public_key, recovery_public_key])?;

            let mut plaintext_record = match pii {
                Pii::Value(v) => v.to_piistring()?.leak_to_string().into_bytes(),
                Pii::Bytes(b) => b.into_leak(),
            };

            let e_record = record_public_key_set.encrypt(&plaintext_record)?;
            plaintext_record.zeroize();

            Ok(EncryptedRecord {
                e_record,
                wrapped_record_key,
                document_mime_type,
            })
        })
        .await?
    }

    #[tracing::instrument("VaultDrWriter::write_blob_to_s3", skip_all)]
    async fn write_blob_to_s3(
        &self,
        fp_id: FpId,
        dl: DataLifetime,
        e_record: EncryptedRecord,
    ) -> FpResult<NewVaultDrBlob> {
        // To make blob S3 writes idempotent and blob keys 1:1 with each (VaultDrConfig,
        // DataLifetime) pair, the blob key doesn't depend on the non-deterministic encrypted
        // record content.
        let key = blob_key(&self.bucket_path_namespace, &fp_id, &dl)?;

        let EncryptedRecord {
            e_record,
            wrapped_record_key,
            document_mime_type,
        } = e_record;

        let digest_bytes = crypto::sha256(&e_record);
        let checksum_b64_sha256 = base64::encode(digest_bytes);
        let content_length = e_record.len();

        let obj_metadata = document_mime_type.as_ref().map(|mime_type| {
            let mut metadata = HashMap::new();
            metadata.insert(X_AMZ_META_FP_DOC_MIME_TYPE.to_owned(), mime_type.leak_to_string());
            metadata
        });

        let body = ByteStream::new(SdkBody::from(e_record));
        let req = self
            .s3_client
            .put_object()
            .bucket(&self.aws_config.s3_bucket_name)
            .checksum_sha256(&checksum_b64_sha256)
            .content_type(AGE_CONTENT_TYPE)
            .set_metadata(obj_metadata)
            .content_length(content_length.try_into().map_err(|_| Error::S3ObjectTooLarge)?)
            .key(&key)
            .body(body);

        let start = Instant::now();
        let result = req.send().await.map_err(|e| -> Error {
            let svc_error = e.into_service_error();
            tracing::error!(error = ?svc_error, "S3 PutObject failed");
            Box::new(svc_error).into()
        })?;
        let elapsed = start.elapsed();

        // TODO: log at debug level
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live=%self.is_live,
            fp_id=%fp_id,
            dl.id=%dl.id,
            dl.created_seqno=%dl.created_seqno,
            dl.kind=%dl.kind,
            dl.scoped_vault_id=%dl.scoped_vault_id,
            key,
            blob.checksum = checksum_b64_sha256,
            blob.response_checksum = result.checksum_sha256,
            blob.content_length = content_length,
            blob.etag = result.e_tag.as_deref().unwrap_or(""),
            blob.doc_mime_type =? document_mime_type.map(|s| s.leak_to_string()),
            elapsed_ms = elapsed.as_millis(),
            bytes_per_second = content_length as f64 / elapsed.as_secs_f64(),
            "Wrote blob to S3",
        );

        let content_etag = result.e_tag.ok_or_else(|| Error::S3ETagNotAvailable)?;

        let got_checksum_sha256 = result
            .checksum_sha256
            .ok_or(Error::S3Sha256ChecksumNotAvailable)?;

        if got_checksum_sha256 != checksum_b64_sha256 {
            return Err(Error::S3PutObjectChecksumMismatch {
                got: got_checksum_sha256,
                expected: checksum_b64_sha256,
            }
            .into());
        }


        let new_blob = NewVaultDrBlob {
            config_id: self.config_id.clone(),
            data_lifetime_id: dl.id,
            dl_created_seqno: dl.created_seqno,
            bucket_path: key,
            content_etag,
            wrapped_record_key: wrapped_record_key.into(),
            content_length_bytes: content_length as i64,
        };
        Ok(new_blob)
    }

    /// Writes manifests corresponding with up to `batch_size` ScopedVaultVersions.
    #[tracing::instrument("VaultDrWriter::write_manifest_batch", skip_all)]
    async fn write_manifest_batch(
        &self,
        state: &State,
        batch_size: u32,
        fp_id_filter: Option<Vec<FpId>>,
    ) -> FpResult<u32> {
        let tenant_id = self.tenant_id.clone();
        let config_id = self.config_id.clone();
        let is_live = self.is_live;

        // First get all ScopedVaultVersions for this batch.
        let (tenant, svvs) = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let tenant = Tenant::get(conn, &tenant_id)?;

                let svvs = incorrect_get_vault_dr_scoped_vault_version_batch(
                    conn,
                    &tenant_id,
                    is_live,
                    &config_id,
                    batch_size,
                    fp_id_filter,
                )?;

                Ok((tenant, svvs))
            })
            .await?;

        // Only write manifests for demo tenants for now until we update the client to test the
        // feature end-to-end. That way, we can easily clean up bugs without involving customers.
        if !tenant.is_demo_tenant {
            return Ok(0);
        }

        let svv_chunks = svvs.into_iter().chunks(SVV_CHUNK_SIZE);
        let svv_chunks = futures::stream::iter(svv_chunks.into_iter());

        let tenant_id = self.tenant_id.clone();
        let config_id = self.config_id.clone();

        let concurrency_limit = self.knobs.manifest_task_concurrency;
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live,
            concurrency_limit,
            "Writing vault manifests to S3 in parallel"
        );

        // For each chunk of SVVs in the batch, map to a stream of manifests and flatten into a
        // unified stream of manifests for the entire batch.
        //
        // We buffer several manifest streams before flattening to enable pipelining of batch
        // DB queries on an SVV chunk and the dependant writing of manifests to S3.
        let manifest_tasks_stream = svv_chunks
            .map(|svvs| {
                let svvs = svvs.collect_vec();

                self.build_manifests_tasks_stream_for_svvs(
                    state,
                    config_id.clone(),
                    tenant_id.clone(),
                    is_live,
                    svvs,
                )
                .boxed()
            })
            .buffered(2)
            .try_flatten();

        // We don't care about the order in which we write manifests within a batch since the
        // client doesn't rely on all versions of a vault having data available. The client only
        // looks at the latest available manifest version.
        let new_manifests = manifest_tasks_stream
            .map_ok(|join_handle| join_handle.map_err(Into::into))
            .try_buffer_unordered(concurrency_limit)
            .try_collect::<Vec<_>>()
            .await?
            .into_iter()
            .collect::<FpResult<Vec<_>>>()?;

        let manifest_count = new_manifests.len();
        state
            .db_pool
            .db_transaction(move |conn| VaultDrManifest::bulk_create(conn, new_manifests))
            .await?;

        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live,
            manifest_count,
            concurrency_limit,
            "Wrote batch of vault manifests to S3"
        );

        Ok(manifest_count as u32)
    }

    /// Constructs a stream that spawns tasks to write manifests for the given chunk of
    /// ScopedVaultVersions. bulk_get_vdr_blob_keys_active_at loads a lot
    /// of data for each SVV using queries that are not easy to index, so we spit up each VDR batch
    /// into smaller chunks so we can pipeline those loads with writing other manifests.
    #[tracing::instrument("VaultDrWriter::build_manifests_tasks_stream_for_svvs", skip_all)]
    async fn build_manifests_tasks_stream_for_svvs(
        &self,
        state: &State,
        config_id: VaultDrConfigId,
        tenant_id: TenantId,
        is_live: bool,
        svvs: Vec<ScopedVaultVersion>,
    ) -> FpResult<impl Stream<Item = FpResult<JoinHandle<FpResult<NewVaultDrManifest>>>> + Send + 'static>
    {
        let writer = self.clone();

        // For the chunk of SVVs, load the associated data to build manifests.
        let (scoped_vaults, svv_id_to_blobs) = state
            .db_pool
            .db_query({
                let svvs = svvs.clone();
                move |conn| -> FpResult<_> {
                    let svv_ids = svvs.iter().map(|svv| &svv.id).collect_vec();
                    let svv_id_to_blobs = bulk_get_vdr_blob_keys_active_at(conn, &config_id, svv_ids)?;

                    let sv_ids = svvs.iter().map(|svv| &svv.scoped_vault_id).collect_vec();
                    let scoped_vaults = ScopedVault::bulk_get(conn, sv_ids, &tenant_id, is_live)?;

                    Ok((scoped_vaults, svv_id_to_blobs))
                }
            })
            .await?;

        // Compute the max version for each scoped vault. In each batch, we'll write
        // manifest.latest.json only for the max manifest version.
        let sv_id_to_max_batch_version = svvs
            .iter()
            .map(|svv| (svv.scoped_vault_id.clone(), svv.version))
            .into_grouping_map()
            .max();

        // Regroup the data so we can get the fp_id for each ScopedVaultVersion.
        let sv_id_to_fp_id: HashMap<_, _> = scoped_vaults
            .into_iter()
            .map(|(sv, _)| (sv.id, sv.fp_id))
            .collect();
        let svv_id_to_fp_id: HashMap<_, _> = svvs
            .iter()
            .filter_map(|svv| {
                sv_id_to_fp_id
                    .get(&svv.scoped_vault_id)
                    .map(|fp_id| (svv.id.clone(), fp_id.clone()))
            })
            .collect();
        let svvs_by_id: HashMap<_, _> = svvs.into_iter().map(|svv| (svv.id.clone(), svv)).collect();

        let manifest_stream = futures::stream::iter(svv_id_to_blobs.into_iter())
            .map(move |(svv_id, blobs)| -> FpResult<_> {
                let fp_id = svv_id_to_fp_id
                    .get(&svv_id)
                    .ok_or(AssertionError("svv_id not in svv_id_to_fp_id"))?
                    .clone();

                let svv = svvs_by_id
                    .get(&svv_id)
                    .ok_or(AssertionError("svv_id not in svvs_by_id"))?
                    .clone();
                let seqno = svv.seqno;

                let fields = blobs
                    .into_iter()
                    .map(|(di, key)| (di, BlobBaseName::new_from_key(key)))
                    .collect();

                let manifest = Manifest {
                    version: svv.version,
                    fields,
                };

                let mut manifest_futs: Vec<BoxFuture<_>> = vec![];

                // Write manifest.<n>.json.
                let fut = {
                    let writer = writer.clone();
                    let fp_id = fp_id.clone();
                    let svv_id = svv_id.clone();
                    let manifest = manifest.clone();
                    async move {
                        writer
                            .write_manifest_to_s3(fp_id, svv_id, seqno, manifest, false)
                            .await
                    }
                };
                manifest_futs.push(Box::pin(fut));

                // Write manifest.latest.json as well if this is the latest manifest version in the
                // batch.
                let batch_max_version = sv_id_to_max_batch_version
                    .get(&svv.scoped_vault_id)
                    .ok_or(AssertionError("svv_id not in sv_id_to_max_version"))?;
                let is_latest_manifest = svv.version == *batch_max_version;
                if is_latest_manifest {
                    let writer = writer.clone();
                    let fut = async move {
                        writer
                            .write_manifest_to_s3(fp_id, svv_id, seqno, manifest, true)
                            .await
                    };
                    manifest_futs.push(Box::pin(fut));
                }

                let manifest_tasks = futures::stream::iter(manifest_futs).map(|manifest_fut| {
                    let task = tokio::task::spawn(manifest_fut.in_current_span());
                    Ok(task)
                });

                Ok(manifest_tasks)
            })
            .try_flatten();

        Ok(manifest_stream)
    }

    #[tracing::instrument("VaultDrWriter::write_manifest_to_s3", skip_all, fields(
        fp_id=%fp_id,
        svv_id=%svv_id,
        seqno=%seqno
    ))]
    async fn write_manifest_to_s3(
        &self,
        fp_id: FpId,
        svv_id: ScopedVaultVersionId,
        seqno: DataLifetimeSeqno,
        manifest: Manifest,
        latest_manifest: bool,
    ) -> FpResult<NewVaultDrManifest> {
        let manifest_bytes = serde_json::to_vec(&manifest)?;
        let digest_bytes = crypto::sha256(&manifest_bytes);
        let checksum_b64_sha256 = base64::encode(digest_bytes);
        let content_length = manifest_bytes.len();

        let version = if latest_manifest {
            None
        } else {
            Some(manifest.version)
        };
        let key = manifest_key(&self.bucket_path_namespace, &fp_id, version)?;


        let body = ByteStream::new(SdkBody::from(manifest_bytes));
        let req = self
            .s3_client
            .put_object()
            .bucket(&self.aws_config.s3_bucket_name)
            .checksum_sha256(&checksum_b64_sha256)
            .content_length(content_length.try_into().map_err(|_| Error::S3ObjectTooLarge)?)
            .key(&key)
            .body(body);

        let result = req.send().await.map_err(|e| -> Error {
            let svc_error = e.into_service_error();
            tracing::error!(error = ?svc_error, "S3 PutObject failed");
            Box::new(svc_error).into()
        })?;

        // TODO: log at debug level
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live=%self.is_live,
            fp_id=%fp_id,
            scoped_vault_version.id=%svv_id,
            scoped_vault_version.version=%manifest.version,
            key,
            manifest.checksum = checksum_b64_sha256,
            manifest.response_checksum = result.checksum_sha256,
            manifest.content_length = content_length,
            manifest.etag = result.e_tag.as_deref().unwrap_or(""),
            "Wrote vault manifest to S3",
        );

        let content_etag = result.e_tag.ok_or_else(|| Error::S3ETagNotAvailable)?;

        let got_checksum_sha256 = result
            .checksum_sha256
            .ok_or(Error::S3Sha256ChecksumNotAvailable)?;

        if got_checksum_sha256 != checksum_b64_sha256 {
            return Err(Error::S3PutObjectChecksumMismatch {
                got: got_checksum_sha256,
                expected: checksum_b64_sha256,
            }
            .into());
        }


        let new_manifest = NewVaultDrManifest {
            config_id: self.config_id.clone(),
            scoped_vault_version_id: svv_id,
            bucket_path: key,
            content_etag,
            content_length_bytes: content_length as i64,
            seqno,
        };
        Ok(new_manifest)
    }
}

fn fp_id_path(bucket_path_namespace: &str, fp_id: &FpId) -> FpResult<String> {
    // Partition by fp_id_(test_) prefix plus the first two characters of the ID.
    //
    // For example:
    //   fp_id_ab
    //   fp_bid_test_cd
    //
    // Often when reading large amounts of data from an S3 bucket, it's handy to split up the
    // work over multiple machines/workers. This is facilitated with partition keys.
    // An fp_id may be too fine-grained for a partition key for large customers, so we provide
    // a coarser partition key. Using the last two characters of the fp_id gives us ~4k
    // partitions max, which can be quickly paginated over for scheduling purposes
    //
    // The client relies on the same partitioning logic as below.
    let fp_id = fp_id.to_string();
    let parts: Vec<&str> = fp_id.split('_').collect();

    let id = parts.last().ok_or(AssertionError("fp_id is empty"))?;
    let id_first_two = id.chars().take(2).collect::<String>();

    let prefix = parts.into_iter().rev().skip(1).rev().join("_");

    let fp_id_partition = format!("{}_{}", prefix, id_first_two);

    let path = format!(
        "footprint/vdr/{}/{}/{}",
        bucket_path_namespace, fp_id_partition, &fp_id
    );
    Ok(path)
}

// The determistic S3 blob key corresponding to a (VdrConfig, DataLifetime) pair.
fn blob_key(bucket_path_namespace: &str, fp_id: &FpId, dl: &DataLifetime) -> FpResult<String> {
    let fp_id_path = fp_id_path(bucket_path_namespace, fp_id)?;

    let created_ts = dl.created_at.timestamp().to_string();
    if created_ts.len() != 10 {
        // By year 2286, this code will surely be dead :)
        return AssertionError(
            "Timestamp is not 10 characters long. Timestamps between 2001 and 2286 should all be 10 characters.",
        )
        .into();
    }

    // For a given VDR config, blobs correspond 1:1 to DLs, so we take the hash of the DL ID as an
    // opaque, public, unique ID for the blob.
    let h_dl_id = crypto::sha256(dl.id.as_bytes());
    let public_unique_blob_id = base64::encode_config(h_dl_id, base64::URL_SAFE_NO_PAD);

    let key = format!(
        "{}/data/{}/{}-{}",
        fp_id_path, dl.kind, created_ts, public_unique_blob_id
    );
    Ok(key)
}

fn manifest_key(
    bucket_path_namespace: &str,
    fp_id: &FpId,
    version: Option<ScopedVaultVersionNumber>,
) -> FpResult<String> {
    let fp_id_path = fp_id_path(bucket_path_namespace, fp_id)?;

    let version = match version {
        Some(v) => {
            if v <= ScopedVaultVersionNumber::from(0) {
                return AssertionError("Manifest version must be a positive integer").into();
            }
            v.to_string()
        }
        None => "latest".to_string(),
    };

    let key = format!("{}/meta/manifest.{}.json", fp_id_path, version);
    Ok(key)
}


#[cfg(test)]
mod tests {
    use super::*;
    use chrono::DateTime;
    use chrono::Utc;
    use newtypes::DataLifetimeId;
    use newtypes::DataLifetimeSource;
    use newtypes::KvDataKey;
    use newtypes::ScopedVaultId;
    use newtypes::VaultId;
    use newtypes::VaultKind;
    use std::str::FromStr;

    #[test]
    fn test_blob_key() {
        let created_at = DateTime::<Utc>::from_str("2023-01-01T00:00:00Z").unwrap();

        let key = blob_key(
            "a1b6cf025aaa4e5f926c2fa182755392",
            &FpId::from_str("fp_id_Vu5lEC3KeaAfVeedqtBjQ9").unwrap(),
            &DataLifetime {
                id: DataLifetimeId::test_data("dl_id_1".to_owned()),
                _created_at: Utc::now(),
                _updated_at: Utc::now(),
                vault_id: VaultId::generate(VaultKind::Person),
                scoped_vault_id: ScopedVaultId::generate(VaultKind::Person),
                created_at,
                portablized_at: None,
                deactivated_at: None,
                created_seqno: 111.into(),
                portablized_seqno: Some(222.into()),
                deactivated_seqno: Some(333.into()),
                kind: newtypes::DataIdentifier::Custom(KvDataKey::from_str("my_custom_field").unwrap()),
                source: DataLifetimeSource::Tenant,
                actor: None,
                origin_id: None,
            },
        )
        .unwrap();

        assert_eq!(&key, "footprint/vdr/a1b6cf025aaa4e5f926c2fa182755392/fp_id_Vu/fp_id_Vu5lEC3KeaAfVeedqtBjQ9/data/custom.my_custom_field/1672531200-VJssGUtupV0AyqP0F_BWmHDqodj9DRL2eYIRMrfvCTI");
    }

    #[test]
    fn test_manifest_key() {
        let key = manifest_key(
            "a1b6cf025aaa4e5f926c2fa182755392",
            &FpId::from_str("fp_id_Vu5lEC3KeaAfVeedqtBjQ9").unwrap(),
            None,
        )
        .unwrap();
        assert_eq!(
            &key,
            "footprint/vdr/a1b6cf025aaa4e5f926c2fa182755392/fp_id_Vu/fp_id_Vu5lEC3KeaAfVeedqtBjQ9/meta/manifest.latest.json"
        );

        let key = manifest_key(
            "a1b6cf025aaa4e5f926c2fa182755392",
            &FpId::from_str("fp_id_Vu5lEC3KeaAfVeedqtBjQ9").unwrap(),
            Some(ScopedVaultVersionNumber::from(1)),
        )
        .unwrap();
        assert_eq!(
            &key,
            "footprint/vdr/a1b6cf025aaa4e5f926c2fa182755392/fp_id_Vu/fp_id_Vu5lEC3KeaAfVeedqtBjQ9/meta/manifest.1.json"
        );

        let key = manifest_key(
            "a1b6cf025aaa4e5f926c2fa182755392",
            &FpId::from_str("fp_id_Vu5lEC3KeaAfVeedqtBjQ9").unwrap(),
            Some(ScopedVaultVersionNumber::from(0)),
        );
        assert!(key.is_err(), "Zero is an invalid manifest version");
    }
}

use crate::AgeEncryptor;
use crate::Error;
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
use chrono::Utc;
use db::errors::FpOptionalExtension;
use db::helpers::load_vault_dr_data_lifetime_batch;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::IsLive;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_dr::NewVaultDrBlob;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrBlob;
use db::models::vault_dr::VaultDrConfig;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::collections::HashMap;
use std::fmt::Debug;

// https://www.iana.org/assignments/media-types/application/vnd.age
const AGE_CONTENT_TYPE: &str = "application/vnd.age";

// https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html?icmpid=docs_amazons3_console#UserMetadata
const X_AMZ_META_FP_DOC_MIME_TYPE: &str = "x-amz-meta-fp-doc-mime-type";

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
}

pub struct EncryptedRecord {
    pub e_record: Vec<u8>,
    pub wrapped_record_key: WrappedKey,
    pub document_mime_type: Option<PiiString>,
}

impl VaultDrWriter {
    pub async fn new(state: &State, config_id: &VaultDrConfigId) -> FpResult<Self> {
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
        };

        writer.aws_config.validate().await?;

        Ok(writer)
    }

    pub async fn write_blobs_batch(
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
                let dls = load_vault_dr_data_lifetime_batch(
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
        let concurrency_limit = state.config.vault_dr_config.record_task_concurrency;
        tracing::info!(
            config_id=%self.config_id,
            tenant_id=%self.tenant_id,
            is_live,
            concurrency_limit,
            "Encrypting and writing records to S3 in parallel"
        );

        let mut blob_futs = vec![];
        for (dl_id, pii) in pii_by_dl {
            let dl = dls_by_id.remove(&dl_id).ok_or(AssertionError(
                "Got DL ID in bulk_decrypt_dls_unchecked that was not present in dls_by_id",
            ))?;

            let fp_id = sv_id_to_fp_id
                .get(&dl.scoped_vault_id)
                .ok_or(AssertionError("Got DL with SV ID not in sv_id_to_fp_id"))?
                .clone();

            let fut = self.encrypt_and_write_record_to_s3(fp_id, dl, pii);
            blob_futs.push(fut);
        }

        let new_blobs = futures::stream::iter(blob_futs)
            .buffer_unordered(concurrency_limit)
            .collect::<Vec<FpResult<_>>>()
            .await
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
            "Wrote batch of records to S3"
        );

        Ok(blob_count as u32)
    }

    #[tracing::instrument("VaultDrWriter::encrypt_and_write_record", skip_all, fields(
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
        let EncryptedRecord {
            e_record,
            wrapped_record_key,
            document_mime_type,
        } = e_record;


        let digest_bytes = crypto::sha256(&e_record);
        let checksum_b64_sha256 = base64::encode(digest_bytes);
        let content_length = e_record.len();

        let key = blob_key(&self.bucket_path_namespace, &fp_id, &dl, &digest_bytes)?;

        let obj_metadata = document_mime_type.map(|mime_type| {
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

        let result = req.send().await.map_err(|e| -> Error {
            let svc_error = e.into_service_error();
            tracing::error!(error = ?svc_error, "S3 PutObject failed");
            Box::new(svc_error).into()
        })?;

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
            "Wrote blob to S3",
        );

        let content_etag = result.e_tag.ok_or_else(|| Error::S3ETagNotAvailable)?;

        let got_checksum_sha256 = result
            .checksum_sha256
            .ok_or_else(|| Error::S3Sha256ChecksumNotAvailable)?;

        if got_checksum_sha256 != checksum_b64_sha256 {
            return Err(Error::S3PutObjectChecksumMismatch {
                got: got_checksum_sha256,
                expected: checksum_b64_sha256,
            }
            .into());
        }


        let new_blob = NewVaultDrBlob {
            created_at: Utc::now(),
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
}

fn blob_key(
    bucket_path_namespace: &str,
    fp_id: &FpId,
    dl: &DataLifetime,
    blob_sha256_digest: &[u8],
) -> FpResult<String> {
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
    let fp_id = fp_id.to_string();
    let parts: Vec<&str> = fp_id.split('_').collect();

    let id = parts.last().ok_or(AssertionError("fp_id is empty"))?;
    let id_first_two = id.chars().take(2).collect::<String>();

    let prefix = parts.into_iter().rev().skip(1).rev().join("_");
    let fp_id_partition = format!("{}_{}", prefix, id_first_two);

    let created_ts = dl.created_at.timestamp().to_string();
    if created_ts.len() != 10 {
        // By year 2286, this code will surely be dead :)
        return AssertionError(
            "Timestamp is not 10 characters long. Timestamps between 2001 and 2286 should all be 10 characters.",
        )
        .into();
    }

    let digest_str = base64::encode_config(blob_sha256_digest, base64::URL_SAFE_NO_PAD);

    let key = format!(
        "footprint/vdr/{}/{}/{}/data/{}/{}-{}",
        bucket_path_namespace, fp_id_partition, &fp_id, dl.kind, created_ts, digest_str,
    );
    Ok(key)
}


#[cfg(test)]
mod tests {
    use super::*;
    use chrono::DateTime;
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
            &[
                0xd8, 0xfb, 0xfe, 0x2e, 0x41, 0xb1, 0xe5, 0x76, 0xbb, 0xf3, 0xf3, 0x56, 0xbc, 0x98, 0xdd,
                0x41, 0x68, 0x56, 0xe0, 0x6a, 0x38, 0xd9, 0xb5, 0xf1, 0x70, 0x3a, 0xac, 0xc4, 0xca, 0x53,
                0x9e, 0x6b,
            ],
        )
        .unwrap();

        assert_eq!(&key, "footprint/vdr/a1b6cf025aaa4e5f926c2fa182755392/fp_id_Vu/fp_id_Vu5lEC3KeaAfVeedqtBjQ9/data/custom.my_custom_field/1672531200-2Pv-LkGx5Xa78_NWvJjdQWhW4Go42bXxcDqsxMpTnms");
    }
}

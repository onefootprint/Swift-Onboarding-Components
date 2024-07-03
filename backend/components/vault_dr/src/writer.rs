use crate::AgeEncryptor;
use crate::Error;
use crate::PublicKey;
use crate::PublicKeySet;
use crate::VaultDrAwsConfig;
use crate::WrappedKey;
use age::secrecy::Zeroize;
use api_core::utils::vault_wrapper::bulk_decrypt_dls_unchecked;
use api_core::utils::vault_wrapper::Pii;
use api_core::FpResult;
use api_core::State;
use api_errors::AssertionError;
use db::errors::FpOptionalExtension;
use db::helpers::load_vault_dr_data_lifetime_batch;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::IsLive;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use itertools::Itertools;
use newtypes::FpId;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::collections::HashMap;
use std::fmt::Debug;

#[derive(Debug, Clone)]
pub struct VaultDrWriter {
    config_id: VaultDrConfigId,
    tenant_id: TenantId,
    is_live: IsLive,

    aws_config: VaultDrAwsConfig,

    org_public_keys: PublicKeySet,
    recovery_public_key: PublicKey,
}

pub struct EncryptedRecord {
    pub e_record: Vec<u8>,
    pub wrapped_record_key: WrappedKey,
}

impl VaultDrWriter {
    pub async fn new(state: &State, config_id: &VaultDrConfigId) -> FpResult<Self> {
        let state_config = state.config.vault_dr_config.clone();

        let config_id = config_id.clone();
        let writer = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let config = VaultDrConfig::get(conn, &config_id)
                    .optional()?
                    .ok_or(Error::NotEnrolled)?;

                let aws_pre_enrollment = VaultDrAwsPreEnrollment::get(conn, &config.aws_pre_enrollment_id)?;


                let VaultDrConfig {
                    tenant_id,
                    is_live,
                    aws_account_id,
                    aws_role_name,
                    s3_bucket_name,
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

                Ok(VaultDrWriter {
                    config_id,
                    tenant_id,
                    is_live,
                    aws_config: VaultDrAwsConfig {
                        state_config,
                        aws_account_id,
                        aws_external_id: aws_pre_enrollment.aws_external_id,
                        aws_role_name,
                        s3_bucket_name,
                    },
                    org_public_keys,
                    recovery_public_key,
                })
            })
            .await?;

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

        let mut blob_count = 0;
        for (dl_id, pii) in pii_by_dl {
            let dl = dls_by_id.remove(&dl_id).ok_or(AssertionError(
                "Got DL ID in bulk_decrypt_dls_unchecked that was not present in dls_by_id",
            ))?;

            let fp_id = sv_id_to_fp_id
                .get(&dl.scoped_vault_id)
                .ok_or(AssertionError("Got DL with SV ID not in sv_id_to_fp_id"))?;

            self.encrypt_and_write_record(fp_id, &dl, pii).await?;

            blob_count += 1;
        }


        Ok(blob_count)
    }

    #[tracing::instrument("VaultDrWriter::encrypt_and_write_record", skip_all, fields(
            tenant_id=%self.tenant_id,
            is_live=%self.is_live,
            fp_id=%fp_id,
            dl.id=%dl.id,
            dl.created_seqno=%dl.created_seqno,
            dl.kind=%dl.kind,
            dl.scoped_vault_id=%dl.scoped_vault_id,
    ))]
    async fn encrypt_and_write_record(&self, fp_id: &FpId, dl: &DataLifetime, pii: Pii) -> FpResult<()> {
        tracing::info!(
            sv_id=?dl.scoped_vault_id,
            ?fp_id,
            di=?&dl.kind,
            seqno=?&dl.created_seqno,
            "Encrypting and writing record",
        );

        let e_record = self.encrypt_record(pii)?;
        self.write_blob(fp_id, dl, e_record).await?;
        Ok(())
    }

    #[tracing::instrument("VaultDrWriter::encrypt_record", skip_all)]
    fn encrypt_record(&self, pii: Pii) -> FpResult<EncryptedRecord> {
        let record_private_key = age::x25519::Identity::generate();
        let record_public_key = PublicKey::X15519Recipient(record_private_key.to_public());

        let wrapped_record_key = self.org_public_keys.wrap_key(record_private_key)?;

        let record_public_key_set =
            PublicKeySet::new(vec![record_public_key, self.recovery_public_key.clone()])?;


        let mut plaintext_record = match pii {
            Pii::Value(v) => v.to_piistring()?.leak_to_string().into_bytes(),
            Pii::Bytes(b) => b.into_leak(),
        };

        let e_record = record_public_key_set.encrypt(&plaintext_record)?;
        plaintext_record.zeroize();

        Ok(EncryptedRecord {
            e_record,
            wrapped_record_key,
        })
    }

    #[tracing::instrument("VaultDrWriter::write_blob", skip_all)]
    async fn write_blob(
        &self,
        _fp_id: &FpId,
        _dl: &DataLifetime,
        _e_record: EncryptedRecord,
    ) -> FpResult<()> {
        // TODO
        Ok(())
    }
}

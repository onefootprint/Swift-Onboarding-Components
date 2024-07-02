use crate::Error;
use crate::VaultDrAwsConfig;
use api_core::utils::vault_wrapper::bulk_decrypt_dls_unchecked;
use api_core::utils::vault_wrapper::Pii;
use api_core::FpResult;
use api_core::State;
use api_errors::AssertionError;
use db::errors::FpOptionalExtension;
use db::helpers::load_vault_dr_data_lifetime_batch;
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
                    ..
                } = config;

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

            let sv_id = dl.scoped_vault_id;
            let fp_id = sv_id_to_fp_id
                .get(&sv_id)
                .ok_or(AssertionError("Got DL with SV ID not in sv_id_to_fp_id"))?;

            let di = dl.kind;
            let seqno = dl.created_seqno;

            // TODO: Encrypt and write blob.
            let _pii_leak_bytes = match pii {
                Pii::Value(v) => v.to_piistring()?.leak_to_string().into_bytes(),
                Pii::Bytes(b) => b.into_leak(),
            };

            tracing::info!(?sv_id, ?fp_id, ?di, ?seqno, "Encrypting and writing blob");
            blob_count += 1;
        }


        Ok(blob_count)
    }
}

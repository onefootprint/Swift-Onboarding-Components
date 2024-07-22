use super::api_client::get_cli_client;
use super::api_client::IsLive;
use super::s3_client::FpIdFields;
use super::s3_client::S3Client;
use super::VaultSelector;
use anyhow::bail;
use anyhow::Result;
use futures::StreamExt;
use itertools::Itertools;
use reqwest::Url;
use serde::Serialize;


pub async fn list_records_cmd(
    api_root: Url,
    is_live: IsLive,
    vault_filter: VaultSelector,
    fp_ids: Vec<String>,
) -> Result<()> {
    let client = get_cli_client(&api_root, is_live).await?;

    let Some(status) = client.get_status().await?.enrolled_status else {
        bail!("Not enrolled in Vault Disaster Recovery.");
    };

    let s3_client = S3Client::new(&status.s3_bucket_name, &status.bucket_path_namespace).await?;

    let VaultSelector {
        fp_id_gt,
        sample,
        limit,
    } = vault_filter;

    let fp_ids = if sample {
        let Some(limit) = limit else {
            bail!("--sample requires --limit");
        };

        let fp_ids = s3_client.sample_fp_ids(limit).await?;
        let fp_id_results = fp_ids.into_iter().map(Ok);
        futures::stream::iter(fp_id_results).boxed()
    } else if !fp_ids.is_empty() {
        let fp_ids = s3_client.fp_ids_from_strings(fp_ids).await?.into_iter().unique();
        let fp_id_results = fp_ids.map(Ok);
        futures::stream::iter(fp_id_results).boxed()
    } else {
        s3_client.list_fp_ids(fp_id_gt, limit).await.boxed()
    };

    let mut records = s3_client.list_records(fp_ids).await;
    while let Some(fp_id_fields) = records.next().await {
        let fp_id_fields = fp_id_fields?;

        let line: OutputLine = fp_id_fields.into();
        println!("{}", serde_json::to_string(&line)?);
    }

    Ok(())
}

#[derive(Debug, Clone, Serialize)]
struct OutputLine {
    fp_id: String,
    fields: Vec<String>,
}

impl From<FpIdFields> for OutputLine {
    fn from(fp_id_fields: FpIdFields) -> Self {
        let FpIdFields { fp_id, fields } = fp_id_fields;

        OutputLine {
            fp_id: fp_id.fp_id,
            fields,
        }
    }
}

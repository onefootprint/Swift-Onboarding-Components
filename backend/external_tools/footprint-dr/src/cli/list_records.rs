use super::api_client::IsLive;
use super::manifest::Field;
use super::s3_client::FpId;
use super::s3_client::FpIdFields;
use super::s3_client::S3Client;
use super::BucketNamespace;
use super::VaultSelector;
use anyhow::bail;
use anyhow::Result;
use futures::StreamExt;
use itertools::Itertools;
use reqwest::Url;
use serde::Deserialize;
use serde::Serialize;


pub async fn list_records_cmd(
    api_root: Url,
    is_live: IsLive,
    bucket_namespace: BucketNamespace,
    vault_filter: VaultSelector,
    fp_ids: Vec<String>,
) -> Result<()> {
    let s3_client = S3Client::new(&api_root, is_live, bucket_namespace).await?;

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
        let bucket_prefix = s3_client.bucket_prefix();
        let fp_ids = fp_ids
            .into_iter()
            .map(|fp_id| FpId::new(&bucket_prefix, &fp_id))
            .collect_vec();
        futures::stream::iter(fp_ids).boxed()
    } else {
        s3_client.list_fp_ids(fp_id_gt, limit).boxed()
    };

    let mut records = s3_client.list_records(fp_ids).await;
    while let Some(fp_id_fields) = records.next().await {
        let fp_id_fields = fp_id_fields?;

        let line: ListRecordsLine = fp_id_fields.into();
        println!("{}", serde_json::to_string(&line)?);
    }

    Ok(())
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub(crate) struct ListRecordsLine {
    pub(crate) fp_id: String,
    pub(crate) version: i64,
    pub(crate) fields: Vec<Field>,
}

impl From<FpIdFields> for ListRecordsLine {
    fn from(fp_id_fields: FpIdFields) -> Self {
        let FpIdFields {
            fp_id,
            version,
            fields,
        } = fp_id_fields;

        ListRecordsLine {
            fp_id: fp_id.fp_id,
            version,
            fields,
        }
    }
}

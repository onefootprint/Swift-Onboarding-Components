use super::api_client::IsLive;
use super::s3_client::S3Client;
use super::BucketNamespace;
use super::VaultSelector;
use anyhow::bail;
use anyhow::Result;
use futures::StreamExt;
use reqwest::Url;


pub async fn list_vaults_cmd(
    api_root: Url,
    is_live: IsLive,
    bucket_namespace: BucketNamespace,
    vault_filter: VaultSelector,
) -> Result<()> {
    let s3_client = S3Client::new(&api_root, is_live, bucket_namespace).await?;

    let VaultSelector {
        fp_id_gt,
        sample,
        limit,
    } = vault_filter;

    if sample {
        let Some(limit) = limit else {
            bail!("--sample requires --limit");
        };

        let fp_ids = s3_client.sample_fp_ids(limit).await?;
        for fp_id in fp_ids {
            println!("{}", fp_id.fp_id);
        }
    } else {
        let mut fp_ids = s3_client.list_fp_ids(fp_id_gt, limit);
        while let Some(fp_id) = fp_ids.next().await {
            let fp_id = fp_id?;
            println!("{}", fp_id.fp_id);
        }
    }

    Ok(())
}

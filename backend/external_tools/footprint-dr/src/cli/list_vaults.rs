use super::api_client::get_cli_client;
use super::api_client::IsLive;
use super::s3_client::S3Client;
use super::VaultSelector;
use anyhow::bail;
use anyhow::Result;
use futures::StreamExt;
use reqwest::Url;


pub async fn list_vaults_cmd(api_root: Url, is_live: IsLive, vault_filter: VaultSelector) -> Result<()> {
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

    if sample {
        let Some(limit) = limit else {
            bail!("--sample requires --limit");
        };

        let fp_ids = s3_client.sample_fp_ids(limit).await?;
        for fp_id in fp_ids {
            println!("{}", fp_id.fp_id);
        }
    } else {
        let mut fp_ids = s3_client.list_fp_ids(fp_id_gt, limit).await;
        while let Some(fp_id) = fp_ids.next().await {
            let fp_id = fp_id?;
            println!("{}", fp_id.fp_id);
        }
    }

    Ok(())
}

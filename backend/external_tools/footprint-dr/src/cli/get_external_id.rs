use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use anyhow::Result;
use reqwest::Url;

pub async fn get_external_id_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live).await?;

    let aws_pre_enrollment = client.aws_pre_enroll().await?;
    println!("{}", aws_pre_enrollment.external_id);

    Ok(())
}

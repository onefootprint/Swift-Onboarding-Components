use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use anyhow::Result;
use reqwest::Url;

pub fn status_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live)?;

    let status = client.get_status()?;

    println!(
        "Logged in to {} ({})",
        status.org_name,
        IsLive::from(status.is_live)
    );
    println!();

    let Some(status) = status.enrolled_status else {
        println!("Not enrolled in Vault Disaster Recovery.");
        println!("See the online documentation for instructions.");
        return Ok(());
    };

    println!(
        "Enrolled in Vault Disaster Recovery since: {}",
        status.enrolled_at
    );
    println!();

    println!("Organization Public Keys:");
    for key in status.org_public_keys {
        println!("  {}", key);
    }
    println!();

    println!("Storage Configuration:");
    println!("  AWS Account ID: {}", status.aws_account_id);
    println!("  AWS Role Name:  {}", status.aws_role_name);
    println!("  S3 Bucket Name: {}", status.s3_bucket_name);
    println!();

    println!("Latest backup record timestamp: TODO");
    println!("Latest online record timestamp: TODO");
    println!("Lag: TODO seconds, TODO records");

    Ok(())
}

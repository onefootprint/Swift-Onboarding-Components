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

    println!("Latest backup record timestamp: TODO");
    println!("Latest online record timestamp: TODO");
    println!("Lag: TODO seconds, TODO records");

    Ok(())
}

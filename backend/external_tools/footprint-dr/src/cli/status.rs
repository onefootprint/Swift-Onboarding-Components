use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use anyhow::{
    bail,
    Result,
};
use reqwest::Url;

pub fn status_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live)?;

    let status = client.get_status()?;

    if IsLive::from(status.is_live) != is_live {
        bail!(
            "Keyring has been corrupted. Run `footprint login --{}` to log in again.",
            is_live.to_string().to_lowercase()
        );
    }

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

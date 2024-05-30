use super::api_client::{
    IsLive,
    VaultDrApiClient,
};
use anyhow::{
    anyhow,
    Result,
};
use log::debug;
use reqwest::Url;

pub fn status_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = VaultDrApiClient::try_from_keyring(&api_root, is_live).map_err(|err| {
        debug!("{:?}, ", err);

        anyhow!(
            "Not logged in. Run `footprint login --{}` to log in.",
            is_live.to_string().to_lowercase()
        )
    })?;

    let status = client.get_status()?;

    // If this fails, the keyring has been corrupted.
    assert!(
        IsLive::from(status.is_live) == is_live,
        "Keyring has been corrupted."
    );

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

use super::api_client::ApiKey;
use super::api_client::IsLive;
use super::api_client::VaultDrApiClient;
use super::confirm;
use crate::cli::api_client::API_KEY_ENV_VAR;
use crate::warnln;
use anyhow::anyhow;
use anyhow::bail;
use anyhow::Context;
use anyhow::Result;
use log::debug;
use reqwest::Url;
use std::env;
use std::io::Write;

pub async fn login_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    if env::var(API_KEY_ENV_VAR).is_ok() {
        warnln!(
            "Warning: Ignoring {} environment variable and logging in using system keyring",
            API_KEY_ENV_VAR,
        );
    }

    let prompt = format!("Enter Footprint {} API key: ", is_live);
    let api_key = ApiKey::new(
        rpassword::prompt_password(prompt).with_context(|| "failed to read password from stdin")?,
    );

    let client = VaultDrApiClient::new(api_root, is_live, api_key)?;
    let status = client.get_status().await.map_err(|err| {
        debug!("{:?}, ", err);

        anyhow!("Failed to log in. Please check your API key and try again.")
    })?;

    if IsLive::from(status.is_live) != is_live {
        bail!(
            "The given API key is for the {} environment, not the {} environment.",
            IsLive::from(status.is_live),
            is_live,
        );
    }

    // Check and warn if the sandbox and live login slots have mismatching org IDs.
    let other_login_slot = !is_live;
    if let Ok(client) = VaultDrApiClient::try_from_keyring(&client.api_root, other_login_slot).await {
        let other_status = client.get_status().await?;

        if status.org_id != other_status.org_id {
            println!();
            warnln!(
                "Warning: Given {} API key is for {}, but existing {} API key is for a different organization, {}",
                is_live,
                status.org_name,
                other_login_slot,
                other_status.org_name,
            );

            if !confirm(&format!(
                "Continue logging in to {} ({})?",
                status.org_name, is_live
            ))? {
                bail!("Login aborted.");
            }
        }
    }

    client.save_to_keyring()?;
    println!("Logged in to {} ({}).", status.org_name, is_live);

    Ok(())
}

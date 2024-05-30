use super::api_client::{ApiKey, IsLive, VaultDrApiClient};
use anyhow::{anyhow, bail, Context, Result};
use log::debug;
use reqwest::Url;
use std::{io, io::Write};
use termcolor::{Color, ColorChoice, ColorSpec, StandardStream, WriteColor};

pub fn login_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let prompt = format!("Enter Footprint {} API key: ", is_live);
    let api_key = ApiKey::new(
        rpassword::prompt_password(prompt).with_context(|| "failed to read password from stdin")?,
    );

    let client = VaultDrApiClient::new(api_root, is_live, api_key)?;
    let status = client.get_status().map_err(|err| {
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
    if let Ok(client) = VaultDrApiClient::try_from_keyring(&client.api_root, other_login_slot) {
        let other_status = client.get_status()?;

        if status.org_id != other_status.org_id {
            let mut stdout = StandardStream::stdout(ColorChoice::Auto);
            stdout.set_color(ColorSpec::new().set_fg(Some(Color::Yellow)))?;
            println!();
            writeln!(
                &mut stdout,
                "Warning: Given {} API key is for {}, but existing {} API key is for a different organization, {}",
                is_live,
                status.org_name,
                other_login_slot,
                other_status.org_name,
            )?;
            stdout.reset()?;

            print!("Continue logging in to {} ({})? [y/N] ", status.org_name, is_live);
            io::stdout().flush()?;

            let mut answer = String::new();
            io::stdin().read_line(&mut answer)?;

            match answer.trim().to_lowercase().as_str() {
                "y" | "yes" => {}
                _ => bail!("Login aborted."),
            }
        }
    }

    client.save_to_keyring()?;
    println!("Logged in to {} ({}).", status.org_name, is_live);

    Ok(())
}

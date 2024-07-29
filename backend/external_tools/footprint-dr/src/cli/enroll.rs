use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use crate::cli::confirm;
use crate::cli::get_input;
use crate::cli::wire_types::VaultDrEnrollRequest;
use anyhow::anyhow;
use anyhow::bail;
use anyhow::Result;
use reqwest::Url;

pub async fn enroll_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live).await?;

    if client.get_aws_pre_enrollment().await?.is_none() {
        bail!("Your AWS external ID has not been generated. Run `footprint get-external-id {}` and create an IAM role according to the Vault Disaster Recovery documentation.", client.is_live.fmt_flag());
    }

    let status = client.get_status().await?;

    let needs_re_enroll = status.enrolled_status.is_some();
    if needs_re_enroll {
        println!(
            "⚠️  {} is already enrolled in Vault Disaster Recovery for {} mode.",
            status.org_name,
            IsLive::from(status.is_live),
        );
        println!();
        println!("Re-enrolling will deactivate the current configuration, including your org private key. New backups will be written from scratch. Are you sure you want to proceed?");
        println!();

        let correct_confirmation = format!(
            "restart {}-mode Vault Disaster Recovery from scratch",
            IsLive::from(status.is_live).to_string().to_lowercase(),
        );
        let answer = get_input(&format!(
            "Type \"{}\" to continue, or anything else to cancel: ",
            correct_confirmation
        ))?;

        if answer != correct_confirmation {
            println!("Cancelled");
            std::process::exit(3);
        }
        println!();
    }

    println!(
        "Enrolling {} ({}) in Vault Disaster Recovery",
        status.org_name,
        IsLive::from(status.is_live)
    );
    println!();

    let mut org_public_keys = vec![];
    loop {
        let pubkey = get_org_pubkey()?;
        org_public_keys.push(pubkey);

        if !confirm("Add another org public key?")? {
            break;
        }
        println!();
    }

    println!();
    let aws_account_id = get_input("Enter AWS account ID: ")?;
    let aws_role_name = get_input("Enter AWS role name: ")?;
    let s3_bucket_name = get_input("Enter S3 bucket name: ")?;

    println!();
    print!("Verifying configuration...");
    let resp = client
        .enroll(VaultDrEnrollRequest {
            aws_account_id,
            aws_role_name,
            s3_bucket_name,
            org_public_keys,
            re_enroll: Some(needs_re_enroll),
        })
        .await;

    match resp {
        Ok(_) => println!(" OK"),
        Err(e) => {
            println!(" Failed");
            return Err(e);
        }
    }


    let enrolled_status = client
        .get_status()
        .await?
        .enrolled_status
        .ok_or(anyhow!("Enrollment details not found"))?;

    println!();
    println!("Enrollment complete.");

    println!("Store the following information to locate your encrypted data for recovery:");
    println!("  S3 Bucket Name:   {}", enrolled_status.s3_bucket_name);
    println!("  Bucket Namespace: {}", enrolled_status.bucket_path_namespace);

    Ok(())
}

pub fn get_org_pubkey() -> Result<String> {
    let org_pubkey = get_input("Enter org public key (age recipient): ")?;

    // Try parsing as either a plugin or X25519 recipient.
    let plugin_recipient: Result<age::plugin::Recipient> = org_pubkey
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid YubiKey age recipient: {}", e));

    let x25519_recipient: Result<age::x25519::Recipient> = org_pubkey
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid X25519 age recipient: {}", e));

    match (plugin_recipient, x25519_recipient) {
        (Ok(plugin_recipient), Err(_)) => {
            if plugin_recipient.plugin() != "yubikey" {
                bail!("Invalid age plugin recipient: only age-plugin-yubikey is supported");
            }
            Ok(plugin_recipient.to_string())
        }
        (Err(_), Ok(x25519_recipient)) => {
            println!();
            println!("⚠️  We recommend that you store your org public key on a YubiKey instead of using an X25519 identity.");
            if confirm("Are you sure you don't want the benefits of a hardware security token?")? {
                println!();
                Ok(x25519_recipient.to_string())
            } else {
                bail!("Enrollment aborted.");
            }
        }
        (Ok(_), Ok(_)) => bail!("Unreachable: ambiguous age recipient type"),
        (Err(_), Err(_)) => bail!("Invalid age recipient: only YubiKey and X25519 recipients are supported"),
    }
}

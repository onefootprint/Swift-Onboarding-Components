use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use crate::cli::get_input;
use crate::cli::wire_types::VaultDrEnrollRequest;
use age::secrecy::ExposeSecret;
use anyhow::bail;
use anyhow::Result;
use reqwest::Url;

pub fn enroll_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live)?;

    if client.get_aws_pre_enrollment()?.is_none() {
        bail!("Your AWS external ID has not been generated. Run `footprint get-external-id {}` and create an IAM role according to the Vault Disaster Recovery documentation.", client.is_live.fmt_flag());
    }

    let status = client.get_status()?;

    let needs_re_enroll = status.enrolled_status.is_some();
    if needs_re_enroll {
        println!(
            "{} is already enrolled in Vault Disaster Recovery for {} mode.",
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

    let aws_account_id = get_input("Enter AWS Account ID: ")?;
    let aws_role_name = get_input("Enter AWS Role Name: ")?;
    let s3_bucket_name = get_input("Enter S3 Bucket Name: ")?;

    let org_identity = vault_dr_client::OrgIdentity::generate();

    println!();
    print!("Verifying configuration...");
    let resp = client.enroll(VaultDrEnrollRequest {
        aws_account_id,
        aws_role_name,
        s3_bucket_name,
        org_public_key: org_identity.public_key_string(),
        re_enroll: Some(needs_re_enroll),
    });

    match resp {
        Ok(_) => println!(" OK"),
        Err(e) => {
            println!(" Failed");
            return Err(e);
        }
    }

    println!();

    println!("Your Org Private Key is:");
    println!();
    println!("{}", org_identity.private_key_string().expose_secret());
    println!();

    println!("Store this securely. You will not be able to retrieve this key again without re-enrollment.");
    println!("Enrollment complete.");

    Ok(())
}

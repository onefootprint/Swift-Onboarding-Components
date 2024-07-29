use super::api_client::IsLive;
use crate::cli::api_client::get_cli_client;
use anyhow::Result;
use chrono::Duration;
use reqwest::Url;

pub async fn status_cmd(api_root: Url, is_live: IsLive) -> Result<()> {
    let client = get_cli_client(&api_root, is_live).await?;

    let status = client.get_status().await?;

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
    println!("  Namespace:      {}", status.bucket_path_namespace);
    println!();

    println!(
        "Latest Backup Record Timestamp: {}",
        status
            .latest_backup_record_timestamp
            .map(|ts| ts.to_string())
            .unwrap_or("n/a".to_owned())
    );

    let lag = Duration::seconds(status.backup_lag_seconds);
    println!("Backup lag: {}", humanize_duration(lag));

    Ok(())
}

fn humanize_duration(d: Duration) -> String {
    let days = d.num_days();
    let hours = d.num_hours() % 24;
    let minutes = d.num_minutes() % 60;
    let seconds = d.num_seconds() % 60;

    let mut parts = vec![];

    if days > 0 {
        parts.push(format!("{}d", days));
    }

    if hours > 0 {
        parts.push(format!("{}h", hours));
    }

    if minutes > 0 {
        parts.push(format!("{}m", minutes));
    }

    if seconds > 0 {
        parts.push(format!("{}s", seconds));
    }

    if parts.is_empty() {
        "0s".to_owned()
    } else {
        parts.join(" ")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(Duration::days(3) => "3d")]
    #[test_case(Duration::hours(4) => "4h")]
    #[test_case(Duration::minutes(5) => "5m")]
    #[test_case(Duration::seconds(6) => "6s")]
    #[test_case(Duration::days(3) + Duration::hours(4) + Duration::minutes(5) + Duration::seconds(6) => "3d 4h 5m 6s")]
    #[test_case(Duration::days(3) + Duration::seconds(6) => "3d 6s")]
    #[test_case(Duration::hours(0) => "0s")]
    fn test_humanize_duration(d: Duration) -> String {
        humanize_duration(d)
    }
}

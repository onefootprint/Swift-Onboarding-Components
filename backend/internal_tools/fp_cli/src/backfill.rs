use crate::util::api_client;
use crate::util::output_file;
use crate::util::OutputFile;
use anyhow::bail;
use api_wire_types::LiteUser;
use clap::Args;
use csv::Reader;
use itertools::Itertools;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::DataIdentifier;
use newtypes::PiiString;
use std::collections::HashMap;
use std::fs::File;
use std::path::PathBuf;
use std::str::FromStr;


#[derive(Args)]
pub struct BackfillArgs {
    #[arg(long)]
    pub api_key: SecretApiKey,
    /// csv file of PII to backfill
    #[arg(long)]
    pub file: PathBuf,
    #[arg(long, default_value = "false")]
    pub dry_run: bool,
    #[arg(long, default_value = "1")]
    pub chunks: usize,

    #[arg(long)]
    pub limit: Option<usize>,

    #[arg(long)]
    pub output: Option<String>,

    #[arg(long, default_value = "false")]
    pub verbose: bool,
}

pub async fn backfill(args: BackfillArgs) -> anyhow::Result<()> {
    let file = File::open(args.file)?;
    let mut reader = Reader::from_reader(file);
    let headers = reader.headers()?;
    let output = output_file(args.output, args.verbose).await?;

    let has_external_id = matches!(headers.iter().next(), Some("external_id"));
    log::info!("CSV has external_id: {:?}", has_external_id);

    if args.dry_run {
        log::info!("== DRY RUN ON ==");
    }

    let client = api_client(args.api_key)?;

    let dis = reader
        .headers()?
        .into_iter()
        .skip(if has_external_id { 1 } else { 0 })
        .map(DataIdentifier::from_str)
        .collect::<Result<Vec<_>, _>>()?;

    log::info!(
        "CSV with headers: {}",
        dis.iter()
            .map(|d| d.to_string())
            .collect::<Vec<String>>()
            .join(", ")
    );

    let records: Vec<csv::StringRecord> = reader.records().collect::<Result<_, _>>()?;
    let num_records = records.len();
    log::info!("File contains {} records", num_records);
    let records = records.iter().take(args.limit.unwrap_or(num_records));
    log::info!("Limiting to {} records", records.len());

    for chunk in records.enumerate().chunks(args.chunks).into_iter() {
        let records = chunk.collect_vec();
        let len = records.len();
        backfill_chunk_users(&client, &dis, records, has_external_id, args.dry_run, &output).await;
        log::debug!("finished chunk with {} records", len);
    }

    Ok(())
}

async fn backfill_chunk_users(
    client: &reqwest::Client,
    dis: &[DataIdentifier],
    records: Vec<(usize, &csv::StringRecord)>,
    has_external_id: bool,
    dry_run: bool,
    output: &OutputFile,
) {
    let fut = records.iter().map(|(i, record)| async move {
        let res = backfill_user(client, *i, dis, record, has_external_id, dry_run).await;
        let _ = match res {
            Ok(line) => output.write(line),
            Err(e) => {
                log::error!("Error backfilling user at row {}: {}", i, e);
                output.write(format!("{},failed: {}", i, e))
            }
        };
    });

    futures::future::join_all(fut).await;
}

async fn backfill_user(
    client: &reqwest::Client,
    index: usize,
    dis: &[DataIdentifier],
    record: &csv::StringRecord,
    has_external_id: bool,
    dry_run: bool,
) -> anyhow::Result<String> {
    if record.len() != dis.len() + (has_external_id as usize) {
        bail!("Inconsistent number of fields in CSV row {}", index);
    }

    let row = record
        .iter()
        .skip(if has_external_id { 1 } else { 0 })
        .enumerate()
        .flat_map(
            |(i, field)| {
                if field.is_empty() {
                    None
                } else {
                    Some((i, field))
                }
            },
        )
        .map(|(i, field)| {
            let di = dis[i].clone();
            let value = field.parse::<String>()?;
            Ok((di, PiiString::new(value)))
        })
        .collect::<Result<HashMap<DataIdentifier, _>, anyhow::Error>>()?;

    let external_id = if has_external_id {
        let id = record.get(0).ok_or_else(|| anyhow::anyhow!("no external id"))?;
        if id.len() < 10 {
            format!("external_{}", id)
        } else {
            id.to_string()
        }
    } else {
        format!("csv_row_index_{}", index)
    };

    let fp_id = if dry_run {
        create_user_dry_run(client, row).await?
    } else {
        create_user(client, external_id, row).await?
    };

    Ok(format!("{},{}", fp_id, if dry_run { "dry run" } else { "" }))
}

async fn create_user(
    client: &reqwest::Client,
    external_id: String,
    row: HashMap<DataIdentifier, PiiString>,
) -> anyhow::Result<String> {
    let resp = client
        .post("https://api.onefootprint.com/users")
        .header("x-external-id", &external_id)
        .send()
        .await?;

    if !resp.status().is_success() {
        return Ok(format!(",failed to create user: {}", resp.text().await?));
    }

    let user: LiteUser = resp.json().await?;

    let resp: reqwest::Response = client
        .patch(format!("https://api.onefootprint.com/users/{}/vault", user.id))
        .header("x-external-id", &external_id)
        .json(&row)
        .send()
        .await?;

    if !resp.status().is_success() {
        return Ok(format!("{},failed: {}", user.id, resp.text().await?));
    }

    Ok(format!("{},success", user.id))
}

async fn create_user_dry_run(
    client: &reqwest::Client,
    row: HashMap<DataIdentifier, PiiString>,
) -> anyhow::Result<String> {
    let resp = client
        .post("https://api.onefootprint.com/users")
        .header("x-external-id", "dry_run_test_user")
        .send()
        .await?;
    if !resp.status().is_success() {
        return Ok(format!(",failed to create user: {}", resp.text().await?));
    }

    let user: LiteUser = resp.json().await?;

    let resp: reqwest::Response = client
        .post(format!(
            "https://api.onefootprint.com/users/{}/vault/validate",
            user.id
        ))
        .json(&row)
        .send()
        .await?;

    if !resp.status().is_success() {
        return Ok(format!("{},failed: {}", user.id, resp.text().await?));
    }

    Ok(format!("{},success", user.id))
}

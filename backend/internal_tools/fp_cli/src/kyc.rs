use crate::util::api_client;
use crate::util::output_file;
use crate::util::OutputFile;
use api_wire_types::EntityValidateResponse;
use api_wire_types::User;
use clap::Args;
use csv::Reader;
use itertools::Itertools;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::FpId;
use newtypes::OnboardingStatus;
use serde_json::json;
use std::fs::File;
use std::path::PathBuf;
use std::str::FromStr;

#[derive(Args)]
pub struct KycArgs {
    #[arg(long)]
    pub api_key: SecretApiKey,
    #[arg(long)]
    pub playbook_key: String,
    /// CSV file where first element is fp_id
    #[arg(long)]
    pub file: PathBuf,

    /// chunks to process concurrently
    #[arg(long, default_value = "1")]
    pub chunks: usize,

    #[arg(long)]
    pub dry_run: bool,

    #[arg(long)]
    pub limit: Option<usize>,

    #[arg(long)]
    pub output: Option<String>,

    #[arg(long)]
    pub only_run_on_status: Option<OnboardingStatus>,

    #[arg(long, default_value = "false")]
    pub verbose: bool,
}

pub async fn kyc(args: KycArgs) -> anyhow::Result<()> {
    let output = output_file(args.output.clone(), args.verbose).await?;

    let file = File::open(args.file.clone())?;
    let mut reader: Reader<File> = csv::ReaderBuilder::new().has_headers(false).from_reader(file);
    let records: Vec<csv::StringRecord> = reader.records().collect::<Result<_, _>>()?;
    let num_records = records.len();
    log::info!(
        "File contains {} records, limiting to {}",
        num_records,
        args.limit.unwrap_or(num_records)
    );

    let records = records.into_iter().take(args.limit.unwrap_or(num_records));

    let fp_ids: Vec<FpId> = records
        .flat_map(|r| r.get(0).map(FpId::from_str))
        .collect::<Result<_, _>>()?;
    log::info!("Running kyc for {} fp_ids", fp_ids.len());

    let client = api_client(args.api_key.clone())?;

    for chunk in fp_ids.into_iter().chunks(args.chunks).into_iter() {
        let chunk = chunk.collect_vec();
        kyc_chunk(&client, chunk, &output, &args).await;
    }

    Ok(())
}

async fn kyc_chunk(client: &reqwest::Client, fp_ids: Vec<FpId>, output: &OutputFile, args: &KycArgs) {
    let fut = fp_ids
        .into_iter()
        .map(|fp_id| async move {
            let _ = match run_kyc(client, fp_id.clone(), args).await {
                Ok(line) => output.write(line),
                Err(e) => {
                    log::error!("Error running kyc: {}", e);
                    output.write(format!("{},failed: {}", fp_id, e))
                }
            };
        })
        .collect_vec();
    futures::future::join_all(fut).await;
}

async fn run_kyc(client: &reqwest::Client, fp_id: FpId, args: &KycArgs) -> anyhow::Result<String> {
    if args.dry_run {
        return Ok(format!("{},pass(dry run),false(dry_run)", fp_id));
    }

    if let Some(status) = &args.only_run_on_status {
        let res = client
            .get(format!("https://api.onefootprint.com/users/{}", fp_id))
            .send()
            .await?;
        if !res.status().is_success() {
            return Ok(format!("{},failed: {},", fp_id, res.text().await?));
        }
        let user: User = res.json().await?;

        if user.status != *status {
            return Ok(format!(
                "{},{} (skipped status not {}),{}",
                fp_id, user.status, status, user.requires_manual_review
            ));
        };
    }

    let res = client
        .post(format!("https://api.onefootprint.com/users/{}/kyc", fp_id))
        .json(&json!({
            "key": args.playbook_key
        }))
        .send()
        .await?;
    if !res.status().is_success() {
        return Ok(format!("{},failed: {},", fp_id, res.text().await?));
    }
    let res: EntityValidateResponse = res.json().await?;
    Ok(format!(
        "{},{},{}",
        res.fp_id, res.status, res.requires_manual_review
    ))
}

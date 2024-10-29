use crate::util::api_client;
use crate::util::output_file;
use crate::util::OutputFile;
use clap::Args;
use itertools::Itertools;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::FpId;
use newtypes::PiiString;
use reqwest::Client;
use serde::Deserialize;
use serde::Deserializer;
use serde_json::json;
use std::collections::HashMap;
use std::fs::File;
use std::path::PathBuf;

#[derive(Args)]
pub struct StripeCardMigrateArgs {
    /// api key to use
    #[arg(long)]
    api_key: SecretApiKey,

    #[arg(long)]
    pub output: Option<String>,

    #[arg(long)]
    pub stripe_file: PathBuf,

    #[arg(long)]
    pub fp_id_map_file: PathBuf,

    #[arg(long, default_value = "false")]
    pub dry_run: bool,

    /// number of records to process concurrently
    #[arg(long, default_value = "1")]
    pub chunks: usize,

    #[arg(long, default_value = "false")]
    pub verbose: bool,
}

pub async fn run(args: StripeCardMigrateArgs) -> anyhow::Result<()> {
    let client = api_client(args.api_key.clone())?;
    let output = output_file(args.output.clone(), args.verbose).await?;
    let customers = load_customers(args.stripe_file)?;
    log::info!("loaded {} stripe customers", customers.len());

    let fp_id_card_map = load_fp_id_card_map(args.fp_id_map_file)?;
    log::info!("loaded {} fp id card map rows", fp_id_card_map.len());

    log::info!("Building stripe cards map");
    let mut stripe_cards: HashMap<String, StripeCard> = customers
        .into_iter()
        .flat_map(|c| {
            c.cards
                .into_iter()
                .map(move |card| (card.id.clone(), card.clone()))
        })
        .collect();
    log::info!("loaded {} stripe cards", stripe_cards.len());

    let updates: Vec<Result<Update, String>> = fp_id_card_map
        .into_iter()
        .map(|r| {
            Ok::<_, String>(Update {
                fp_id: r.fp_id,
                stripe_card: stripe_cards
                    .remove(&r.stripe_card_id)
                    .ok_or(r.stripe_card_id.to_string())?,
                card_alias: r.card_alias,
            })
        })
        .collect();

    let not_found_errors: Vec<&String> = updates.iter().filter_map(|r| r.as_ref().err()).collect();
    if !not_found_errors.is_empty() {
        log::error!(
            "{} payment methods not found in source file:\n{}",
            not_found_errors.len(),
            not_found_errors.iter().join("\n")
        );
    }
    let updates: Vec<Update> = updates.into_iter().filter_map(|r| r.ok()).collect();

    log::info!("Found {} updates to make", updates.len());
    log::info!("Map contained {} unused records", stripe_cards.len());

    if args.dry_run {
        log::info!("Dry run, not updating any data. Exiting.");
        output.write_all(
            updates
                .into_iter()
                .map(|u| {
                    format!(
                        "{},{},{},success dry run",
                        u.fp_id, u.stripe_card.id, u.card_alias
                    )
                })
                .collect(),
        )?;
        return Ok(());
    }

    log::info!("Begin processing updates");
    for update in &updates.into_iter().chunks(args.chunks) {
        futures::future::join_all(update.map(|u| make_update(&client, u, &output))).await;
    }

    Ok(())
}

async fn make_update(client: &Client, update: Update, output: &OutputFile) -> anyhow::Result<()> {
    log::info!("Processing {} to {}", update.fp_id, update.stripe_card.id);

    let alias = |key: &str| -> String { format!("card.{}.{}", update.card_alias, key) };

    let res = client
        .patch(format!(
            "https://api.onefootprint.com/users/{}/vault",
            update.fp_id
        ))
        .json(&json!({
            alias("name"): update.stripe_card.name,
            alias("expiration"): format!(
                "{}/{}",
                update.stripe_card.exp_month.leak(),
                update.stripe_card.exp_year.leak()
            ),
            alias("number"): update.stripe_card.number,
            alias("billing_address.zip"): update.stripe_card.address_zip,
        }))
        .send()
        .await?;


    let status = if res.status().is_success() {
        "success".to_string()
    } else {
        format!("failed: status={} body={}", res.status(), res.text().await?)
    };

    let line = format!(
        "{},{},{},{}",
        update.fp_id, update.stripe_card.id, update.card_alias, status
    );
    output.write(line)?;

    Ok(())
}

#[derive(Debug, Clone)]
struct Update {
    fp_id: FpId,
    stripe_card: StripeCard,
    card_alias: String,
}

#[derive(Debug, Clone, Deserialize)]
struct StripeCustomer {
    #[allow(dead_code)]
    id: String,
    cards: Vec<StripeCard>,
}

#[derive(Debug, Clone, Deserialize)]
struct StripeCard {
    id: String,
    name: Option<PiiString>,
    #[serde(deserialize_with = "pii_number")]
    exp_month: PiiString,
    #[serde(deserialize_with = "pii_number")]
    exp_year: PiiString,
    number: PiiString,
    address_zip: Option<PiiString>,
}

pub fn pii_number<'de, D>(deserializer: D) -> Result<PiiString, D::Error>
where
    D: Deserializer<'de>,
{
    i64::deserialize(deserializer).map(|val| PiiString::new(val.to_string()))
}

fn load_customers(file: PathBuf) -> anyhow::Result<Vec<StripeCustomer>> {
    let file = File::open(file)?;
    #[derive(Deserialize)]
    struct Customers {
        customers: Vec<StripeCustomer>,
    }

    let customers: Customers = serde_json::from_reader(file)?;
    Ok(customers.customers)
}

#[derive(Debug, Clone, Deserialize)]
struct FpIdCardMapRow {
    stripe_card_id: String,
    fp_id: FpId,
    card_alias: String,
}

fn load_fp_id_card_map(file: PathBuf) -> anyhow::Result<Vec<FpIdCardMapRow>> {
    let file = File::open(file)?;
    let mut reader = csv::Reader::from_reader(file);

    let rows: Vec<FpIdCardMapRow> = reader
        .deserialize()
        .map(|r| Ok(r?))
        .collect::<anyhow::Result<_>>()?;
    Ok(rows)
}

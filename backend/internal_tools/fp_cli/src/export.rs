use crate::util::api_client;
use crate::util::output_file;
use crate::util::OutputFile;
use anyhow::bail;
use api_wire_types::LiteUser;
use api_wire_types::RiskSignal;
use api_wire_types::User;
use clap::Args;
use itertools::Itertools;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::ExternalId;
use newtypes::FpId;
use newtypes::OnboardingStatus;
use newtypes::SignalSeverity;
use reqwest::Client;
use serde::Deserialize;

#[derive(Args)]
pub struct ExportArgs {
    /// api key to use
    #[arg(long)]
    api_key: SecretApiKey,

    /// page size (concurrent operations run in parallel)
    #[arg(short, long, default_value = "64")]
    page_size: usize,

    #[arg(long)]
    pub output: Option<String>,

    /// users or businesses
    #[arg(long)]
    pub kind: String,

    #[arg(long, default_value = "false")]
    pub verbose: bool,
}
//TODO: move this to api_wire_types
#[derive(Debug, Clone, Deserialize)]
struct CursorPaginatedResponseMeta {
    next: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
struct CursorPaginatedResponse<T> {
    data: T,
    meta: CursorPaginatedResponseMeta,
}


pub async fn export_entities(args: ExportArgs) -> anyhow::Result<()> {
    let client = api_client(args.api_key.clone())?;
    let output = output_file(args.output.clone(), args.verbose).await?;
    fetch_entities(client, &args, &output).await?;
    Ok(())
}

struct EntityRow {
    external_id: Option<ExternalId>,
    fp_id: FpId,
    status: OnboardingStatus,
    requires_manual_review: bool,
    high_risk_signals: String,
    medium_risk_signals: String,
    low_risk_signals: String,
}

/// parallel execution
async fn fetch_entities(client: Client, args: &ExportArgs, output: &OutputFile) -> anyhow::Result<()> {
    let get_entities_url = |page_size: usize, cursor: Option<i64>| {
        format!(
            "https://api.onefootprint.com/{}?page_size={page_size}{}",
            args.kind,
            if let Some(cursor) = cursor {
                format!("&cursor={cursor}")
            } else {
                "".into()
            }
        )
    };
    let mut cursor = Some(None);

    while let Some(next_cursor) = cursor {
        let res = client
            .get(get_entities_url(args.page_size, next_cursor))
            .send()
            .await?;

        if !res.status().is_success() {
            bail!("failed to fetch entities: {}", res.text().await?);
        }

        let results: CursorPaginatedResponse<Vec<LiteUser>> = res.json().await?;

        cursor = results.meta.next.map(Some);

        let futures: Vec<_> = results
            .data
            .into_iter()
            .map(|entity| build_entity(client.clone(), entity))
            .collect();

        let rows = futures::future::join_all(futures)
            .await
            .into_iter()
            .collect::<Result<Vec<_>, _>>()?;

        output.write_all(
            rows.iter()
                .map(
                    |EntityRow {
                         external_id,
                         fp_id,
                         status,
                         requires_manual_review,
                         high_risk_signals,
                         medium_risk_signals,
                         low_risk_signals,
                     }| {
                        format!(
                            "{},{},{},{},{},{},{}",
                            external_id
                                .as_ref()
                                .map(|e| e.to_string())
                                .unwrap_or(String::new()),
                            fp_id,
                            status,
                            requires_manual_review,
                            high_risk_signals,
                            medium_risk_signals,
                            low_risk_signals
                        )
                    },
                )
                .collect(),
        )?;
    }

    Ok(())
}

async fn build_entity(client: Client, entity: LiteUser) -> anyhow::Result<EntityRow> {
    let entity: User = client
        .get(format!("https://api.onefootprint.com/users/{}", &entity.id))
        .send()
        .await?
        .json()
        .await?;

    let signals: Vec<RiskSignal> = client
        .get(format!(
            "https://api.onefootprint.com/entities/{}/risk_signals",
            &entity.id
        ))
        .send()
        .await?
        .json()
        .await?;

    Ok(EntityRow {
        external_id: entity.external_id,
        fp_id: entity.id,
        status: entity.status,
        requires_manual_review: entity.requires_manual_review,
        high_risk_signals: signals
            .iter()
            .filter(|r| r.severity == SignalSeverity::High)
            .map(|r| r.reason_code.to_string())
            .join(" | "),
        medium_risk_signals: signals
            .iter()
            .filter(|r| r.severity == SignalSeverity::Medium)
            .map(|r| r.reason_code.to_string())
            .join(" | "),
        low_risk_signals: signals
            .iter()
            .filter(|r| r.severity == SignalSeverity::Low)
            .map(|r| r.reason_code.to_string())
            .join(" | "),
    })
}

use std::time::Duration;

use api_wire_types::{Entity, EntityStatus, GetFieldValidationResponse, RiskSignal};
use itertools::Itertools;
use newtypes::{FpId, MatchLevel, OnboardingStatus, SignalSeverity};
use reqwest::{header::HeaderMap, Client};
use serde::{Deserialize, Serialize};

//TODO: move this to api_wire_types
#[derive(Debug, Clone, Deserialize)]
struct CursorPaginatedResponseMeta {
    next: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CursorPaginatedResponse<T> {
    data: T,
    meta: CursorPaginatedResponseMeta,
}

#[derive(Debug, Serialize)]
pub struct UserRow {
    fp_id: FpId,
    status: Option<EntityStatus>,
    name_match: Option<MatchLevel>,
    dob_match: Option<MatchLevel>,
    address_match: Option<MatchLevel>,
    ssn_match: Option<MatchLevel>,
    document_match: Option<MatchLevel>,
    high_risk_signals: String,
    medium_risk_signals: String,
    low_risk_signals: String,
}
/// parallel execution
pub async fn run(api_key: String, page_size: usize) -> anyhow::Result<Vec<UserRow>> {
    let mut headers = HeaderMap::new();
    headers.insert("x-footprint-secret-key", api_key.parse().unwrap());
    let client = reqwest::Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(5))
        .build()?;

    let get_entities_url = |page_size: usize, cursor: Option<i64>| {
        format!(
            "https://api.onefootprint.com/entities?kind=person&page_size={page_size}{}",
            if let Some(cursor) = cursor {
                format!("&cursor={cursor}")
            } else {
                "".into()
            }
        )
    };
    let mut cursor = Some(None);
    let mut all_users = vec![];

    while let Some(next_cursor) = cursor {
        let results: CursorPaginatedResponse<Vec<Entity>> = client
            .get(get_entities_url(page_size, next_cursor))
            .send()
            .await?
            .json()
            .await?;

        cursor = results.meta.next.map(Some);
        eprintln!("found {} users", results.data.len());

        let futures: Vec<_> = results
            .data
            .into_iter()
            .map(|entity| build_user(client.clone(), entity))
            .collect();

        let rows = futures::future::join_all(futures)
            .await
            .into_iter()
            .collect::<Result<Vec<_>, _>>()?;
        all_users.extend(rows);
        eprintln!("processed {} users total", all_users.len());
    }

    Ok(all_users)
}

async fn build_user(client: Client, entity: Entity) -> anyhow::Result<UserRow> {
    async fn signals(client: Client, fp_id: FpId) -> anyhow::Result<Vec<RiskSignal>> {
        Ok(client
            .get(format!(
                "https://api.onefootprint.com/entities/{}/risk_signals",
                &fp_id
            ))
            .send()
            .await?
            .json()
            .await?)
    }

    async fn validations(client: Client, fp_id: FpId) -> anyhow::Result<GetFieldValidationResponse> {
        Ok(client
            .get(format!(
                "https://api.onefootprint.com/entities/{}/match_signals",
                &fp_id
            ))
            .send()
            .await?
            .json()
            .await?)
    }

    let (signals, validations): (Result<_, _>, Result<_, _>) = futures::future::join(
        signals(client.clone(), entity.id.clone()),
        validations(client, entity.id.clone()),
    )
    .await;

    let validations = validations?;
    let signals = signals?;

    Ok(UserRow {
        fp_id: entity.id,
        status: Some(entity.status),
        name_match: validations.name.map(|m| m.match_level),
        dob_match: validations.dob.map(|m| m.match_level),
        address_match: validations.address.map(|m| m.match_level),
        ssn_match: validations.ssn.map(|m| m.match_level),
        document_match: validations.document.map(|m| m.match_level),
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

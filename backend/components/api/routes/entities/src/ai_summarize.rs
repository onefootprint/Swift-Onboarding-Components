use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use api_core::{utils::fp_id_path::FpIdPath, ApiError, ApiErrorKind};
use api_wire_types::UserAiSummary;
use db::models::{
    annotation::Annotation,
    auth_event::AuthEvent,
    risk_signal::{AtSeqno, RiskSignal},
    rule_set_result::RuleSetResult,
    scoped_vault::ScopedVault,
};
use newtypes::{ExternalId, FpId, OnboardingStatus};
use openai::chat::{
    ChatCompletion, ChatCompletionMessage, ChatCompletionMessageRole, ChatCompletionResponseFormat,
};
use paperclip::actix::{api_v2_operation, post, web};
use serde::{Deserialize, Serialize};

#[api_v2_operation(
    description = "Computes a human-readable summary of the user's detail page.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/ai_summarize")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<UserAiSummary> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    // gather relevant user data
    let (scoped_vault, rule_set_result, risk_signals, auth_events, annotations) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (auth_events, _) = AuthEvent::list(conn, &sv.id, None)?;
            let annotations = Annotation::list(conn, fp_id.clone(), tenant_id.clone(), is_live, None)?;
            let risk_signals = RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, AtSeqno(None))?;
            let rule_set_result = RuleSetResult::latest_workflow_decision(conn, &sv.id)?;

            Ok((sv, rule_set_result, risk_signals, auth_events, annotations))
        })
        .await?;

    let summary = serde_json::json!(UserSummaryObject {
        id: scoped_vault.fp_id,
        status: scoped_vault.status,
        timestamp: scoped_vault.last_activity_at,
        external_id: scoped_vault.external_id,
        rule_set_result: rule_set_result.map(api_wire_types::RuleSetResult::from_db),
        risk_signals: risk_signals
            .into_iter()
            .map(|(_, rs)| rs)
            .map(api_wire_types::RiskSignal::from_db)
            .collect(),
        auth_events: auth_events
            .into_iter()
            .map(api_wire_types::AuthEvent::from_db)
            .collect(),
        annotations: annotations
            .into_iter()
            .map(api_wire_types::Annotation::from_db)
            .collect(),
    })
    .to_string();

    let schema = serde_json::to_string(&AiSummaryObject::default())?;

    let message1 = ChatCompletionMessage {
        role: ChatCompletionMessageRole::System,
        content: Some("You are an expert risk analyst reviewing identity verification result and output results in JSON.".to_string()),
        name: None,
        function_call: None,
    };

    let message2 = ChatCompletionMessage {
        role: ChatCompletionMessageRole::User,
        content: Some(format!(
            "summarize identity verification result is described by this JSON object: {} and output the result using JSON schema {}",
            summary, schema
        )),
        name: None,
        function_call: None,
    };

    let completion = ChatCompletion::builder("gpt-4o", vec![message1, message2])
        .response_format(ChatCompletionResponseFormat::json_object())
        .create()
        .await
        .map_err(|e| ApiErrorKind::OpenAiCompletionError(e.to_string()))?;

    let response = completion.choices.first().and_then(|c| c.message.content.clone());
    let response = response
        .ok_or_else(|| ApiErrorKind::OpenAiCompletionError("No response from AI model".to_string()))?;

    let AiSummaryObject {
        high_level_summary,
        detailed_summary,
        risk_signal_summary,
        conclusion,
    } = serde_json::from_str(&response).map_err(|_| {
        ApiErrorKind::OpenAiCompletionError(format!("Invalid format from AI model: {}", response))
    })?;

    ResponseData::ok(UserAiSummary {
        high_level_summary,
        detailed_summary,
        risk_signal_summary,
        conclusion,
    })
    .json()
}

#[derive(Debug, Serialize)]
struct UserSummaryObject {
    id: FpId,
    status: Option<OnboardingStatus>,
    timestamp: chrono::DateTime<chrono::Utc>,
    external_id: Option<ExternalId>,
    rule_set_result: Option<api_wire_types::RuleSetResult>,
    risk_signals: Vec<api_wire_types::RiskSignal>,
    auth_events: Vec<api_wire_types::AuthEvent>,
    annotations: Vec<api_wire_types::Annotation>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct AiSummaryObject {
    high_level_summary: String,
    detailed_summary: String,
    risk_signal_summary: String,
    conclusion: String,
}

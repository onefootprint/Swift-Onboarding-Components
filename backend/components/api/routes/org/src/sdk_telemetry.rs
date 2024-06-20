use api_core::types::ModernApiResult;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct LogBody {
    tenant_domain: Option<String>,
    /// Really SdkArgsKind, but prefer for this telemetry API to be unopinionated on validation
    sdk_kind: Option<String>,
    sdk_name: Option<String>,
    sdk_version: Option<String>,
    log_level: Option<String>,
    log_message: Option<String>,
    session_id: Option<String>,
}

#[api_v2_operation(tags(SdkArgs, Hosted), description = "Log contents of the HTTP body. ")]
#[post("/org/sdk_telemetry")]
async fn post(request: web::Json<LogBody>) -> ModernApiResult<api_wire_types::Empty> {
    let fmt = |v: Option<String>| v.unwrap_or_default();
    let LogBody {
        tenant_domain,
        sdk_kind,
        sdk_name,
        sdk_version,
        log_level,
        log_message,
        session_id,
    } = request.into_inner();
    // fp_session_id is used in telemetry to avoid conflicting with session_id, which is reserved
    // for Datadog RUM.
    tracing::info!(fp_session_id=%fmt(session_id), tenant_domain=%fmt(tenant_domain), sdk_kind=%fmt(sdk_kind), sdk_name=%fmt(sdk_name), sdk_version=%fmt(sdk_version), log_level=%fmt(log_level), log_message=%fmt(log_message), "SDK telemetry");
    Ok(api_wire_types::Empty)
}

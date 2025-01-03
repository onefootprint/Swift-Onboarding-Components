use api_core::auth::sdk_args::SdkArgsContext;
use api_core::auth::session::sdk_args::SdkArgs;
use api_core::auth::session::sdk_args::SdkArgsData;
use api_core::auth::session::sdk_args::SdkArgsKind;
use api_core::auth::session::sdk_args::ValidateSdkArgs;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::large_json::LargeJson;
use api_core::utils::session::AuthSession;
use api_core::State;
use api_wire_types::CreateSdkArgsTokenResponse;
use chrono::Duration;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;
use paperclip::v2::schema::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct GetSdkArgsTokenResponse {
    pub args: SdkArgs,
}

// This is a wrapper type that has no validation of the contents but has the same open API spec as
// SdkArgs. We don't want to fail at request extraction if the contents are invalid.
#[derive(serde::Deserialize)]
#[serde(transparent)]
pub struct CreateSdkArgsTokenRequest(PiiJsonValue);

impl Apiv2Schema for CreateSdkArgsTokenRequest {
    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        SdkArgs::raw_schema()
    }
}

#[api_v2_operation(
    tags(SdkArgs, Hosted),
    description = "Create a new session containing args for the SDK."
)]
#[post("/org/sdk_args")]
async fn post(
    state: web::Data<State>,
    request: LargeJson<CreateSdkArgsTokenRequest, 2_097_152>,
    root_span: RootSpan,
) -> ApiResponse<CreateSdkArgsTokenResponse> {
    let data = request.0 .0;

    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let duration = Duration::hours(1);
    let body = PiiString::new(serde_json::ser::to_string(&data.leak())?);
    let e_data = public_key.seal_pii(&body)?;
    let session = SdkArgsData {
        e_private_key,
        e_data,
    };

    // Always save the session in the DB, even if some validation errors occurred.
    // This allows us to look up the session by hash even if it had invalid args
    let (token, session) = AuthSession::create(&state, session, duration).await?;
    root_span.record("auth_token_hash", token.id().to_string());

    // Validate that the args are actually valid SDK args, return an HTTP 400 if not
    let sdk_args = serde_json::from_value::<SdkArgs>(data.into_leak())?;
    let kind = SdkArgsKind::from(&sdk_args);
    root_span.record("meta", kind.to_string());
    sdk_args.validate()?;

    let expires_at = session.expires_at;
    Ok(CreateSdkArgsTokenResponse { token, expires_at })
}

#[api_v2_operation(
    tags(SdkArgs, Hosted),
    description = "Fetch information from an existing SDK args session."
)]
#[get("/org/sdk_args")]
async fn get(state: web::Data<State>, session: SdkArgsContext) -> ApiResponse<GetSdkArgsTokenResponse> {
    let SdkArgsData {
        e_private_key,
        e_data,
    } = session.data.data;
    let sdk_args_str = state
        .enclave_client
        .decrypt_to_piistring(&e_data, &e_private_key)
        .await?;
    let args: SdkArgs = serde_json::de::from_str(sdk_args_str.leak())?;
    let result = GetSdkArgsTokenResponse { args };
    Ok(result)
}

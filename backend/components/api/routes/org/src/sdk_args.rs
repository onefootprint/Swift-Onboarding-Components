use api_core::auth::sdk_args::SdkArgsContext;
use api_core::auth::session::sdk_args::SdkArgs;
use api_core::auth::session::sdk_args::SdkArgsData;
use api_core::auth::session::sdk_args::SdkArgsKind;
use api_core::auth::session::sdk_args::ValidateSdkArgs;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::large_json::LargeJson;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_wire_types::CreateSdkArgsTokenResponse;
use api_wire_types::PublicOnboardingConfiguration;
use chrono::Duration;
use newtypes::PiiString;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct GetSdkArgsTokenResponse {
    pub args: SdkArgs,
    pub ob_config: Option<api_wire_types::PublicOnboardingConfiguration>,
}

#[api_v2_operation(
    tags(SdkArgs, Hosted),
    description = "Create a new session containing args for the SDK."
)]
#[post("/org/sdk_args")]
async fn post(
    state: web::Data<State>,
    request: LargeJson<SdkArgs, 2_097_152>,
    root_span: RootSpan,
) -> ApiResponse<CreateSdkArgsTokenResponse> {
    let session_key = state.session_sealing_key.clone();
    let data = request.0;
    let kind = SdkArgsKind::from(&data);
    root_span.record("meta", kind.to_string());

    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    let (token, session) = state
        .db_pool
        // Don't make this a transaction since we return errors from here but still want to save
        // the session in the database
        .db_query(move |conn| -> FpResult<_> {
            let duration = Duration::minutes(15);
            let err = data.validate();
            let obc = data.ob_config(conn);
            if let Ok(Some((obc, _, _, _))) = &obc {
                root_span.record("tenant_id", obc.tenant_id.to_string());
                root_span.record("is_live", obc.is_live.to_string());
            }
            let body = PiiString::new(serde_json::ser::to_string(&data)?);
            let e_data = public_key.seal_pii(&body)?;
            let data = SdkArgsData {
                e_private_key,
                e_data,
            };
            // Always save the session in the DB, even if some validation errors occurred.
            // This allows us to look up the session by hash even if it had invalid args
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            root_span.record("auth_token_hash", auth_token.id().to_string());

            if let Some(err) = err.err().or(obc.err()) {
                Err(err)
            } else {
                Ok((auth_token, session))
            }
        })
        .await?;

    let expires_at = session.expires_at;
    Ok(CreateSdkArgsTokenResponse { token, expires_at })
}

#[api_v2_operation(
    tags(SdkArgs, Hosted),
    description = "Fetch information from an existing SDK args session."
)]
#[get("/org/sdk_args")]
async fn get(
    state: web::Data<State>,
    session: SdkArgsContext,
    root_span: RootSpan,
) -> ApiResponse<GetSdkArgsTokenResponse> {
    let SdkArgsData {
        e_private_key,
        e_data,
    } = session.data.data;
    let sdk_args_str = state
        .enclave_client
        .decrypt_to_piistring(&e_data, &e_private_key)
        .await?;
    let args: SdkArgs = serde_json::de::from_str(sdk_args_str.leak())?;
    let (obc, args) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let obc = args.ob_config(conn)?;
            Ok((obc, args))
        })
        .await?;
    if let Some((obc, _, _, _)) = obc.as_ref() {
        root_span.record("tenant_id", obc.tenant_id.to_string());
        root_span.record("is_live", obc.is_live.to_string());
    }

    let ob_config = obc.map(|(obc, t, tcc, a)| {
        PublicOnboardingConfiguration::from_db((obc, t, tcc, a, state.ff_client.clone()))
    });
    let result = GetSdkArgsTokenResponse { args, ob_config };
    Ok(result)
}

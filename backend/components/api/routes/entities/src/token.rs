use crate::auth::tenant::CheckTenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::config::LinkKind;
use api_core::errors::ApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::token::create_token;
use api_core::utils::token::CreateTokenArgs;
use api_wire_types::CreateEntityTokenRequest;
use api_wire_types::CreateTokenResponse;
use api_wire_types::EntityTokenOperationKind;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "Create an identified token for the provided fp_id and a link to the hosted flow that allows the user to complete the requested flow.",
    tags(Users, Private)
)]
#[post("/entities/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: Json<CreateEntityTokenRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<CreateTokenResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let CreateEntityTokenRequest { kind, key } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    let token_kind = match kind {
        EntityTokenOperationKind::Inherit => TokenOperationKind::Inherit,
        EntityTokenOperationKind::UpdateAuthMethods => TokenOperationKind::User,
    };
    let link_kind = match kind {
        EntityTokenOperationKind::Inherit => LinkKind::VerifyUser,
        EntityTokenOperationKind::UpdateAuthMethods => LinkKind::UpdateAuth,
    };

    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let args = CreateTokenArgs {
                sv,
                kind: token_kind,
                key,
                scopes: vec![],
                auth_events: vec![],
                is_implied_auth: false,
            };
            let (auth_token, session) = create_token(conn, &session_key, args, Duration::days(3))?;

            Ok((auth_token, session))
        })
        .await?;

    let expires_at = session.expires_at;
    let link = state.config.service_config.generate_link(link_kind, &token);
    let response = CreateTokenResponse {
        token,
        link,
        expires_at,
    };
    ResponseData::ok(response).json()
}

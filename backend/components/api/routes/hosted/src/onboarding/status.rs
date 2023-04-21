use crate::auth::user::UserAuthGuard;
use crate::errors::ApiError;
use crate::onboarding::{get_fields_to_authorize, get_requirements};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::{UserAuth, UserObAuthContext};
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Hosted, Bifrost), description = "Returns the status of the onboarding.")]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let (requirements, user_auth) = get_requirements(&state, user_auth).await?;
    let uv_id = user_auth.user_vault_id().clone();
    let ob_config = user_auth.ob_config()?.clone();
    let fields_to_authorize = state
        .db_pool
        .db_query(move |conn| get_fields_to_authorize(conn, &uv_id, &ob_config))
        .await??;

    // If we still have requirements, we don't want to authorize any fields yet.
    // This is kinda hacky, but belce and argoff discussed doing this for now
    let auth_fields = requirements.is_empty().then_some(fields_to_authorize);

    let ob_config = api_wire_types::OnboardingConfiguration::from_db((
        user_auth.ob_config()?.clone(),
        user_auth.tenant()?.clone(),
    ));

    ResponseData::ok(OnboardingStatusResponse {
        requirements,
        fields_to_authorize: auth_fields,
        ob_configuration: ob_config,
    })
    .json()
}

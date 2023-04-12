use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::ApiError;
use crate::onboarding::{get_fields_to_authorize, get_requirements};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Hosted, Bifrost), description = "Returns the status of the onboarding.")]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let (requirements, ob_info, _) = get_requirements(&state, user_auth).await?;
    let uv_id = ob_info.user_vault_id.clone();
    let ob_config = ob_info.ob_config.clone();
    let fields_to_authorize = state
        .db_pool
        .db_query(move |conn| get_fields_to_authorize(conn, &uv_id, &ob_config))
        .await??;

    // If we still have requirements, we don't want to authorize any fields yet.
    // This is kinda hacky, but belce and argoff discussed doing this for now
    let auth_fields = requirements.is_empty().then_some(fields_to_authorize);

    let ob_config = api_wire_types::OnboardingConfiguration::from_db((ob_info.ob_config, ob_info.tenant));

    ResponseData::ok(OnboardingStatusResponse {
        requirements,
        fields_to_authorize: auth_fields,
        ob_configuration: ob_config,
    })
    .json()
}

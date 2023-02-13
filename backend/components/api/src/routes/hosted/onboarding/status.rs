use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::hosted::onboarding::{get_fields_to_authorize, get_requirements};
use crate::types::response::ResponseData;
use crate::State;
use api_wire_types::hosted::onboarding_requirement::OnboardingRequirement;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

use super::AuthorizeFields;

#[api_v2_operation(tags(Hosted, Bifrost), description = "Returns the status of the onboarding.")]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let (requirements, fields_to_authorize) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let (requirements, _) = get_requirements(conn, &ob_info)?;
            let fields_to_authorize: AuthorizeFields =
                get_fields_to_authorize(conn, &ob_info.user_vault_id, &ob_info.ob_config)?;
            let res: (Vec<OnboardingRequirement>, AuthorizeFields) = (requirements, fields_to_authorize);

            Ok(res)
        })
        .await??;

    // If we still have requirements, we don't want to authorize any fields yet.
    // This is kinda hacky, but belce and argoff discussed doing this for now
    let auth_fields = if !requirements.is_empty() {
        None
    } else {
        Some(fields_to_authorize)
    };

    ResponseData::ok(OnboardingStatusResponse {
        requirements,
        fields_to_authorize: auth_fields,
    })
    .json()
}

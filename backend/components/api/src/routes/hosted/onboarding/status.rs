use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::ApiError;
use crate::hosted::onboarding::{get_fields_to_authorize, get_requirements};
use crate::types::onboarding_requirement::OnboardingRequirement;
use crate::types::response::ResponseData;
use crate::State;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

use super::AuthorizeFields;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingStatusResponse {
    requirements: Vec<OnboardingRequirement>,
    fields_to_authorize: Option<AuthorizeFields>,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let (requirements, fields_to_authorize): (Vec<OnboardingRequirement>, AuthorizeFields) = state
        .db_pool
        .db_query(move |conn| {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let (requirements, _) = get_requirements(conn, &ob_info)?;
            let fields_to_authorize: AuthorizeFields =
                get_fields_to_authorize(conn, &ob_info.user_vault_id, &ob_info.ob_config)?;
            let res: (Vec<OnboardingRequirement>, AuthorizeFields) = (requirements, fields_to_authorize);

            Ok::<(Vec<OnboardingRequirement>, AuthorizeFields), ApiError>(res)
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

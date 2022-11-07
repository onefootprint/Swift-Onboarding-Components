use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::hosted::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::State;
use db::models::onboarding::OnboardingUpdate;
use newtypes::SessionAuthToken;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct CommitResponse {
    /// Footprint validation token
    validation_token: SessionAuthToken,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the validation token that can be used for login."
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<CommitResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // Verify there are no unmet requirements
            let ob_info = user_auth.assert_onboarding(conn)?;
            let (requirements, ob) = get_requirements(conn, &ob_info.user_vault_id, &ob_info.ob_config)?;
            if !requirements.is_empty() {
                let unmet_requirements = requirements.into_iter().map(|x| x.into()).collect();
                return Err(OnboardingError::UnmetRequirements(unmet_requirements).into());
            }

            // Mark the onboarding as authorized and create validation token
            let ob = ob.update(conn, OnboardingUpdate::is_authorized(true))?;
            let validation_token = super::create_onboarding_validation_token(conn, &session_key, ob.id)?;
            Ok(validation_token)
        })
        .await??;

    Ok(Json(ResponseData {
        data: CommitResponse { validation_token },
    }))
}

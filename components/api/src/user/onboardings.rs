use crate::auth::session_context::HasUserVaultId;
use crate::auth::{session_context::SessionContext, session_data::user::my_fp::My1fpBasicSession};
use crate::errors::ApiError;
use crate::types::onboarding_link::ApiOnboardingLink;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::onboardings::{Onboarding, OnboardingLink};
use newtypes::{OnboardingId, TenantId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

type OnboardingResponse = Vec<ApiUserOnboarding>;

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiUserOnboarding {
    id: OnboardingId,
    tenant_id: TenantId,
    name: String,
    logo_url: Option<String>,
    onboarding_links: Vec<ApiOnboardingLink>,
}

/// Returns a list of onboardings that a user has performed
#[api_v2_operation(tags(User))]
#[get("/onboardings")]
pub async fn handler(
    state: web::Data<State>,
    user_auth: SessionContext<My1fpBasicSession>,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let user_vault_id = user_auth.user_vault_id();
    let (onboardings, ob_links) = state
        .db_pool
        .db_query(move |conn| -> Result<_, db::DbError> {
            let onboardings = Onboarding::list_for_user_vault(conn, &user_vault_id)?;
            let onboarding_ids = onboardings.iter().map(|x| &x.0.id).collect();
            let ob_links = OnboardingLink::get_for_onboardings(conn, onboarding_ids)?;
            Ok((onboardings, ob_links))
        })
        .await??;
    let results = onboardings
        .into_iter()
        .map(|(onboarding, tenant)| ApiUserOnboarding {
            tenant_id: onboarding.tenant_id,
            name: tenant.name,
            logo_url: tenant.logo_url,
            onboarding_links: ob_links
                .get(&onboarding.id)
                .unwrap_or(&vec![])
                .iter()
                .map(|x| ApiOnboardingLink::from(x.clone()))
                .collect(),
            id: onboarding.id,
        })
        .collect();
    Ok(Json(ApiResponseData::ok(results)))
}

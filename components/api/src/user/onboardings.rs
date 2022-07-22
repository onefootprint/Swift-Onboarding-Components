use crate::auth::session_context::HasUserVaultId;
use crate::auth::{session_context::SessionContext, session_data::user::my_fp::My1fpBasicSession};
use crate::errors::ApiError;
use crate::types::onboarding_link::ApiOnboardingLink;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::scoped_users::{Onboarding, ScopedUser};
use newtypes::{ScopedUserId, TenantId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

type OnboardingResponse = Vec<ApiUserOnboarding>;

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiUserOnboarding {
    id: ScopedUserId,
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
    let (scoped_users, obs) = state
        .db_pool
        .db_query(move |conn| -> Result<_, db::DbError> {
            let scoped_users = ScopedUser::list_for_user_vault(conn, &user_vault_id)?;
            let scoped_user_ids = scoped_users.iter().map(|x| &x.0.id).collect();
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids)?;
            Ok((scoped_users, obs))
        })
        .await??;
    let results = scoped_users
        .into_iter()
        .map(|(scoped_user, tenant)| ApiUserOnboarding {
            tenant_id: scoped_user.tenant_id,
            name: tenant.name,
            logo_url: tenant.logo_url,
            onboarding_links: obs
                .get(&scoped_user.id)
                .unwrap_or(&vec![])
                .iter()
                .map(|x| ApiOnboardingLink::from(x.clone()))
                .collect(),
            id: scoped_user.id,
        })
        .collect();
    Ok(Json(ApiResponseData::ok(results)))
}

use crate::auth::user::{UserAuth, UserAuthContext};
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;

use crate::utils::db2api::DbToApi;
use crate::State;

use api_core::auth::user::UserAuthGuard;
use api_wire_types::hosted::{HostedAuthorizedOrgs, HostedUserOnboardingInfo};
use api_wire_types::InsightEvent;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;

use paperclip::actix::{self, api_v2_operation, web, web::Json};

type AuthorizedOrgsResponse = Vec<HostedAuthorizedOrgs>;

#[api_v2_operation(
    tags(Hosted),
    description = "Returns a list of onboardings that a user has performed"
)]
#[actix::get("/hosted/user/authorized_orgs")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<AuthorizedOrgsResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::BasicProfile)?;

    let (scoped_users, mut obs) = state
        .db_pool
        .db_query(move |conn| -> Result<_, db::DbError> {
            let scoped_users = ScopedVault::list_for_user_vault(conn, user_auth.user_vault_id())?;
            let scoped_user_ids = scoped_users.iter().map(|x| &x.0.id).collect();
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids)?;
            Ok((scoped_users, obs))
        })
        .await??;
    let results = scoped_users
        .into_iter()
        .map(|(scoped_user, tenant)| -> ApiResult<_> {
            let result = HostedAuthorizedOrgs {
                tenant_id: scoped_user.tenant_id,
                name: tenant.name,
                logo_url: tenant.logo_url,
                timestamp: scoped_user.start_timestamp,
                onboarding: obs
                .remove(&scoped_user.id)
                .map(|(ob, conf, _, insight, _, _)| HostedUserOnboardingInfo {
                    name: conf.name.clone(),
                    insight_event: InsightEvent::from_db(insight),
                    timestamp: ob.start_timestamp,
                    can_access_data: conf.can_access_data,
                })
                // Should never hit this
                .ok_or(ApiError::ResourceNotFound)?,
                id: scoped_user.id,
            };
            Ok(result)
        })
        .collect::<ApiResult<_>>()?;
    Ok(Json(ResponseData::ok(results)))
}

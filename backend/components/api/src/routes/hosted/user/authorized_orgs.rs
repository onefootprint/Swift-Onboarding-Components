use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::response::ResponseData;

use crate::utils::db2api::DbToApi;
use crate::State;

use api_wire_types::hosted::{HostedAuthorizedOrgs, HostedUserOnboardingInfo};
use api_wire_types::InsightEvent;
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;

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
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

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
        .map(|(scoped_user, tenant)| HostedAuthorizedOrgs {
            tenant_id: scoped_user.tenant_id,
            name: tenant.name,
            logo_url: tenant.logo_url,
            timestamp: scoped_user.start_timestamp,
            onboardings: obs
                .get(&scoped_user.id)
                .unwrap_or(&vec![])
                .iter()
                .map(|(ob, conf, _, insight, _, _)| HostedUserOnboardingInfo {
                    name: conf.name.clone(),
                    insight_event: InsightEvent::from_db(insight.clone()),
                    timestamp: ob.start_timestamp,
                    can_access_data: conf.can_access_data.clone(),
                })
                .collect(),
            id: scoped_user.id,
        })
        .collect();
    Ok(Json(ResponseData::ok(results)))
}

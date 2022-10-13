use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::onboarding::{Onboarding, OnboardingInfo};
use db::models::scoped_user::ScopedUser;
use newtypes::{ScopedUserId, TenantId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

type AuthorizedOrgsResponse = Vec<FpUserOnboarding>;

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct FpUserOnboarding {
    id: ScopedUserId,
    tenant_id: TenantId,
    name: String,
    logo_url: Option<String>,
    onboardings: Vec<api_wire_types::Onboarding>,
}

#[api_v2_operation(
    summary = "/hosted/user/authorized_orgs",
    operation_id = "hosted-user-authorized_orgs",
    tags(Hosted),
    description = "Returns a list of onboardings that a user has performed"
)]
#[get("authorized_orgs")]
pub async fn handler(
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
        .map(|(scoped_user, tenant)| FpUserOnboarding {
            tenant_id: scoped_user.tenant_id,
            name: tenant.name,
            logo_url: tenant.logo_url,
            onboardings: obs
                .get(&scoped_user.id)
                .unwrap_or(&vec![])
                .iter()
                .map(|x| api_wire_types::Onboarding::from_db(x.clone()))
                .collect(),
            id: scoped_user.id,
        })
        .collect();
    Ok(Json(ResponseData::ok(results)))
}

impl DbToApi<OnboardingInfo> for api_wire_types::Onboarding {
    fn from_db((onboarding, config, insight): OnboardingInfo) -> Self {
        let Onboarding {
            start_timestamp,
            kyc_status,
            ..
        } = onboarding;
        let db::models::ob_configuration::ObConfiguration {
            name,
            can_access_data,
            ..
        } = config;
        let can_access_data_attributes = can_access_data.iter().flat_map(|x| x.attributes()).collect();
        api_wire_types::Onboarding {
            name,
            timestamp: start_timestamp,
            kyc_status,
            can_access_data,
            can_access_data_attributes,
            insight_event: api_wire_types::InsightEvent::from_db(insight),
        }
    }
}

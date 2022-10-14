use crate::auth::user::{UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::access_event::AccessEventListItemForUser;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

type AccessEventResponse = Vec<api_wire_types::AccessEvent>;

#[api_v2_operation(
    tags(Hosted),
    description = "Returns a list of AccessEvent logs that show which tenants have viewed the \
    logged-in user's data. Optionally allows filtering on data_attribute. Requires user \
    authentication sent in the cookie after a successful /identify/verify call."
)]
#[actix::get("/hosted/user/access_events")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<AccessEventResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    // TODO paginate the response when there are too many results
    let results = AccessEventListItemForUser::get(&state.db_pool, user_auth.data.user_vault_id)
        .await?
        .into_iter()
        .map(api_wire_types::AccessEvent::from_db)
        .collect();

    Ok(Json(ResponseData { data: results }))
}

impl DbToApi<AccessEventListItemForUser> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForUser) -> Self {
        let AccessEventListItemForUser {
            event,
            tenant_name,
            scoped_user,
        } = evt;

        api_wire_types::AccessEvent {
            fp_user_id: scoped_user.fp_user_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: tenant_name, // we don't want to leak any principal, just the tenant name
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: None, // we don't want to expose tenant location to end user
            kind: event.kind,
            targets: event.targets,
        }
    }
}

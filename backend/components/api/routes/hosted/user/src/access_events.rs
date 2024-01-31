use crate::{
    auth::user::UserAuthContext, errors::ApiError, types::response::ResponseData, utils::db2api::DbToApi,
    State,
};
use api_core::auth::user::{UserAuth, UserAuthGuard};
use db::access_event::AccessEventListItemForUser;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

type AccessEventResponse = Vec<api_wire_types::AccessEvent>;

#[api_v2_operation(
    tags(My1fp, Hosted),
    description = "Returns a list of AccessEvent logs that show which tenants have viewed the \
    logged-in user's data. Optionally allows filtering on data_attribute. Requires user \
    authentication sent in the cookie after a successful /identify/verify call."
)]
#[actix::get("/hosted/user/access_events")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<AccessEventResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::BasicProfile)?;

    // TODO paginate the response when there are too many results
    let results = AccessEventListItemForUser::get(&state.db_pool, user_auth.user_vault_id().clone())
        .await?
        .into_iter()
        .map(api_wire_types::AccessEvent::from_db)
        .collect();

    Ok(Json(ResponseData { data: results }))
}

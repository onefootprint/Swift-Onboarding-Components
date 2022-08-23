use crate::auth::{session_data::user::UserAuthScope, UserAuth};
use crate::errors::ApiError;
use crate::types::access_event::ApiAccessEvent;
use crate::types::response::ApiResponseData;
use crate::State;
use db::access_event::AccessEventListItemForUser;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type AccessEventResponse = Vec<ApiAccessEvent>;

#[api_v2_operation(tags(Hosted))]
#[get("/access_events")]
/// Returns a list of AccessEvent logs that show which tenants have viewed the logged-in user's
/// data. Optionally allows filtering on data_attribute
/// Requires user authentication sent in the cookie after a successful /identify/verify call
fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ApiResponseData<AccessEventResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    // TODO paginate the response when there are too many results
    let results = AccessEventListItemForUser::get(&state.db_pool, user_auth.data.user_vault_id)
        .await?
        .into_iter()
        .map(ApiAccessEvent::from)
        .collect();

    Ok(Json(ApiResponseData { data: results }))
}

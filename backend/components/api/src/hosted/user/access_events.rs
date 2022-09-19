use crate::auth::{session_data::user::UserAuthScope, UserAuth};
use crate::errors::ApiError;
use crate::types::access_event::FpAccessEvent;
use crate::types::response::ResponseData;
use crate::State;
use db::access_event::AccessEventListItemForUser;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type AccessEventResponse = Vec<FpAccessEvent>;

#[api_v2_operation(
    summary = "/hosted/user/access_events",
    operation_id = "hosted-user-access_events",
    tags(Hosted),
    description = "Returns a list of AccessEvent logs that show which tenants have viewed the \
    logged-in user's data. Optionally allows filtering on data_attribute. Requires user \
    authentication sent in the cookie after a successful /identify/verify call."
)]
#[get("/access_events")]
fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ResponseData<AccessEventResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    // TODO paginate the response when there are too many results
    let results = AccessEventListItemForUser::get(&state.db_pool, user_auth.data.user_vault_id)
        .await?
        .into_iter()
        .map(FpAccessEvent::from)
        .collect();

    Ok(Json(ResponseData { data: results }))
}

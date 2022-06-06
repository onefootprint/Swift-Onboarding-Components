use std::collections::HashSet;

use crate::tenant::TenantAuthContext;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{errors::ApiError, types::Empty};
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct SetDataRequest {
    attributes: HashSet<DataKind>,
}

#[api_v2_operation(tags(Org))]
#[post("/required_data")]
/// Allows a tenant to set the attributes to collect for a user
fn set(
    state: web::Data<State>,
    request: Json<SetDataRequest>,
    auth: TenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let tenant = auth.tenant();

    // TODO --
    // 1. checks on minimally required data? (do we always need first + last name)
    // 2. access log event for someone changing required attributes
    // 3. think through what happens if a company adds an attr + how that affects users
    let _ = db::tenant::set_required_data(
        &state.db_pool,
        tenant.id.clone(),
        request.clone().attributes.into_iter().collect(),
    )
    .await?;

    Ok(Json(ApiResponseData::ok(Empty)))
}

#[api_v2_operation(tags(Org))]
#[get("/required_data")]
/// Get the attributes the tenant requires of the client (name, SSN, etc.)
fn get(
    _state: web::Data<State>,
    auth: TenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<Vec<DataKind>>>, ApiError> {
    let tenant = auth.tenant();

    Ok(Json(ApiResponseData::ok(tenant.required_data.clone())))
}

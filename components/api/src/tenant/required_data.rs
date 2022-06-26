use std::collections::HashSet;

use crate::auth::session_data::tenant::secret_key::SecretTenantAuthContext;
use crate::auth::either::Either;
use crate::auth::session_context::{SessionContext, HasTenant};
use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{errors::ApiError, types::Empty};
use db::models::ob_configurations::{ObConfiguration, UpdateObConfiguration};
use newtypes::{DataKind, ObConfigurationKey};
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct SetDataRequest {
    configuration_key: ObConfigurationKey,
    attributes: HashSet<DataKind>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct GetDataRequest {
    configuration_key: ObConfigurationKey,
}

#[api_v2_operation(tags(Org))]
#[post("/required_data")]
/// Allows a tenant to set the attributes to collect for a user
// TODO allow this to update more than required data?
fn set(
    state: web::Data<State>,
    request: Json<SetDataRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

    let _ = UpdateObConfiguration {
        required_user_data: Some(request.attributes.clone().into_iter().collect()),
        tenant_id: tenant.id.clone(),
        key: request.configuration_key.clone(),
        description: None,
        settings: None,
        name: None,
    }
    .update(&state.db_pool)
    .await?;
    Ok(Json(ApiResponseData::ok(Empty)))
}

#[api_v2_operation(tags(Org))]
#[get("/required_data/{configuration_key}")]
/// Get the attributes the tenant requires of the client (name, SSN, etc.)
fn get(
    state: web::Data<State>,
    path: web::Path<ObConfigurationKey>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<Vec<DataKind>>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let configuration_key = path.into_inner();

    let obc = ObConfiguration::get_for_tenant(&state.db_pool, configuration_key, tenant.id).await?;

    Ok(Json(ApiResponseData {
        data: obc.required_user_data,
    }))
}

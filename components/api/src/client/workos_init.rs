use crate::types::success::ApiResponseData;
use crate::State;
use crate::{enclave::lib::gen_keypair, errors::ApiError};

use newtypes::TenantId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::tenants::NewTenant;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewWorkOSClientRequest {
    workos_org_id: String,
    name: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewWorkOSClientResponse {
    /// unique identifier for this client
    client_id: TenantId,
}

/// Register workos client
#[api_v2_operation]
#[post("/client/workos")]
async fn handler(
    request: web::Json<NewWorkOSClientRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<NewWorkOSClientResponse>>, ApiError> {
    let (public_key, e_private_key) = gen_keypair(&state).await?;

    let name = request.clone().name;
    let workos_id = request.clone().workos_org_id;

    let tenant = db::tenant::init(
        &state.db_pool,
        NewTenant {
            name,
            e_private_key,
            public_key,
            workos_id,
        },
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: NewWorkOSClientResponse {
            client_id: tenant.id,
        },
    }))
}

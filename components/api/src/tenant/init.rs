use crate::response::success::ApiResponseData;
use crate::State;
use crate::{enclave::lib::gen_keypair, errors::ApiError};

use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::tenants::NewTenant;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct ClientInitResponse {
    // unique identifier for this client
    client_id: String,
}

#[api_v2_operation]
// TODO -- this endpoint will be private in prod
#[post("/client/init/{name}")]
async fn handler(
    state: web::Data<State>,
    path: web::Path<String>,
) -> actix_web::Result<Json<ApiResponseData<ClientInitResponse>>, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = gen_keypair(&state).await?;

    let tenant = db::tenant::init(
        &state.db_pool,
        NewTenant {
            name: path.into_inner(),
            e_private_key: e_priv_key,
            public_key: ec_pk_uncompressed,
        },
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: ClientInitResponse {
            client_id: tenant.id,
        },
    }))
}

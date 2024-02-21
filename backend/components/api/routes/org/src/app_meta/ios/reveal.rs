use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiError,
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use db::models::tenant_ios_app_meta::TenantIosAppMeta;
use newtypes::TenantIosAppMetaId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct TenantIosAppMetaRevealRequest {
    id: TenantIosAppMetaId,
}

#[api_v2_operation(
    description = "Decrypts a specific ios app metadata entry",
    tags(OrgSettings, Organization, Private)
)]
#[post("/org/app_meta/ios/{id}/reveal")]
/// Note, we make this a post because it does a decrypt operation. In the future, we may
/// make an access event for it
async fn post(
    state: web::Data<State>,
    path: web::Path<TenantIosAppMetaRevealRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::TenantIosAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let id = path.into_inner().id;
    let result = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let result = TenantIosAppMeta::get(conn, id, &tenant_id)?;
            Ok(result)
        })
        .await?;

    let tenant = auth.tenant();
    let decrypted_device_check_private_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_device_check_private_key, &tenant.e_private_key)
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::TenantIosAppMeta::from_db(
        (
            result,
            Some(decrypted_device_check_private_key.leak().to_string()),
        ),
    ))))
}

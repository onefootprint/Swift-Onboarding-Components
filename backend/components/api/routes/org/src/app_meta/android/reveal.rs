use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiError,
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use db::models::tenant_android_app_meta::TenantAndroidAppMeta;
use newtypes::TenantAndroidAppMetaId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct TenantAndroidAppMetaRevealRequest {
    id: TenantAndroidAppMetaId,
}

#[api_v2_operation(
    description = "Decrypts a specific android app metadata entry",
    tags(OrgSettings, Organization, Private)
)]
#[post("/org/app_meta/android/{id}/reveal")]
/// Note, we make this a post because it does a decrypt operation. In the future, we may
/// make an access event for it
async fn post(
    state: web::Data<State>,
    path: web::Path<TenantAndroidAppMetaRevealRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::TenantAndroidAppMeta> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let id = path.into_inner().id;
    let result = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let result = TenantAndroidAppMeta::get(conn, id, &tenant_id)?;
            Ok(result)
        })
        .await?;

    let tenant = auth.tenant();
    let decrypted_integrity_verification_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_integrity_verification_key, &tenant.e_private_key)
        .await?;
    let decrypted_integrity_decryption_key = state
        .enclave_client
        .decrypt_to_piistring(&result.e_integrity_decryption_key, &tenant.e_private_key)
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::TenantAndroidAppMeta::from_db((
            result,
            Some(decrypted_integrity_verification_key.leak().to_string()),
            Some(decrypted_integrity_decryption_key.leak().to_string()),
        )),
    )))
}

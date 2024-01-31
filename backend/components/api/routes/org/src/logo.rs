use actix_multipart::Multipart;
use api_core::{
    error_with_code::ErrorWithCode, errors::file_upload::FileUploadError,
    utils::file_upload::mime_type_to_extension,
};
use db::models::tenant::{Tenant, UpdateTenant};
use paperclip::actix::{
    self, api_v2_operation, web,
    web::{HttpRequest, Json},
};

use crate::auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth};

use crate::{
    types::{JsonApiResponse, ResponseData},
    utils::{db2api::DbToApi, file_upload},
    State,
};

const MAX_IMAGE_SIZE_BYTES: usize = 1_048_576;

#[api_v2_operation(
    description = "Upload a new logo for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::put("/org/logo")]
pub async fn put(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    mut payload: Multipart,
    request: HttpRequest,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        Some(vec![mime::IMAGE_PNG, mime::IMAGE_SVG, mime::IMAGE_JPEG]),
        MAX_IMAGE_SIZE_BYTES,
    )
    .await?;

    // compute a "URL friendly" sub-path for our tenant
    let tenant_url_friendly_hash = crypto::base64::encode_config(
        crypto::sha256(auth.tenant().id.to_string().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    );

    // create a random name with our ext
    // note: ol = 'org logo'
    // Open Qs:
    //  - maybe we should name the file by the hash of the contents? (to avoid dupes / collisions)
    let file_extension = mime_type_to_extension(file.mime_type.as_ref())
        .ok_or(ErrorWithCode::InvalidMimeType(file.mime_type.clone()))?;
    let file_name = format!(
        "ol/{}/{}.{}",
        tenant_url_friendly_hash,
        crypto::random::gen_random_alphanumeric_code(22),
        file_extension
    );

    let logo_url = format!("{}/{}", state.config.assets_cdn_origin, &file_name);

    // stream upload
    state
        .s3_client
        .put_bytes(
            &state.config.assets_s3_bucket,
            file_name,
            file.bytes.into_leak(),
            Some(file.mime_type.clone()),
        )
        .await?;

    // update the tenant url
    let update_tenant = UpdateTenant {
        logo_url: Some(logo_url),
        ..Default::default()
    };

    let updated_tenant = state
        .db_pool
        .db_query(move |conn| Tenant::update(conn, &tenant_id, update_tenant))
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        updated_tenant,
    ))))
}

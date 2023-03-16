use actix_multipart::Multipart;
use bytes::{Bytes, BytesMut};
use db::models::tenant::{Tenant, UpdateTenant};
use paperclip::actix::{self, api_v2_operation, web, web::HttpRequest, web::Json};
use reqwest::header::CONTENT_LENGTH;

use crate::auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth};

use crate::errors::image_upload::ImageUploadError;

use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::db2api::DbToApi;
use crate::utils::headers::get_required_header;
use crate::State;

use futures_util::StreamExt as _;

const MAX_IMAGE_SIZE_BYTES: usize = 1_048_576;

#[api_v2_operation(
    description = "Upload a new logo for the organization.",
    tags(Organization, Preview)
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
    let request_content_length: usize = get_required_header(CONTENT_LENGTH.as_str(), request.headers())?
        .parse()
        .map_err(|_| ImageUploadError::InvalidContentLength)?;

    if request_content_length > MAX_IMAGE_SIZE_BYTES {
        return Err(ImageUploadError::ImageTooLarge)?;
    }

    // extract the file contents from body
    let Some(item) = payload.next().await else {
        return Err(ImageUploadError::InvalidFileUploadMissing)?;
    };

    let mut item = item.map_err(ImageUploadError::from)?;

    let mime = item
        .content_type()
        .ok_or(ImageUploadError::MissingMimeType)?
        .to_string();

    let ext = match mime.as_str() {
        "image/png" => "png",
        "image/svg+xml" => "svg",
        "image/jpeg" => "jpg",
        _ => return Err(ImageUploadError::InvalidImageMimeType)?,
    };

    // collect the image and error if too big
    let mut bytes = BytesMut::new();
    while let Some(chunk) = item.next().await {
        let chunk = chunk.map_err(ImageUploadError::from)?;
        bytes.extend(chunk);

        if bytes.len() > request_content_length {
            return Err(ImageUploadError::ImageTooLarge)?;
        }
    }

    // compute a "URL friendly" sub-path for our tenant
    let tenant_url_friendly_hash = crypto::base64::encode_config(
        crypto::sha256(auth.tenant().id.to_string().as_str().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    );

    // create a random name with our ext
    // note: ol = 'org logo'
    // Open Qs:
    //  - maybe we should name the file by the hash of the contents? (to avoid dupes / collisions)
    let file_name = format!(
        "ol/{}/{}.{}",
        tenant_url_friendly_hash,
        crypto::random::gen_random_alphanumeric_code(22),
        ext
    );

    let logo_url = format!("{}/{}", state.config.assets_cdn_origin, &file_name);

    // stream upload
    state
        .s3_client
        .put_object(
            &state.config.assets_s3_bucket,
            file_name,
            Bytes::from(bytes),
            Some(&mime),
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
        .await??;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        updated_tenant,
    ))))
}

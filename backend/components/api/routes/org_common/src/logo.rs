use actix_multipart::Multipart;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::utils::file_upload;
use api_core::utils::file_upload::mime_type_to_extension;
use api_core::FpResult;
use api_core::State;
use newtypes::OrgIdentifierRef;
use paperclip::actix::web;
use paperclip::actix::web::HttpRequest;

const MAX_IMAGE_SIZE_BYTES: usize = 1_048_576;

pub async fn upload_org_logo(
    state: &web::Data<State>,
    org_ident: OrgIdentifierRef<'_>,
    mut payload: Multipart,
    request: HttpRequest,
) -> FpResult<String> {
    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        Some(vec![mime::IMAGE_PNG, mime::IMAGE_JPEG]),
        MAX_IMAGE_SIZE_BYTES,
        0,
    )
    .await?;

    // compute a "URL friendly" sub-path for our tenant
    let id_str = match org_ident {
        OrgIdentifierRef::TenantId(id) => id.to_string(),
        OrgIdentifierRef::PartnerTenantId(id) => id.to_string(),
    };
    let tenant_url_friendly_hash =
        crypto::base64::encode_config(crypto::sha256(id_str.as_bytes()), crypto::base64::URL_SAFE_NO_PAD);

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

    Ok(logo_url)
}

use crate::auth::user::{AuthedOnboardingInfo, UserAuthContext, UserAuthGuard};
use crate::errors::{ApiError, ApiResult};
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::{self, file_upload};
use crate::State;
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use db::models::vault::Vault;
use newtypes::{DataIdentifier, DocumentKind, VaultPublicKey};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const MAX_DOC_SIZE_BYTES: usize = 5_048_576;

#[api_v2_operation(description = "POSTs a document to the vault", tags(Hosted))]
#[actix::post("/hosted/user/upload/{document_identifier}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    document_identifier: web::Path<DataIdentifier>,
    mut payload: Multipart,
    request: HttpRequest,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let kind = DocumentKind::try_from(document_identifier.into_inner())?;

    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let ua = user_auth.clone();
    let (auth_info, public_key) = state
        .db_pool
        .db_query(
            move |conn| -> Result<(AuthedOnboardingInfo, VaultPublicKey), ApiError> {
                //For now, only allow doc uploads during Bifrost
                let auth_info = ua.assert_onboarding(conn)?;
                let uv = Vault::get(conn, &auth_info.scoped_user.id)?;
                Ok((auth_info, uv.public_key))
            },
        )
        .await??;

    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        kind.accepted_mime_types(),
        MAX_DOC_SIZE_BYTES,
    )
    .await?;

    let (e_data_key, s3_url) = utils::vault_wrapper::encrypt_to_s3(
        &state,
        &file,
        kind,
        &public_key,
        &auth_info.user_vault_id,
        &auth_info.scoped_user.id,
    )
    .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user_id = utils::vault_wrapper::checks::pre_add_data_checks(&user_auth, conn)?;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_user_id)?;
            let doc = uvw.put_document(conn, kind, file.mime_type, file.filename, e_data_key, s3_url)?;
            Ok(doc)
        })
        .await?;

    EmptyResponse::ok().json()
}

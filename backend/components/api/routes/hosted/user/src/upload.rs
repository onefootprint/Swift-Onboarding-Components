use crate::{
    auth::user::UserAuthScope,
    errors::{ApiError, ApiResult},
    types::response::{EmptyResponse, ResponseData},
    utils::{self, file_upload, vault_wrapper::VaultWrapper},
    State,
};
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use api_core::auth::user::UserWfAuthContext;
use newtypes::{DataIdentifier, DataLifetimeSource, DocumentKind, WorkflowGuard};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const MAX_DOC_SIZE_BYTES: usize = 5_048_576;

#[api_v2_operation(description = "POSTs a document to the vault", tags(Document, Hosted))]
#[actix::post("/hosted/user/upload/{document_identifier}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    document_identifier: web::Path<DataIdentifier>,
    mut payload: Multipart,
    request: HttpRequest,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let kind = DocumentKind::try_from(document_identifier.into_inner())?;

    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    // Specifically check for AddData permission here since this is used only for investor profile
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        Some(kind.accepted_mime_types()),
        MAX_DOC_SIZE_BYTES,
        0,
    )
    .await?;

    let di = kind.into();
    let su_id = &user_auth.scoped_user.id;
    let (e_data_key, s3_url) =
        utils::vault_wrapper::seal_file_and_upload_to_s3(&state, &file, &di, user_auth.user(), su_id).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &user_auth.scoped_user.id)?;
            let doc = uvw.put_document_unsafe(
                conn,
                di,
                file.mime_type,
                file.filename,
                e_data_key,
                s3_url,
                DataLifetimeSource::LikelyHosted,
                None,
                true,
            )?;
            Ok(doc)
        })
        .await?;

    EmptyResponse::ok().json()
}

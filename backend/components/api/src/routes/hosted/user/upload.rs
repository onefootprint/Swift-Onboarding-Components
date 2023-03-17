use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::ApiError;
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::file_upload;
use crate::State;
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use newtypes::{DocumentKind, ScopedVaultId, VaultId};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const MAX_DOC_SIZE_BYTES: usize = 5_048_576;

#[api_v2_operation(description = "POSTs a document to the vault", tags(Hosted))]
#[actix::post("/hosted/user/upload")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    mut payload: Multipart,
    request: HttpRequest,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    // TODO: qualify path with doc type /hosted/user/upload/{doc_type}

    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let auth_info = state
        .db_pool
        .db_query(move |conn| {
            //For now, only allow doc uploads during Bifrost
            user_auth.assert_onboarding(conn)
        })
        .await??;

    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        vec![mime::APPLICATION_PDF],
        MAX_DOC_SIZE_BYTES,
    )
    .await?;

    // TODO: encrypt file

    let bucket = &state.config.document_s3_bucket.clone();
    let key = document_s3_key(
        &auth_info.user_vault_id,
        &auth_info.scoped_user.id,
        DocumentKind::FinraComplianceLetter,
    );

    let s3_path = state
        .s3_client
        .put_object(bucket, key, file.bytes, Some(&file.mime_type))
        .await?;
    tracing::info!(s3_path = s3_path, scoped_vault_id=%auth_info.scoped_user.id, onboarding_id=%auth_info.onboarding.id, "Uploaded Document to S3");

    // TODO: write DocumentData

    EmptyResponse::ok().json()
}

fn document_s3_key(vault_id: &VaultId, scoped_vault_id: &ScopedVaultId, kind: DocumentKind) -> String {
    format!(
        "docs/encrypted/{}/{}/{}/{}",
        vault_id,
        scoped_vault_id,
        kind,
        crypto::random::gen_random_alphanumeric_code(32),
    )
}

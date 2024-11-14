use api_core::auth::user::check_workflow_guard;
use api_core::auth::user::UserWfSession;
use api_core::auth::SessionContext;
use api_core::web;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequest;
use db::models::document_request::DocumentRequest;
use db::models::document_request::UncheckedDrIdentifier;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowGuard;
use newtypes::WorkflowId;

pub mod index;
pub mod process;
pub mod upload;
pub mod utils;

/// The document APIs work for document requests tied to either the user or the business. This util
/// grabs the either the user or business Workflow + ScopedVault depending on who owns the
/// DocumentRequest.
async fn get_user_or_business_for_dr<T: Into<UncheckedDrIdentifier>>(
    state: &State,
    user_auth: SessionContext<UserWfSession>,
    doc_id: Option<T>,
) -> FpResult<(ScopedVaultId, WorkflowId)> {
    let Some(doc_id) = doc_id else {
        return Ok((user_auth.scoped_user.id.clone(), user_auth.workflow.id.clone()));
    };
    let doc_id = doc_id.into();
    let (user_auth, owner_vault_kind, biz_wf) = state
        .db_query(move |conn| -> FpResult<_> {
            let kind = DocumentRequest::get_owner_kind(conn, doc_id)?;
            let biz_wf = user_auth.business_workflow(conn)?;

            Ok((user_auth, kind, biz_wf))
        })
        .await?;

    let result = match owner_vault_kind {
        VaultKind::Person => {
            user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
            let su_id = user_auth.scoped_user.id.clone();
            let wf_id = user_auth.workflow.id.clone();
            (su_id, wf_id)
        }
        VaultKind::Business => {
            let sb_id = user_auth.sb_id.clone();
            match sb_id.zip(biz_wf) {
                Some((sb_id, biz_wf)) => {
                    check_workflow_guard(&biz_wf, WorkflowGuard::AddDocument)?;

                    Ok((sb_id, biz_wf.id))
                }
                None => Err(BadRequest(
                    "Trying to upload a business document with no active business onboarding",
                )),
            }?
        }
    };
    Ok(result)
}

pub fn routes(config: &mut web::ServiceConfig) {
    index::configure_post_aliases(config);
    upload::configure_post_aliases(config);
    process::configure_post_aliases(config);
    config
        .service(index::post)
        .service(upload::post)
        .service(process::post);
}

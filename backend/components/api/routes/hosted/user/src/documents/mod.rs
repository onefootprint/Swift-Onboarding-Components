use api_core::auth::user::UserWfSession;
use api_core::auth::SessionContext;
use api_core::errors::ValidationError;
use api_core::FpResult;
use api_core::State;
use db::models::document_request::DocumentRequest;
use db::models::document_request::UncheckedDrIdentifier;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
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
        return Ok((user_auth.scoped_user.id.clone(), user_auth.workflow().id.clone()));
    };
    let doc_id = doc_id.into();
    let (user_auth, owner_vault_kind, biz_wf) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let kind = DocumentRequest::get_owner_kind(conn, doc_id)?;
            let biz_wf = user_auth.business_workflow(conn)?;
            Ok((user_auth, kind, biz_wf))
        })
        .await?;

    let result = match owner_vault_kind {
        VaultKind::Person => {
            let su_id = user_auth.scoped_user.id.clone();
            let wf_id = user_auth.workflow().id.clone();
            (su_id, wf_id)
        }
        VaultKind::Business => {
            let sb_id = user_auth.scoped_business_id();
            let biz_wf_id = biz_wf.map(|biz_wf| biz_wf.id);
            sb_id.zip(biz_wf_id).ok_or(ValidationError(
                "Trying to upload a business document with no active business onboarding",
            ))?
        }
    };
    Ok(result)
}

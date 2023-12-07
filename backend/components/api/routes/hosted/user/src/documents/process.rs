use crate::auth::user::UserAuthGuard;
use crate::documents::utils::{self, complete_proof_of_ssn};
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision;
use api_core::decision::vendor::incode::states::save_incode_fixtures;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use api_core::State;
use api_wire_types::DocumentResponse;
use db::models::decision_intent::DecisionIntent;
use db::models::identity_document::IdentityDocument;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use newtypes::{DecisionIntentKind, DocumentSide, IdentityDocumentId};
use newtypes::{DocKind, WorkflowGuard};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Continue processing the ID doc, if any remaining",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents/{id}/process")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    doc_id: web::Path<IdentityDocumentId>,
) -> JsonApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let t_id = user_auth.scoped_user.tenant_id.clone();
    let wf = user_auth.workflow();
    let su_id = user_auth.scoped_user.id.clone();
    let wf_id = wf.id.clone();
    let (di, id_doc, dr, failed_attempts, uvw, missing_sides, should_collect_selfie, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &su_id,
                &wf_id,
                DecisionIntentKind::DocScan,
            )?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            let (id_doc, dr) = IdentityDocument::get(conn, &doc_id)?;
            let side_from_session: Option<DocumentSide> = IncodeVerificationSession::get(conn, &id_doc.id)?
                .and_then(|session| session.side_from_session());

            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let should_collect_selfie = dr.should_collect_selfie && !id_doc.should_skip_selfie();
            let (missing_sides, attempts_for_side) =
                utils::get_side_info(conn, &id_doc, should_collect_selfie, side_from_session)?;

            Ok((
                di,
                id_doc,
                dr,
                attempts_for_side,
                uvw,
                missing_sides,
                should_collect_selfie,
                obc,
            ))
        })
        .await?;

    let is_sandbox = id_doc.fixture_result.is_some();
    let doc_kind: DocKind = id_doc.document_type.into();
    let upload_is_proof_of_ssn = doc_kind == DocKind::ProofOfSsn; // TODO: move this to being based on DR i think that's better and more source of truthy sicne we don't get from client
    let (should_initiate_reqs, _) =
        decision::utils::should_initiate_requests_for_document(&state, &uvw, id_doc.fixture_result).await?;

    let response = if should_initiate_reqs {
        // Not sandbox - make our request to vendors!
        api_core::utils::incode_helper::handle_incode_request(
            &state,
            id_doc.id,
            t_id,
            obc,
            di.id,
            &uvw,
            dr,
            is_sandbox,
            should_collect_selfie,
            &wf.id,
            state.feature_flag_client.clone(),
            failed_attempts,
            false,
            missing_sides.0,
        )
        .await?
    } else {
        // If we are done collecting sides, it means we can either:
        // 1) write sandbox fixtures
        // 2) complete the proof of ssn upload
        let next_side_to_collect = missing_sides.next_side_to_collect();
        if next_side_to_collect.is_none() {
            let sv_id = user_auth.scoped_user.id.clone();
            if upload_is_proof_of_ssn {
                complete_proof_of_ssn(&state, id_doc, sv_id).await?;
            } else {
                save_incode_fixtures(
                    &state,
                    &sv_id,
                    &wf.id,
                    obc.is_doc_first,
                    id_doc,
                    should_collect_selfie,
                )
                .await?;
            }
        }
        DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        }
    };
    ResponseData::ok(response).json()
}

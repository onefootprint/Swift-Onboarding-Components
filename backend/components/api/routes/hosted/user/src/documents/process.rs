use crate::auth::user::UserAuthGuard;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::vendor::incode::states::save_incode_fixtures;
use api_core::decision::{self};
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use api_core::State;
use api_wire_types::DocumentResponse;
use db::models::decision_intent::DecisionIntent;
use db::models::document_upload::DocumentUpload;
use db::models::identity_document::IdentityDocument;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use itertools::Itertools;
use newtypes::WorkflowGuard;
use newtypes::{DecisionIntentKind, DocumentSide, IdentityDocumentId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Continue processing the ID doc, if any remaining",
    tags(Hosted)
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
            let attempts_for_side = if let Some(side) = side_from_session {
                DocumentUpload::count_failed_attempts(conn, &id_doc.id)?
                    .iter()
                    .filter_map(|(s, n)| (side == *s).then_some(*n))
                    .next()
            } else {
                None
            };
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let should_collect_selfie = dr.should_collect_selfie && !id_doc.should_skip_selfie();
            let existing_sides = id_doc
                .images(conn, true)?
                .into_iter()
                .map(|u| u.side)
                .collect_vec();
            let required_sides = id_doc
                .document_type
                .sides()
                .into_iter()
                .chain(should_collect_selfie.then_some(DocumentSide::Selfie))
                .collect_vec();
            let missing_sides = required_sides
                .into_iter()
                .filter(|s| !existing_sides.contains(s))
                .collect_vec();
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
            missing_sides,
        )
        .await?
    } else {
        // Fixture response - we always complete successfully!
        let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
            .into_iter()
            .find(|s| missing_sides.contains(s));
        if next_side_to_collect.is_none() {
            // Save fixture VRes
            save_incode_fixtures(&state, &user_auth.scoped_user.id.clone(), &wf.id).await?;
        }
        DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        }
    };
    ResponseData::ok(response).json()
}

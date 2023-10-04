use crate::State;
use actix_web::{post, web, web::Json};
use api_core::{
    auth::{
        protected_custodian::ProtectedCustodianAuthContext,
        tenant::{CheckTenantGuard, FirmEmployeeAuthContext, TenantGuard},
        Either,
    },
    errors::{ApiResult, AssertionError},
    types::{JsonApiResponse, ResponseData},
};
use api_wire_types::DocumentResponse;
use db::models::{
    decision_intent::DecisionIntent, identity_document::IdentityDocument,
    incode_verification_session::IncodeVerificationSession, scoped_vault::ScopedVault, vault::Vault,
};
use newtypes::{DecisionIntentKind, IncodeVerificationSessionId};

#[derive(Debug, serde::Deserialize)]
pub struct Request {
    id: IncodeVerificationSessionId,
}

#[post("/private/incode/re_run")]
pub async fn rerun_machine(
    state: web::Data<State>,
    request: Json<Request>,
    auth: Either<ProtectedCustodianAuthContext, FirmEmployeeAuthContext>,
) -> JsonApiResponse<DocumentResponse> {
    if let Either::Right(auth) = auth {
        // Basically, make sure only "Risk ops" employees can hit this API
        auth.check_guard(TenantGuard::ManualReview)?;
    }

    let Request { id } = request.into_inner();

    let (id_doc, dr, su, vault, di) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let old_session =
                IncodeVerificationSession::get(conn, &id)?.ok_or(AssertionError("No session found"))?;
            let (id_doc, dr) = IdentityDocument::get(conn, &old_session.identity_document_id)?;
            let su = ScopedVault::get(conn, &dr.workflow_id)?;
            let vault = Vault::get(conn, &su.vault_id)?;
            // TODO mark the latest DocumentUpload as not deactivated. Right now this needs to be done manually
            let di =
                DecisionIntent::create(conn, DecisionIntentKind::DocScan, &su.id, Some(&dr.workflow_id))?;
            // Deactivate the old IVS
            IncodeVerificationSession::deactivate(conn, &old_session.id)?;
            // Make a new IVS
            IncodeVerificationSession::create(
                conn,
                id_doc.id.clone(),
                old_session.incode_configuration_id.clone(),
                old_session.kind,
            )?;
            Ok((id_doc, dr, su, vault, di))
        })
        .await?;

    let response = api_route_hosted::handle_incode_request(
        &state,
        id_doc.id,
        su.tenant_id,
        di.id,
        vault,
        dr.clone(),
        !su.is_live,
        dr.should_collect_selfie,
        &dr.workflow_id,
        state.feature_flag_client.clone(),
        Some(0),
    )
    .await?;
    ResponseData::ok(response).json()
}

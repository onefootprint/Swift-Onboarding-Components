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
    utils::vault_wrapper::{VaultWrapper, VwArgs},
};
use api_wire_types::DocumentResponse;
use db::models::{
    decision_intent::DecisionIntent, identity_document::IdentityDocument,
    incode_verification_session::IncodeVerificationSession, ob_configuration::ObConfiguration,
    scoped_vault::ScopedVault,
};
use newtypes::{DecisionIntentKind, IncodeVerificationSessionId};

#[derive(Debug, serde::Deserialize)]
pub struct Request {
    id: IncodeVerificationSessionId,
    /// Often when re-running an incode machine, the last run failed. In this case, all of the
    /// DocumentUploads for the final side will be marked as failed and you may have to manually
    /// mark one as not failed for it to be picked up by the machine by setting its deactivated_at
    /// to null and failure_reasons to an emptyarray.
    /// Be aware that this will change the display in the dashboard
    i_acknowledge_that_i_re_enabled_my_upload: Option<bool>,
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

    let Request {
        id,
        i_acknowledge_that_i_re_enabled_my_upload,
    } = request.into_inner();
    if !i_acknowledge_that_i_re_enabled_my_upload.unwrap_or_default() {
        return Err(
            AssertionError("Please acknowledge that you re-enabled the relevant DocumentUpload").into(),
        );
    }

    let (id_doc, dr, su, di, uvw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let old_session =
                IncodeVerificationSession::get(conn, &id)?.ok_or(AssertionError("No session found"))?;
            let (id_doc, dr) = IdentityDocument::get(conn, &old_session.identity_document_id)?;
            let su = ScopedVault::get(conn, &dr.workflow_id)?;
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id))?;
            let (obc, _) = ObConfiguration::get(conn, &dr.workflow_id)?;
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
            Ok((id_doc, dr, su, di, uvw, obc))
        })
        .await?;

    let response = api_route_hosted::handle_incode_request(
        &state,
        id_doc.id,
        su.tenant_id,
        obc,
        di.id,
        &uvw,
        dr.clone(),
        !su.is_live,
        dr.should_collect_selfie,
        &dr.workflow_id,
        state.feature_flag_client.clone(),
        Some(0),
        true,
    )
    .await?;
    ResponseData::ok(response).json()
}

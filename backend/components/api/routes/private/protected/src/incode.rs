use crate::ProtectedAuth;
use actix_web::web::Json;
use actix_web::{
    post,
    web,
};
use api_core::errors::{
    ApiResult,
    AssertionError,
};
use api_core::types::{
    JsonApiResponse,
    ResponseData,
};
use api_core::utils::vault_wrapper::{
    VaultWrapper,
    VwArgs,
};
use api_core::State;
use api_wire_types::DocumentResponse;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use newtypes::{
    DecisionIntentKind,
    IncodeEnvironment,
    IncodeVerificationSessionId,
    IncodeVerificationSessionKind,
};

#[derive(Debug, serde::Deserialize)]
pub struct Request {
    id: IncodeVerificationSessionId,
    /// Often when re-running an incode machine, the last run failed. In this case, all of the
    /// DocumentUploads for the final side will be marked as failed and you may have to manually
    /// mark one as not failed for it to be picked up by the machine by setting its deactivated_at
    /// to null and failure_reasons to an emptyarray.
    /// Be aware that this will change the display in the dashboard
    i_acknowledge_that_i_re_enabled_my_upload: Option<bool>,
    force_no_selfie: Option<bool>,
    environment: Option<IncodeEnvironment>,
}

#[post("/private/incode/re_run")]
pub async fn rerun_machine(
    state: web::Data<State>,
    request: Json<Request>,
    _: ProtectedAuth,
) -> JsonApiResponse<DocumentResponse> {
    let Request {
        id,
        i_acknowledge_that_i_re_enabled_my_upload,
        force_no_selfie,
        environment,
    } = request.into_inner();
    if !i_acknowledge_that_i_re_enabled_my_upload.unwrap_or_default() {
        return Err(
            AssertionError("Please acknowledge that you re-enabled the relevant DocumentUpload").into(),
        );
    }

    let force_no_selfie = force_no_selfie.unwrap_or_default();

    let (id_doc, dr, su, di, uvw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let old_session =
                IncodeVerificationSession::get(conn, &id)?.ok_or(AssertionError("No session found"))?;
            let (id_doc, dr) = Document::get(conn, &old_session.identity_document_id)?;
            let su = ScopedVault::get(conn, &dr.workflow_id)?;
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id))?;
            let (obc, _) = ObConfiguration::get(conn, &dr.workflow_id)?;
            // TODO mark the latest DocumentUpload as not deactivated. Right now this needs to be done
            // manually
            let di =
                DecisionIntent::create(conn, DecisionIntentKind::DocScan, &su.id, Some(&dr.workflow_id))?;
            // Deactivate the old IVS
            IncodeVerificationSession::deactivate(conn, &old_session.id)?;
            // Make a new IVS
            let kind = if force_no_selfie {
                IncodeVerificationSessionKind::IdDocument
            } else {
                old_session.kind
            };
            let config_id = old_session.incode_configuration_id.clone();
            IncodeVerificationSession::create(
                conn,
                id_doc.id.clone(),
                config_id,
                kind,
                environment.or(old_session.incode_environment),
                None,
            )?;
            Ok((id_doc, dr, su, di, uvw, obc))
        })
        .await?;

    let response = api_core::utils::incode_helper::handle_incode_request(
        &state,
        id_doc.id,
        su.tenant_id,
        obc,
        di.id,
        &uvw,
        dr.clone(),
        !su.is_live,
        dr.should_collect_selfie(),
        &dr.workflow_id,
        state.ff_client.clone(),
        Some(0),
        true,
        vec![],
    )
    .await?;
    ResponseData::ok(response).json()
}

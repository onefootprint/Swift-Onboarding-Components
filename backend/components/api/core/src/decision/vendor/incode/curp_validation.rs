use db::models::{
    decision_intent::DecisionIntent, identity_document::IdentityDocument,
    incode_verification_session::IncodeVerificationSession, scoped_vault::ScopedVault,
    verification_request::VerificationRequest,
};
use idv::{
    incode::curp_validation::{response::CurpValidationResponse, IncodeCurpValidationRequest},
    ParsedResponse, VendorResponse,
};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DecisionIntentId, DocumentKind, IdentityDocumentId,
    IncodeConfigurationId, IncodeEnvironment, IncodeVerificationSessionKind, OcrDataKind, PiiJsonValue,
    PiiString, ScopedVaultId, TenantId, VaultPublicKey, VendorAPI, WorkflowId,
};

use super::common::call_start_onboarding;
use crate::{
    decision::{
        self,
        vendor::{
            map_to_api_error,
            tenant_vendor_control::TenantVendorControl,
            vendor_result::VendorResult,
            verification_result::{self, SaveVerificationResultArgs, ShouldSaveVerificationRequest},
        },
    },
    enclave_client::EnclaveClient,
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiError, State,
};
use feature_flag::BoolFlag;


#[tracing::instrument(skip(state, di))]
pub async fn run_curp_validation_check(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> ApiResult<Option<VendorResult>> {
    let svid = di.scoped_vault_id.clone();
    let wf_id2 = wf_id.clone();
    let di_id = di.id.clone();
    let (vw, tenant_id, id_documents, latest_results) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id;

            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            let id_documents = IdentityDocument::list_completed_sent_to_incode_by_wf_id(conn, &wf_id2)?;
            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &di_id)?;

            Ok((vw, tenant_id, id_documents, latest_results))
        })
        .await?;

    // If we already have a successful curp validation for this DI, we return early
    let existing_vendor_result =
        VendorResult::get_successful_response(state, latest_results, &vw, VendorAPI::IncodeCurpValidation)
            .await?;
    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    let (maybe_curp, iddoc_id) = get_curp_for_check(&state.enclave_client, &vw, id_documents).await?;
    let incode_environment = get_incode_environment(state, &tenant_id);

    match (maybe_curp, incode_environment) {
        (Some(curp), Some(environment)) => {
            let diid = di.id.clone();
            let tvc = TenantVendorControl::new(
                tenant_id.clone(),
                &state.db_pool,
                &state.config,
                &state.enclave_client,
            )
            .await?;
            let config_id = get_config_id(environment);
            let res = call_start_onboarding(
                state,
                &tvc,
                &di.scoped_vault_id,
                &diid,
                &vw.vault.public_key,
                config_id.clone(),
                environment,
            )
            .await?;

            let credentials = IncodeCredentialsWithToken {
                credentials: tvc.incode_credentials(environment),
                authentication_token: res.token,
            };
            let res = state
                .vendor_clients
                .incode
                .incode_curp_validation
                .make_request(IncodeCurpValidationRequest { credentials, curp })
                .await;

            let args = SaveVerificationResultArgs::new(
                &res,
                di.id.clone(),
                di.scoped_vault_id.clone(),
                None,
                vw.vault.public_key.clone(),
                ShouldSaveVerificationRequest::Yes(VendorAPI::IncodeCurpValidation),
            );
            let (vres_id, vreq_id) = args.save(&state.db_pool).await?;
            let curp_response = res.map_err(map_to_api_error)?;
            let raw_response = curp_response.raw_response.clone();
            let parsed: CurpValidationResponse =
                curp_response.result.into_success().map_err(map_to_api_error)?;

            // create an IVS record for billing/tracking
            let _ = state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<_> {
                    let session = IncodeVerificationSession::create(
                        conn,
                        iddoc_id,
                        config_id,
                        IncodeVerificationSessionKind::CurpValidation,
                        Some(environment),
                    )?;

                    Ok(session)
                })
                .await?;

            let vendor_result = VendorResult {
                response: VendorResponse {
                    response: ParsedResponse::IncodeCurpValidation(parsed),
                    raw_response,
                },
                verification_result_id: vres_id,
                verification_request_id: vreq_id,
            };

            Ok(Some(vendor_result))
        }
        (Some(_), None) => Ok(Some(
            save_canned_response(
                state,
                di.scoped_vault_id.clone(),
                di.id.clone(),
                vw.vault.public_key.clone(),
            )
            .await?,
        )),
        _ => {
            tracing::info!(?wf_id, "No curp found for document");

            Ok(None)
        }
    }
}

#[tracing::instrument(skip_all)]
fn get_incode_environment(state: &State, tenant_id: &TenantId) -> Option<IncodeEnvironment> {
    let is_sandbox = !state.config.service_config.is_production();
    let can_make_incode_request_in_sandbox = state
        .feature_flag_client
        .flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(tenant_id));

    if is_sandbox {
        // TODO: Does this actually do anything w/ Renapo? Check w/ incode. maybe should just return sandbox responses always
        // TODO: What about if we flip the flag to use Incode demo creds in prod? I'm not sure validations will work there...?
        if can_make_incode_request_in_sandbox {
            Some(IncodeEnvironment::Demo)
        } else {
            None
        }
    } else {
        Some(IncodeEnvironment::Production)
    }
}

// TODO: upstream this?
// These are configurations that _only_ have the CURP validation module enabled, so we don't change, for example, our selfie flowID and forget to
// add CURP
fn get_config_id(env: IncodeEnvironment) -> IncodeConfigurationId {
    let flow_id = match env {
        IncodeEnvironment::Demo => "65e241cbac19b78faa5d22e3",
        IncodeEnvironment::Production => "65e88677dfc31b6523fda66d",
    };

    IncodeConfigurationId::from(flow_id.to_string())
}

// Retrieve a CURP from the vault for the latest document that we got from incode.
// In the future we maybe can vault CURP under `id.curp`, but this introduced complexity of needing to know situations in which we should run CURP validation
//
// Ex1: suppose a Tenant is onboarding a user and getting CURP via collecting a document:
// 1. they provide a Voter ID which has CURP, we vault in `id.curp` we run CURP validation
// 2. now they are asked to provide a new document, and they give a passport which _doesn't_ have CURP. we don't change the data associated with `id.curp`
// 3. now how do we know if we are supposed to run curp validation or not run it? One way would be to keep track of which documents have CURP, but the most straightforward
//    is to just pull from the latest identity document and see if we have a CURP OCRd, otherwise we automatically won't do anything
//
// Ex2: If we add curp to `must_collect`, it's a little more straightforward since we expect this to be collected by the time we get to vendor calls in the workflow
#[tracing::instrument(skip_all)]
async fn get_curp_for_check(
    enclave_client: &EnclaveClient,
    vw: &VaultWrapper,
    id_documents: Vec<IdentityDocument>,
) -> ApiResult<(Option<PiiString>, IdentityDocumentId)> {
    if let Some(id_doc) = id_documents.first() {
        let Some(vaulted_document_type) = id_doc.vaulted_document_type else {
            return Ok((None, id_doc.id.clone()));
        };

        let odk = DocumentKind::OcrData(vaulted_document_type, OcrDataKind::Curp);
        let decrypted_curp = vw
            .decrypt_unchecked(enclave_client, &[odk.into()])
            .await?
            .results
            .get(&odk.into())
            .cloned();
        Ok((decrypted_curp, id_doc.id.clone()))
    } else {
        Err(ApiError::from(decision::Error::from(
            decision::CurpValidationError::NoDocumentFoundForWorkflow,
        )))
    }
}

#[tracing::instrument(skip_all)]
async fn save_canned_response(
    state: &State,
    sv_id: ScopedVaultId,
    di_id: DecisionIntentId,
    public_key: VaultPublicKey,
) -> ApiResult<VendorResult> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let canned_res = idv::test_fixtures::incode_curp_validation_good_curp();
            let parsed = serde_json::from_value::<CurpValidationResponse>(canned_res.clone())?;
            let raw_response = PiiJsonValue::new(serde_json::to_value(&canned_res.clone())?);

            let (vreq, vres) = verification_result::save_vreq_and_vres(
                conn,
                &public_key,
                &sv_id,
                &di_id,
                Ok(VendorResponse {
                    raw_response: raw_response.clone(),
                    response: ParsedResponse::IncodeCurpValidation(parsed.clone()),
                }),
            )?;

            let vendor_result = VendorResult {
                response: VendorResponse {
                    response: ParsedResponse::IncodeCurpValidation(parsed),
                    raw_response,
                },
                verification_result_id: vres.id,
                verification_request_id: vreq.id,
            };
            Ok(vendor_result)
        })
        .await
}

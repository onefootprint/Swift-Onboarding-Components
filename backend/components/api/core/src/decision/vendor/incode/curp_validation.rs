use super::common::call_start_onboarding;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::verification_result::ShouldSaveVerificationRequest;
use crate::decision::vendor::verification_result::{
    self,
};
use crate::decision::vendor::AdditionalIdentityDocumentVerificationHelper;
use crate::decision::{
    self,
};
use crate::enclave_client::EnclaveClient;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataRequestSource;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::utils::vault_wrapper::WriteableVw;
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use db::models::billing_event::BillingEvent;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroup;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::TxnPgConn;
use feature_flag::BoolFlag;
use idv::incode::curp_validation::response::CurpValidationResponse;
use idv::incode::curp_validation::IncodeCurpValidationRequest;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::vendor_api_struct::IncodeCurpValidation;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::BillingEventKind;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataRequest;
use newtypes::DecisionIntentId;
use newtypes::DocumentDiKind;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentId;
use newtypes::DocumentKind;
use newtypes::FootprintReasonCode;
use newtypes::IdDocKind;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeEnvironment;
use newtypes::IncodeFailureReason;
use newtypes::IncodeSessionId;
use newtypes::IncodeVerificationSessionKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::ValidateArgs;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[tracing::instrument(skip(state, di))]
pub async fn run_curp_validation_check(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> FpResult<Option<VendorResult>> {
    let svid = di.scoped_vault_id.clone();
    let wf_id2 = wf_id.clone();
    let wf_id3 = wf_id.clone();
    let (vw, tenant_id, id_documents, sv) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            let id_documents = Document::list_completed_sent_to_incode(conn, &wf_id2)?;

            Ok((vw, tenant_id, id_documents, sv))
        })
        .await?;

    // If we already have a successful curp validation for this DI, we return early
    // If we already have a successful neuro validation for this DI, we return early
    let existing_vendor_result = load_response_for_vendor_api(
        state,
        VReqIdentifier::WfId(wf_id.clone()),
        &vw.vault.e_private_key,
        IncodeCurpValidation,
    )
    .await?
    .into_vendor_result();
    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    // Handle both sandbox and prod
    let id_doc_helper = AdditionalIdentityDocumentVerificationHelper::new(id_documents);
    let id_doc_fixture = id_doc_helper.fixture();
    let should_sent_curp_request = id_doc_helper.get_incode_environment(state, &tenant_id, sv.is_live);

    match should_sent_curp_request {
        Some(environment) => {
            // only consider documents sent to a vendor we we're actually sending curp requests
            let doc = id_doc_helper.sent_to_vendor;
            let (maybe_curp, iddoc) = get_curp_for_check(&state.enclave_client, &vw, doc.as_ref()).await?;
            let doc_kind = iddoc
                .vaulted_document_type
                .unwrap_or(iddoc.document_type)
                .try_into()?;
            let Some(curp) = maybe_curp else {
                // Nothing to do here, we've already checked if it's the appropriate document type
                return Ok(None);
            };

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
            let incode_session_id = IncodeSessionId::from(res.interview_id);

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
            let curp_response = res.map_err(into_fp_error)?;
            let raw_response = curp_response.raw_response.clone();
            match curp_response.result.safe_into_success() {
                either::Either::Left(parsed) => {
                    // Vaulting
                    let iddoc_id = iddoc.id.clone();
                    let is_live = matches!(environment, IncodeEnvironment::Production);

                    let sv_id = di.scoped_vault_id.clone();
                    let vault_data =
                        pre_vault(state, doc_kind, raw_response.clone(), is_live, &sv_id).await?;

                    state
                        .db_pool
                        .db_transaction(move |conn| -> FpResult<_> {
                            // Vault the curp response
                            let seqno = vault_curp_response(conn, &sv_id, vault_data)?;

                            // create an IVS record for tracking
                            let _ = IncodeVerificationSession::create(
                                conn,
                                iddoc.id,
                                config_id,
                                IncodeVerificationSessionKind::CurpValidation,
                                Some(environment),
                                Some(incode_session_id),
                            )?;

                            // set curp completed seqno so we can render historical responses in the dashboard
                            let update = DocumentUpdate::set_curp_completed_seqno(seqno);
                            let _ = Document::update(conn, &iddoc_id, update)?;

                            // set curp completed seqno so we can render historical responses in the dashboard
                            let update = DocumentUpdate::set_curp_completed_seqno(seqno);
                            let _ = Document::update(conn, &iddoc_id, update)?;

                            let (obc, _) = ObConfiguration::get(conn, &wf_id3)?;
                            // create billing event
                            BillingEvent::create(
                                conn,
                                &sv_id,
                                Some(&obc.id),
                                BillingEventKind::CurpValidation,
                            )?;

                            Ok(())
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
                either::Either::Right(errors) => {
                    handle_curp_error(state, &di.scoped_vault_id, &vres_id, errors).await?;

                    Err(into_fp_error(idv::incode::error::Error::InvalidCurp))
                }
            }
        }
        None => {
            let doc = id_doc_helper.identity_document();
            if let Some(doc) = doc {
                let doc_kind = doc
                    .vaulted_document_type
                    .unwrap_or(doc.document_type)
                    .try_into()?;
                let vendor_result = if doc_expects_curp(&doc) {
                    Some(
                        save_canned_response(
                            state,
                            di.scoped_vault_id.clone(),
                            di.id.clone(),
                            vw.vault.public_key.clone(),
                            id_doc_fixture,
                            doc_kind,
                            doc.id,
                        )
                        .await?,
                    )
                } else {
                    None
                };

                Ok(vendor_result)
            } else {
                Ok(None)
            }
        }
    }
}

type ShouldSendCurpRequest = Option<IncodeEnvironment>;
impl AdditionalIdentityDocumentVerificationHelper {
    // TODO: we need to incorporate UseIncodeDemoCredentialsInLivemode
    //    -- if we flip the flag to use Incode demo creds in prod? I'm not sure validations will work
    // there...? Does this actually do anything w/ Renapo in demo?
    #[tracing::instrument(skip_all)]
    pub fn get_incode_environment(
        &self,
        state: &State,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> ShouldSendCurpRequest {
        let fixture: Option<DocumentFixtureResult> = self.fixture();
        let is_sandbox = !is_live;
        let can_make_incode_request_in_sandbox = !is_live
            && state
                .ff_client
                .flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(tenant_id))
            && matches!(fixture, Some(DocumentFixtureResult::Real),);

        if is_sandbox {
            // TODO: Does this actually do anything w/ Renapo? Check w/ incode. maybe should just return
            // sandbox responses always
            if can_make_incode_request_in_sandbox {
                Some(IncodeEnvironment::Demo)
            } else {
                None
            }
        } else {
            Some(IncodeEnvironment::Production)
        }
    }
}

// TODO: upstream this?
// These are configurations that _only_ have the CURP validation module enabled, so we don't change,
// for example, our selfie flowID and forget to add CURP
fn get_config_id(env: IncodeEnvironment) -> IncodeConfigurationId {
    let flow_id = match env {
        IncodeEnvironment::Demo => "65e241cbac19b78faa5d22e3",
        IncodeEnvironment::Production => "65e88677dfc31b6523fda66d",
    };

    IncodeConfigurationId::from(flow_id.to_string())
}

// Retrieve a CURP from the vault for the latest document that we got from incode.
// In the future we maybe can vault CURP under `id.curp`, but this introduced complexity of needing
// to know situations in which we should run CURP validation
//
// Ex1: suppose a Tenant is onboarding a user and getting CURP via collecting a document:
// 1. they provide a Voter ID which has CURP, we vault in `id.curp` we run CURP validation
// 2. now they are asked to provide a new document, and they give a passport which _doesn't_ have
//    CURP. we don't change the data associated with `id.curp`
// 3. now how do we know if we are supposed to run curp validation or not run it? One way would be
//    to keep track of which documents have CURP, but the most straightforward is to just pull from
//    the latest identity document and see if we have a CURP OCRd, otherwise we automatically won't
//    do anything
//
// Ex2: If we add curp to `must_collect`, it's a little more straightforward since we expect this to
// be collected by the time we get to vendor calls in the workflow
#[tracing::instrument(skip_all)]
async fn get_curp_for_check(
    enclave_client: &EnclaveClient,
    vw: &VaultWrapper,
    id_document: Option<&Document>,
) -> FpResult<(Option<PiiString>, Document)> {
    if let Some(doc) = id_document {
        // We only expect a CURP for voter ID now
        if !doc_expects_curp(doc) {
            return Ok((None, doc.clone()));
        }
        let Some(vaulted_document_type) = doc
            .vaulted_document_type
            .and_then(|t| IdDocKind::try_from(t).ok())
        else {
            return Ok((None, doc.clone()));
        };

        let di = DataIdentifier::from(DocumentDiKind::OcrData(vaulted_document_type, ODK::Curp));
        // We should always get CURP on a voter ID
        // TODO: In the future we could have a risk signal or something for this i suppose. arguably this
        // should go before the decryption, but just to observe incode weirdness
        let decrypted_curp = if vw.get(&di).is_some() {
            vw.decrypt_unchecked_single(enclave_client, di).await?
        } else {
            tracing::warn!(doc=?doc.id, "{}", format!("missing curp for {:?}", doc.vaulted_document_type));

            None
        };

        Ok((decrypted_curp, doc.clone()))
    } else {
        Err(FpError::from(decision::Error::from(
            decision::CurpValidationError::NoDocumentFoundForWorkflow,
        )))
    }
}

#[tracing::instrument(skip_all)]
#[allow(clippy::too_many_arguments)]
async fn save_canned_response(
    state: &State,
    sv_id: ScopedVaultId,
    di_id: DecisionIntentId,
    public_key: VaultPublicKey,
    identity_document_fixture: Option<DocumentFixtureResult>,
    id_doc_kind: IdDocKind,
    id_doc_id: DocumentId,
) -> FpResult<VendorResult> {
    let canned_res = match identity_document_fixture {
        Some(decision) => match decision {
            DocumentFixtureResult::Pass => idv::test_fixtures::incode_curp_validation_good_curp(),
            DocumentFixtureResult::Fail => idv::test_fixtures::incode_curp_validation_bad_curp("01", "06"),
            // shouldn't happen
            DocumentFixtureResult::Real => idv::test_fixtures::incode_curp_validation_bad_curp("01", "06"),
        },
        None => idv::test_fixtures::incode_curp_validation_good_curp(),
    };

    // we're in sandbox
    let vault_data = pre_vault(state, id_doc_kind, canned_res.clone().into(), false, &sv_id).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
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

            let seqno = vault_curp_response(conn, &sv_id, vault_data)?;

            // set curp completed seqno so we can render historical responses in the dashboard
            let update = DocumentUpdate::set_curp_completed_seqno(seqno);
            let _ = Document::update(conn, &id_doc_id, update)?;

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

pub async fn pre_vault(
    state: &State,
    id_doc_kind: IdDocKind,
    response: PiiJsonValue,
    is_live: bool,
    sv_id: &ScopedVaultId,
) -> FpResult<FingerprintedDataRequest> {
    let data = vec![(
        DocumentDiKind::OcrData(id_doc_kind, ODK::CurpValidationResponse).into(),
        response,
    )];
    let mut validate_args = ValidateArgs::for_bifrost(is_live);
    validate_args.allow_dangling_keys = true;

    let data = HashMap::from_iter(data.into_iter());
    let data = DataRequest::clean_and_validate(data, validate_args)?;
    let data = FingerprintedDataRequest::build(state, data, sv_id).await?;
    Ok(data)
}

pub fn vault_curp_response(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    data: FingerprintedDataRequest,
) -> FpResult<DataLifetimeSeqno> {
    let vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
    let result = vw.patch_data(conn, data, DataRequestSource::Ocr)?;

    Ok(result.seqno)
}

fn doc_expects_curp(doc: &Document) -> bool {
    matches!(
        doc.vaulted_document_type.unwrap_or(doc.document_type),
        DocumentKind::VoterIdentification | DocumentKind::Passport
    ) && matches!(
        doc.vendor_validated_country_code().map(|v| v.0),
        Some(Iso3166TwoDigitCountryCode::MX)
    )
}

#[tracing::instrument(skip_all)]
async fn handle_curp_error(
    state: &State,
    sv_id: &ScopedVaultId,
    vres_id: &VerificationResultId,
    errors: Option<Vec<IncodeFailureReason>>,
) -> FpResult<()> {
    let svid = sv_id.clone();
    // We save under the same RSG created during the incode state machine if it ran so we
    // don't invalidate the old RSG
    if errors
        .as_ref()
        .map(|e| e.contains(&IncodeFailureReason::InvalidCurp))
        .unwrap_or(false)
    {
        let new_reason_codes: Vec<NewRiskSignalInfo> = vec![(
            FootprintReasonCode::CurpInputCurpInvalid,
            VendorAPI::IncodeCurpValidation,
            vres_id.clone(),
        )];
        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let rsg = RiskSignalGroup::get_or_create(conn, &svid, RiskSignalGroupKind::Doc)?;
                RiskSignal::bulk_add(conn, new_reason_codes, false, rsg.id)?;

                Ok(())
            })
            .await?;
    }
    Ok(())
}

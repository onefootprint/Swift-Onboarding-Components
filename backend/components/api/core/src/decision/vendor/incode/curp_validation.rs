use std::collections::HashMap;

use db::{
    models::{
        billing_event::BillingEvent,
        decision_intent::DecisionIntent,
        document_request::DocumentRequest,
        identity_document::{IdentityDocument, IdentityDocumentUpdate},
        incode_verification_session::IncodeVerificationSession,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        verification_request::VerificationRequest,
    },
    TxnPgConn,
};
use idv::{
    incode::curp_validation::{response::CurpValidationResponse, IncodeCurpValidationRequest},
    ParsedResponse, VendorResponse,
};
use itertools::Itertools;
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, BillingEventKind, DataIdentifier, DataLifetimeSeqno,
    DataLifetimeSource, DataRequest, DecisionIntentId, DocumentKind, DocumentRequestKind, Fingerprints,
    IdDocKind, IdentityDocumentFixtureResult, IdentityDocumentId, IncodeConfigurationId, IncodeEnvironment,
    IncodeSessionId, IncodeVerificationSessionKind, Iso3166TwoDigitCountryCode, OcrDataKind as ODK,
    PiiJsonValue, PiiString, ScopedVaultId, TenantId, ValidateArgs, VaultPublicKey, VendorAPI, WorkflowId,
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
    utils::vault_wrapper::{Any, DataLifetimeSources, VaultWrapper, VwArgs, WriteableVw},
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
    let wf_id3 = wf_id.clone();
    let di_id = di.id.clone();
    let (vw, tenant_id, id_documents, latest_results, sv) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            let id_documents = IdentityDocument::list_completed_sent_to_incode_by_wf_id(conn, &wf_id2)?;
            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &di_id)?;

            Ok((vw, tenant_id, id_documents, latest_results, sv))
        })
        .await?;

    // If we already have a successful curp validation for this DI, we return early
    let existing_vendor_result =
        VendorResult::get_successful_response(state, latest_results, &vw, VendorAPI::IncodeCurpValidation)
            .await?;
    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    // Handle both sandbox and prod
    let id_doc_helper = IdentityDocumentForCurpHelper::new(id_documents);
    let id_doc_fixture = id_doc_helper.fixture();
    let should_sent_curp_request = id_doc_helper.get_incode_environment(state, &tenant_id, sv.is_live);

    match should_sent_curp_request {
        Some(environment) => {
            // only consider documents sent to a vendor we we're actually sending curp requests
            let id_doc = id_doc_helper.sent_to_vendor;
            let (maybe_curp, iddoc) = get_curp_for_check(&state.enclave_client, &vw, id_doc.as_ref()).await?;
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
            let curp_response = res.map_err(map_to_api_error)?;
            let raw_response = curp_response.raw_response.clone();
            let parsed: CurpValidationResponse =
                curp_response.result.into_success().map_err(map_to_api_error)?;

            // Vaulting
            let iddoc_id = iddoc.id.clone();
            let is_live = matches!(environment, IncodeEnvironment::Production);
            let vault_data = pre_vault(
                &state.enclave_client,
                iddoc.vaulted_document_type.unwrap_or(iddoc.document_type),
                // TODO: fix this in upstack PR
                raw_response.clone(),
                is_live,
                &tenant_id,
            )
            .await?;

            let sv_id = di.scoped_vault_id.clone();
            state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<_> {
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
                    let update = IdentityDocumentUpdate::set_curp_completed_seqno(seqno);
                    let _ = IdentityDocument::update(conn, &iddoc_id, update)?;

                    let (obc, _) = ObConfiguration::get(conn, &wf_id3)?;
                    // create billing event
                    BillingEvent::create(conn, sv_id.clone(), obc.id, BillingEventKind::CurpValidation)?;


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
        None => {
            let id_doc = id_doc_helper.identity_document_for_sandbox();
            if let Some(doc) = id_doc {
                let id_doc_kind = doc.vaulted_document_type.unwrap_or(doc.document_type);
                let vendor_result = if id_doc_expects_curp(&doc) {
                    Some(
                        save_canned_response(
                            state,
                            di.scoped_vault_id.clone(),
                            di.id.clone(),
                            vw.vault.public_key.clone(),
                            id_doc_fixture,
                            &tenant_id,
                            id_doc_kind,
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
/// We want to be able to handle the case where documents are provided in sandbox
pub struct IdentityDocumentForCurpHelper {
    pub sent_to_vendor: Option<IdentityDocument>,
    pub other: Option<IdentityDocument>,
}
impl IdentityDocumentForCurpHelper {
    pub fn new(
        id_documents: Vec<(
            IdentityDocument,
            DocumentRequest,
            Option<IncodeVerificationSession>,
        )>,
    ) -> Self {
        let (sent_to_vendor, other): (Vec<_>, Vec<_>) = id_documents
            .into_iter()
            // only take identity docs
            .filter(|(_, dr, _)| matches!(dr.kind, DocumentRequestKind::Identity))
            // sort desc
            .sorted_by(|(i1, _, _), (i2, _, _)| i2.completed_seqno.cmp(&i1.completed_seqno))
            // partition by whether we sent to a vendor or not
            .partition(|(_, _, ivs)| ivs.is_some());

        Self {
            sent_to_vendor: sent_to_vendor.first().map(|(i, _, _)| i).cloned(),
            other: other.first().map(|(i, _, _)| i).cloned(),
        }
    }

    pub fn fixture(&self) -> Option<IdentityDocumentFixtureResult> {
        self.sent_to_vendor
            .as_ref()
            .and_then(|i| i.fixture_result)
            .or(self.other.as_ref().and_then(|i| i.fixture_result))
    }

    // TODO: we need to incorporate UseIncodeDemoCredentialsInLivemode
    //    -- if we flip the flag to use Incode demo creds in prod? I'm not sure validations will work there...? Does this actually do anything w/ Renapo in demo?
    #[tracing::instrument(skip_all)]
    pub fn get_incode_environment(
        &self,
        state: &State,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> ShouldSendCurpRequest {
        let fixture: Option<IdentityDocumentFixtureResult> = self.fixture();
        let is_sandbox = !is_live;
        let can_make_incode_request_in_sandbox = !is_live
            && state
                .feature_flag_client
                .flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(tenant_id))
            && matches!(fixture, Some(IdentityDocumentFixtureResult::Real),);

        if is_sandbox {
            // TODO: Does this actually do anything w/ Renapo? Check w/ incode. maybe should just return sandbox responses always
            if can_make_incode_request_in_sandbox {
                Some(IncodeEnvironment::Demo)
            } else {
                None
            }
        } else {
            Some(IncodeEnvironment::Production)
        }
    }

    pub fn identity_document_for_sandbox(&self) -> Option<IdentityDocument> {
        self.sent_to_vendor.as_ref().or(self.other.as_ref()).cloned() //rm cloned
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
    id_document: Option<&IdentityDocument>,
) -> ApiResult<(Option<PiiString>, IdentityDocument)> {
    if let Some(id_doc) = id_document {
        let Some(vaulted_document_type) = id_doc.vaulted_document_type else {
            return Ok((None, id_doc.clone()));
        };

        // We only expect a CURP for voter ID now
        if !id_doc_expects_curp(id_doc) {
            return Ok((None, id_doc.clone()));
        }

        let di = DataIdentifier::from(DocumentKind::OcrData(vaulted_document_type, ODK::Curp));
        // We should always get CURP on a voter ID
        // TODO: In the future we could have a risk signal or something for this i suppose. arguably this should go before the decryption, but just to observe incode
        // weirdness
        let decrypted_curp = if vw.get(&di).is_some() {
            vw.decrypt_unchecked_single(enclave_client, di).await?
        } else {
            tracing::error!(id_doc=?id_doc.id, "{}", format!("missing curp for {:?}", id_doc.vaulted_document_type));

            None
        };

        Ok((decrypted_curp, id_doc.clone()))
    } else {
        Err(ApiError::from(decision::Error::from(
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
    identity_document_fixture: Option<IdentityDocumentFixtureResult>,
    tenant_id: &TenantId,
    id_doc_kind: IdDocKind,
    id_doc_id: IdentityDocumentId,
) -> ApiResult<VendorResult> {
    let canned_res = match identity_document_fixture {
        Some(decision) => match decision {
            IdentityDocumentFixtureResult::Pass => idv::test_fixtures::incode_curp_validation_good_curp(),
            IdentityDocumentFixtureResult::Fail => idv::test_fixtures::incode_curp_validation_bad_curp(),
            // shouldn't happen
            IdentityDocumentFixtureResult::Real => idv::test_fixtures::incode_curp_validation_bad_curp(),
        },
        None => idv::test_fixtures::incode_curp_validation_good_curp(),
    };

    let vault_data = pre_vault(
        &state.enclave_client,
        id_doc_kind,
        canned_res.clone().into(),
        false, // we're in sandbox
        tenant_id,
    )
    .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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
            let update = IdentityDocumentUpdate::set_curp_completed_seqno(seqno);
            let _ = IdentityDocument::update(conn, &id_doc_id, update)?;


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
    enclave_client: &EnclaveClient,
    id_doc_kind: IdDocKind,
    response: PiiJsonValue,
    is_live: bool,
    tenant_id: &TenantId,
) -> ApiResult<DataRequest<Fingerprints>> {
    let data = vec![(
        DocumentKind::OcrData(id_doc_kind, ODK::CurpValidationResponse).into(),
        response,
    )];
    let mut validate_args = ValidateArgs::for_bifrost(is_live);
    validate_args.allow_dangling_keys = true;

    let data = HashMap::from_iter(data.into_iter());
    let data = DataRequest::clean_and_validate(data, validate_args)?;
    data.build_fingerprints(enclave_client, tenant_id).await
}

pub fn vault_curp_response(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    data: DataRequest<Fingerprints>,
) -> ApiResult<DataLifetimeSeqno> {
    let vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
    let sources = DataLifetimeSources::single(DataLifetimeSource::Ocr);
    let result = vw.patch_data(conn, data, sources, None)?;

    Ok(result.seqno)
}

fn id_doc_expects_curp(id_doc: &IdentityDocument) -> bool {
    matches!(
        id_doc.vaulted_document_type.unwrap_or(id_doc.document_type),
        IdDocKind::VoterIdentification | IdDocKind::Passport
    ) && matches!(
        id_doc.vendor_validated_country_code().map(|v| v.0),
        Some(Iso3166TwoDigitCountryCode::MX)
    )
}

use alpaca::AlpacaCip;
use alpaca::CipRequest;
use alpaca::CipResult;
use alpaca::DataComparsionBreakDown;
use alpaca::ImageIntegrityBreakdown;
use alpaca::VisualAuthenticity;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyAuth;
use api_core::auth::tenant::TenantGuard;
use api_core::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use api_core::decision::features::{
    self,
};
use api_core::decision::field_validations::create_field_validation_results;
use api_core::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use api_core::decision::{
    self,
};
use api_core::errors::cip_error::CipError;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::DecryptUncheckedResult;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::AlpacaCipRequest;
use api_wire_types::AlpacaCipResponse;
use api_wire_types::DeprecatedAlpacaCipRequest;
use chrono::DateTime;
use chrono::Utc;
use db::actor::saturate_actors;
use db::actor::SaturatedActor;
use db::models::annotation::Annotation;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::InsightEvent;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::OnboardingDecisionFilters;
use db::models::risk_signal::AtSeqno;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VReqIdentifier;
use db::models::workflow::Workflow;
use db::OffsetPagination;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use itertools::Itertools;
use newtypes::format_pii;
use newtypes::pii;
use newtypes::vendor_api_struct::IncodeFetchOcr;
use newtypes::vendor_api_struct::IncodeFetchScores;
use newtypes::vendor_api_struct::IncodeWatchlistCheck;
use newtypes::AlpacaPiiString;
use newtypes::DataIdentifier;
use newtypes::DecisionStatus;
use newtypes::DocumentDiKind;
use newtypes::ExternalIntegrationInfo;
use newtypes::ExternalIntegrationKind;
use newtypes::FootprintReasonCode;
use newtypes::FpId;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind;
use newtypes::ManualReviewKind;
use newtypes::MatchLevel;
use newtypes::OcrDataKind;
use newtypes::OnboardingStatus;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ReviewReason;
use newtypes::SignalScope;
use newtypes::TenantId;
use newtypes::Vendor;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::collections::HashSet;
use DataIdentifier::*;
use DocumentDiKind::*;
use IdentityDataKind::*;

#[api_v2_operation(
    description = "Forward CIP information to Alpaca",
    tags(Integrations, Alpaca, Preview)
)]
#[actix::post("/users/{fp_id}/integrations/alpaca/cip")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyAuth,
    request: Json<AlpacaCipRequest>,
    fp_id: FpIdPath,
) -> ApiResponse<AlpacaCipResponse> {
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let AlpacaCipRequest {
        api_key,
        api_secret,
        default_approver,
        hostname,
        account_id,
    } = request.into_inner();
    let fp_id = fp_id.into_inner();
    let fp_id2 = fp_id.clone();
    let alpaca_account_id = account_id.clone();
    let request = DeprecatedAlpacaCipRequest {
        fp_user_id: fp_id,
        api_key,
        api_secret,
        default_approver,
        hostname,
        account_id,
    };
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let tenant_id2 = tenant_id.clone();
    let result = post_inner(&state, is_live, tenant_id, request).await;
    let success = result.is_ok();

    let info = ExternalIntegrationInfo {
        integration: ExternalIntegrationKind::AlpacaCip,
        successful: success,
        external_id: Some(alpaca_account_id),
    };

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id2, &tenant_id2, is_live))?;
            UserTimeline::create(conn, info, sv.vault_id, sv.id)?;

            Ok(())
        })
        .await?;

    result
}

#[api_v2_operation(
    description = "Forward CIP information to Alpaca",
    tags(Integrations, Alpaca, Deprecated)
)]
#[actix::post("/integrations/alpaca/cip")]
pub async fn post_old(
    state: web::Data<State>,
    auth: TenantApiKeyAuth,
    request: Json<DeprecatedAlpacaCipRequest>,
) -> ApiResponse<AlpacaCipResponse> {
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let tenant_id2 = tenant_id.clone();
    let r = request.into_inner();
    let fp_id = r.fp_user_id.clone();
    let alpaca_account_id = r.account_id.clone();

    let result = post_inner(&state, is_live, tenant_id, r).await;

    let success = result.is_ok();
    let info = ExternalIntegrationInfo {
        integration: ExternalIntegrationKind::AlpacaCip,
        successful: success,
        external_id: Some(alpaca_account_id),
    };

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id2, is_live))?;
            UserTimeline::create(conn, info, sv.vault_id, sv.id)?;

            Ok(())
        })
        .await?;

    result
}

#[tracing::instrument(skip(state, request))]
pub async fn post_inner(
    state: &State,
    is_live: bool,
    tenant_id: TenantId,
    request: DeprecatedAlpacaCipRequest,
) -> ApiResponse<AlpacaCipResponse> {
    tracing::info!(%request.fp_user_id, %request.hostname, %request.account_id, "/integrations/alpaca/cip request");

    // make the client
    let alpaca_client = alpaca::AlpacaCipClient::new(request.api_key, request.api_secret, &request.hostname)
        .map_err(CipError::from)?;

    // build the cip request
    let (cip_request, _) = create_cip_request(
        state,
        request.default_approver,
        request.fp_user_id,
        tenant_id,
        is_live,
    )
    .await?;

    // fire off the cip request to alpaca
    let response = alpaca_client
        .send_cip(request.account_id, cip_request)
        .await
        .map_err(CipError::from)?;

    // parse the response as json and grab it's response code
    let status_code = response.status().as_u16();
    let alpaca_response: PiiJsonValue = response.json().await?;

    Ok(AlpacaCipResponse {
        status_code,
        alpaca_response,
    })
}

/// create a CIP request from the decision results
#[tracing::instrument(skip(state, default_approver))]
pub(crate) async fn create_cip_request(
    state: &State,
    default_approver: PiiString,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> FpResult<(CipRequest, TenantVw)> {
    let (
        uvw,
        wf,
        latest_decision_created_at,
        scoped_vault,
        obc,
        actor,
        mr,
        annotation,
        risk_signals,
        insight,
        latest_identity_document_and_request,
    ) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let filters = OnboardingDecisionFilters {
                made_by_footprint: Some(true),
            };
            // Get the most recent FP decision
            let (mut decisions, _) =
                OnboardingDecision::list(conn, &sv.id, filters, OffsetPagination::page(1))?;
            let (fp_obd, _, _) = decisions.pop().ok_or(CipError::EntityDecisionDoesNotExist)?;
            let (wf, sv) = Workflow::get_all(conn, &fp_obd.workflow_id)?;
            let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

            let risk_signals = RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, AtSeqno(None))?
                .into_iter()
                .map(|(_, rs)| rs)
                .collect_vec();

            let (mr, manual_obd, annotation) = match fp_obd.status {
                DecisionStatus::Pass => (None, None, None),
                DecisionStatus::Fail | DecisionStatus::StepUp | DecisionStatus::None => {
                    // Get the MR associated with FPs initial decision
                    let mr_filters = ManualReviewFilters {
                        only_active: false,
                        kinds: Some(vec![ManualReviewKind::RuleTriggered]),
                    };
                    let mrs = ManualReview::get(conn, &wf.id, mr_filters)?;
                    // take the one with longest review reasons, although in practice this will just be 1
                    // review
                    let mr = mrs
                        .into_iter()
                        .sorted_by_key(|mr| mr.review_reasons.len())
                        .next_back();

                    // footprint did not decide to pass, see if a manual decision override exists
                    let filters = OnboardingDecisionFilters {
                        made_by_footprint: Some(false),
                    };
                    let (mut decisions, _) =
                        OnboardingDecision::list(conn, &sv.id, filters, OffsetPagination::page(1))?;
                    let (obd_manual, _, _) = decisions.pop().ok_or(CipError::EntityDecisionStatusNotPass)?;

                    // Ultimately, we don't care if the latest manual review has a Pass, it could be
                    // DecisionStatus::None. We just want to know if this user is `Pass`
                    // (with our current way of modeling statuses as of 2024-09)
                    if sv.status != OnboardingStatus::Pass {
                        return Err(CipError::EntityDecisionManualReviewStatusNotPass.into());
                    }

                    // randomly take the latest review annotation, hoping this is the one that is most like
                    // "good to go"
                    let annotation = Annotation::get_for_obd(conn, &obd_manual.id)?;

                    (mr, Some(obd_manual), annotation)
                }
            };
            let latest_identity_document_and_request = Document::get_latest_complete_identity(conn, &wf.id)?;

            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let insight = InsightEvent::get_for_workflow(conn, &wf.id)?;

            let decision = manual_obd.unwrap_or(fp_obd);

            // find the actor either via Manaul OBD or the FP OBD.
            let actor = saturate_actors(conn, vec![decision.clone()])?
                .pop()
                .map(|(_, actor)| actor);

            Ok((
                uvw,
                wf,
                decision.created_at,
                sv,
                obc,
                actor,
                mr,
                annotation,
                risk_signals,
                insight,
                latest_identity_document_and_request,
            ))
        })
        .await?;

    tracing::info!(
        ?wf,
        ?latest_decision_created_at,
        ?scoped_vault,
        ?obc,
        ?actor,
        ?mr,
        ?annotation,
        ?risk_signals,
        collect_document = ?latest_identity_document_and_request.as_ref().map(|(_, dr)| dr.should_collect_selfie()),
        "create_cip_request data"
    );

    let vd = uvw
        .decrypt_unchecked(
            &state.enclave_client,
            &[
                Id(FirstName),
                Id(MiddleName),
                Id(LastName),
                Id(Email),
                Id(PhoneNumber),
                Id(Dob),
                Id(AddressLine1),
                Id(AddressLine2),
                Id(Nationality),
                Id(UsLegalStatus),
                Id(Zip),
                Id(Country),
                Document(OcrData(IdDocKind::DriversLicense, OcrDataKind::DocumentNumber)),
                Document(OcrData(IdDocKind::IdCard, OcrDataKind::DocumentNumber)),
                Document(OcrData(IdDocKind::Passport, OcrDataKind::DocumentNumber)),
            ],
        )
        .await?;

    // build the cip object components
    let kyc = kyc(
        &scoped_vault,
        &wf,
        latest_decision_created_at,
        insight,
        actor,
        default_approver,
        mr.as_ref(),
        annotation.as_ref(),
        &vd,
    )?;
    let sv_id = scoped_vault.id.clone();
    let (watchlist_result_response, _) = load_response_for_vendor_api(
        state,
        VReqIdentifier::LatestForSv(sv_id.clone()),
        &uvw.vault.e_private_key,
        IncodeWatchlistCheck,
    )
    .await?
    .ok()
    .ok_or(CipError::WatchlistResultsNotFoundError)?;
    let watchlist = watchlist(
        &scoped_vault,
        &obc,
        latest_decision_created_at,
        &risk_signals,
        mr.as_ref(),
        watchlist_result_response,
    )?;
    let identity = identity(&scoped_vault, latest_decision_created_at, risk_signals);
    let (document, photo) =
        if let Some((identity_document, document_request)) = latest_identity_document_and_request {
            let (ocr_response, _) = load_response_for_vendor_api(
                state,
                VReqIdentifier::LatestForSv(sv_id.clone()),
                &uvw.vault.e_private_key,
                IncodeFetchOcr,
            )
            .await?
            .ok()
            .ok_or(CipError::VerificationResultNotFound(IncodeFetchOcr.into()))?;
            let (scores_response, _) = load_response_for_vendor_api(
                state,
                VReqIdentifier::LatestForSv(sv_id),
                &uvw.vault.e_private_key,
                IncodeFetchScores,
            )
            .await?
            .ok()
            .ok_or(CipError::VerificationResultNotFound(IncodeFetchScores.into()))?;
            document_and_photo(
                scoped_vault.clone(),
                mr.as_ref(),
                &vd,
                wf._created_at,
                identity_document,
                document_request,
                ocr_response,
                scores_response,
            )?
        } else {
            (None, None)
        };

    let cip = CipRequest {
        provider_name: vec![alpaca::Provider::Footprint],
        kyc,
        watchlist,
        identity,
        document,
        photo,
    };

    Ok((cip, uvw))
}

/// helper for building the kyc data
#[allow(clippy::too_many_arguments)]
fn kyc(
    scoped_vault: &ScopedVault,
    wf: &Workflow,
    decision_created_at: DateTime<Utc>,
    insight: Option<InsightEvent>,
    actor: Option<SaturatedActor>,
    default_approver: PiiString,
    mr: Option<&ManualReview>,
    annotation: Option<&Annotation>,
    decrypted_data: &DecryptUncheckedResult,
) -> FpResult<alpaca::Kyc> {
    // find the right approver
    let approved_by = actor
        .and_then(|a| match a {
            db::actor::SaturatedActor::TenantUser(user) => user.name(),
            db::actor::SaturatedActor::User(_)
            | db::actor::SaturatedActor::TenantApiKey(_)
            | db::actor::SaturatedActor::FirmEmployee(_)
            | db::actor::SaturatedActor::Footprint => None,
        })
        .unwrap_or(default_approver);

    // build the approved reason from the latest annotation if it exists
    // TODO: FP-3990 there should be a better way to signfiy a manual review annotation

    let approved_reason = if let Some(mr) = mr {
        let mut review_reason_crs = mr
            .review_reasons
            .iter()
            .map(|rr| rr.canned_response().to_owned())
            .collect::<Vec<_>>();
        review_reason_crs.sort();
        review_reason_crs.join(". ")
    } else {
        // If there is no MR but there is an anotation (from the manual OBD) then we send this as
        // approved_reason
        annotation
            .map(|annotation| annotation.note.clone())
            .unwrap_or("User was manually reviewed and data verified".to_owned())
    };
    // find a gov't id number if we have one
    let id_number = vec![
        OcrData(IdDocKind::DriversLicense, OcrDataKind::DocumentNumber),
        OcrData(IdDocKind::IdCard, OcrDataKind::DocumentNumber),
        OcrData(IdDocKind::Passport, OcrDataKind::DocumentNumber),
    ]
    .into_iter()
    .flat_map(|id| decrypted_data.get_di(id).ok())
    .next();

    let nationality = if let Ok(nationality) = decrypted_data.get_di(Nationality) {
        Some(nationality)
    } else if let Ok(us_legal_status) = decrypted_data.get_di(UsLegalStatus) {
        if newtypes::UsLegalStatus::try_from(us_legal_status.leak()).ok()
            == Some(newtypes::UsLegalStatus::Citizen)
        {
            Some(PiiString::from("US")) // for now we treat citizen as meaning nationality US. soon
                                        // we will explicitly capture nationality for citizens too
        } else {
            None
        }
    } else {
        None
    };
    if nationality.is_none() {
        tracing::error!("Alpaca CIP call made with Nationality missing");
    }

    let kyc = alpaca::Kyc {
        id: scoped_vault.fp_id.clone(),
        applicant_name: vec![
            decrypted_data.get_di(FirstName),
            decrypted_data.get_di(MiddleName),
            decrypted_data.get_di(LastName),
        ]
        .into_iter()
        .flatten()
        .map(|s| s.leak_to_string())
        .join(" ")
        .into(),
        email_address: decrypted_data.get_di(Email)?.into(),
        nationality: nationality.map(|n| n.into()),
        date_of_birth: decrypted_data.get_di(Dob)?.into(),
        address: if let Ok(address2) = decrypted_data.get_di(AddressLine2) {
            format_pii!("{} {}", decrypted_data.get_di(AddressLine1)?, address2).into()
        } else {
            decrypted_data.get_di(AddressLine1)?.into()
        },
        postal_code: decrypted_data.get_di(Zip)?.into(),
        country_of_residency: decrypted_data.get_di(Country)?.into(),
        kyc_completed_at: Some(decision_created_at),
        ip_address: pii!(insight.and_then(|ie| ie.ip_address).unwrap_or("0.0.0.0".into())).into(),
        check_initiated_at: wf.authorized_at,
        check_completed_at: Some(decision_created_at),
        approval_status: alpaca::ApprovalStatus::Approved,
        approved_by,
        approved_at: decision_created_at,

        approved_reason: Some(approved_reason),

        id_number: id_number.map(|i| i.into()),
    };
    Ok(kyc)
}

/// helper for building the alpaca idenity sub-response
fn identity(
    scoped_vault: &ScopedVault,
    decision_created_at: DateTime<Utc>,
    risk_signals: Vec<RiskSignal>,
) -> alpaca::Identity {
    let (reason_codes, vendors): (Vec<_>, Vec<_>) = risk_signals
        .into_iter()
        .map(|rs| (rs.reason_code, vec![rs.vendor_api.into()]))
        .unzip();
    let vendors = HashSet::<Vendor>::from_iter(vendors.into_iter().flatten())
        .into_iter()
        .collect::<Vec<_>>();

    let mut field_validations = create_field_validation_results(reason_codes);

    let matched_address = matches!(
        field_validations
            .remove(&SignalScope::Address)
            .map(|fv| fv.match_level),
        Some(MatchLevel::Exact) | Some(MatchLevel::Partial)
    );
    let matched_address_result = CipResult::clear(matched_address);

    let dob = field_validations
        .remove(&SignalScope::Dob)
        .map(|fv| fv.match_level)
        == Some(MatchLevel::Exact);
    let dob_result = CipResult::clear(dob);

    let tax_id = field_validations
        .remove(&SignalScope::Ssn)
        .map(|fv| fv.match_level)
        == Some(MatchLevel::Exact);
    let tax_id_result = CipResult::clear(tax_id);

    let any_consider = [matched_address_result, dob_result, tax_id_result]
        .iter()
        .any(|r| matches!(r, CipResult::Consider));
    let overall_result = CipResult::clear(!any_consider);

    alpaca::Identity {
        id: scoped_vault.fp_id.clone(),
        result: overall_result,
        status: alpaca::CipStatus::Complete,
        created_at: decision_created_at,
        matched_address: matched_address_result,
        matched_addresses: vendors.clone(),
        date_of_birth: dob_result,
        date_of_birth_breakdown: vendors.clone(),
        tax_id: tax_id_result,
        tax_id_breakdown: vendors,
    }
}

/// helper for building the alpaca idenity sub-response
#[tracing::instrument(skip_all)]
fn watchlist(
    scoped_vault: &ScopedVault,
    obc: &ObConfiguration,
    decision_created_at: DateTime<Utc>,
    risk_signals: &[RiskSignal],
    mr: Option<&ManualReview>,
    watchlist_result_response: WatchlistResultResponse,
) -> FpResult<alpaca::Watchlist> {
    let pep: bool = risk_signals
        .iter()
        .any(|rs| rs.reason_code == FootprintReasonCode::WatchlistHitPep);
    let pep_result = CipResult::clear(!pep);

    let sanctions: bool = risk_signals.iter().any(|rs: &RiskSignal| {
        matches!(
            rs.reason_code,
            FootprintReasonCode::WatchlistHitOfac | FootprintReasonCode::WatchlistHitNonSdn
        )
    });
    let sanctions_result = CipResult::clear(!sanctions);

    let monitored_lists: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::WatchlistHitWarning);
    let monitored_lists_result = CipResult::clear(!monitored_lists);

    let adverse_media: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::AdverseMediaHit);
    let adverse_media_result = CipResult::clear(!adverse_media);

    let any_consider = [
        pep_result,
        sanctions_result,
        monitored_lists_result,
        adverse_media_result,
    ]
    .iter()
    .any(|r| matches!(r, CipResult::Consider));
    let overall_result = CipResult::clear(!any_consider);

    // Validate wrt to mr.review_reasons
    if adverse_media
        && !mr
            .map(|r| r.review_reasons.contains(&ReviewReason::AdverseMediaHit))
            .unwrap_or(false)
    {
        tracing::error!("CIP endpoint ExpectedReviewReasonNotFound: AdverseMediaHit");
    }
    if (pep | sanctions | monitored_lists)
        && !mr
            .map(|r| r.review_reasons.contains(&ReviewReason::WatchlistHit))
            .unwrap_or(false)
    {
        tracing::error!("CIP endpoint ExpectedReviewReasonNotFound: WatchlistHit");
    }

    // We don't currently have a concept of paramaterized RiskSignal's or another way to store watchlist
    // hits, so we pull them from the Vres on the fly here

    // For now, we just serialize the raw leaked json blob we get from Incode for each watchlist hit
    let leaked_hits = decision::features::incode_watchlist::get_hits(
        &watchlist_result_response,
        &obc.verification_checks().enhanced_aml(),
        &obc.tenant_id,
    )
    .into_iter()
    .map(|h| h.leak());
    let records_json: Vec<PiiJsonValue> = leaked_hits
        .map(|h| serde_json::to_value(&h).map(PiiJsonValue::new))
        .collect::<Result<Vec<_>, _>>()?;

    Ok(alpaca::Watchlist {
        id: scoped_vault.fp_id.clone(),
        result: overall_result,
        status: alpaca::CipStatus::Complete,
        created_at: decision_created_at,
        politically_exposed_person: pep_result,
        monitored_lists: monitored_lists_result,
        sanction: sanctions_result,
        adverse_media: adverse_media_result,
        records: records_json,
    })
}

#[allow(clippy::too_many_arguments)]
fn document_and_photo(
    scoped_vault: ScopedVault,
    _mr: Option<&ManualReview>,
    decrypted_data: &DecryptUncheckedResult,
    check_started_at: DateTime<Utc>,
    identity_document: Document,
    document_request: DocumentRequest,
    ocr_response: FetchOCRResponse,
    scores_response: FetchScoresResponse,
) -> FpResult<(Option<alpaca::DocumentPhotoId>, Option<alpaca::PhotoSelfie>)> {
    let expect_selfie = document_request.should_collect_selfie();

    let ocr_name = ocr_response.name.as_ref();
    if ocr_name.is_none() {
        tracing::warn!("missing ocr name");
    }

    let dk = identity_document
        .vaulted_document_type
        .unwrap_or(identity_document.document_type);

    let dob = ocr_response.dob().map(PiiString::from).ok();
    // If age wasn't OCR'd properly, we assume the reviewer confirmed they are over 18
    let over_18_check = ocr_response.age().ok().map(|a| a >= 18).unwrap_or(true);

    // Construct all of the breakdown fields
    // TODO: load these once FRC<>VRes migration is done
    let incode_vault_data = IncodeOcrComparisonDataFields::from_decrypted_values(decrypted_data);
    let frcs = features::incode_docv::footprint_reason_codes(
        ocr_response.clone(),
        scores_response,
        incode_vault_data,
        expect_selfie,
        dk.try_into()?,
    )?;

    let document_result_helper = DocumentCipResultHelper::new(&frcs);
    let (data_comparison_overall, data_comparison_breakdown) = document_result_helper.data_comparison();
    let (image_integrity_overall, image_integrity_breakdown) = document_result_helper.image_integrity();

    let document_photo_id = alpaca::DocumentPhotoId {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: check_started_at,
        first_name: ocr_name.and_then(|ocr_name| {
            ocr_name
                .first_name
                .as_ref()
                .map(|p| AlpacaPiiString::from(p.leak()))
        }),
        last_name: ocr_name.and_then(|ocr_name| {
            ocr_name
                .paternal_last_name
                .as_ref()
                .map(|p| (**p).clone())
                .map(|a| a.into())
        }),
        gender: ocr_response.gender.as_ref().map(|p| (**p).leak().into()),
        date_of_birth: dob.map(|d| d.into()),
        date_of_expiry: ocr_response
            .expiration_date()
            .ok()
            .map(|a| AlpacaPiiString::from(a.leak())),
        issuing_country: ocr_response.issuing_country.as_ref().map(|p| (*p).leak().into()),
        document_numbers: ocr_response
            .document_number
            .as_ref()
            .map(|p| (*p).leak().into())
            .map(|d| vec![d]),
        document_type: Some(dk.try_into()?),
        age_validation: CipResult::clear(over_18_check),
        data_comparison: data_comparison_overall,
        data_comparison_breakdown,
        image_integrity: image_integrity_overall,
        image_integrity_breakdown,
        visual_authenticity: document_result_helper.visual_authenticity(),
    };

    let selfie_result = document_result_helper.selfie_result();
    let photo_selfie = alpaca::PhotoSelfie {
        id: scoped_vault.fp_id,
        result: selfie_result,
        status: alpaca::CipStatus::Complete,
        created_at: check_started_at,
        face_comparison: selfie_result,
        image_integrity: selfie_result,
        visual_authenticity: selfie_result,
    };

    Ok((Some(document_photo_id), Some(photo_selfie)))
}

struct DocumentCipResultHelper<'a> {
    frcs: &'a [FootprintReasonCode],
}

impl<'a> DocumentCipResultHelper<'a> {
    fn new(frcs: &'a [FootprintReasonCode]) -> Self {
        Self { frcs }
    }

    fn data_comparison(&self) -> (CipResult, DataComparsionBreakDown) {
        let first = CipResult::clear(
            self.frcs
                .contains(&FootprintReasonCode::DocumentOcrFirstNameMatches),
        );

        let last = CipResult::clear(
            self.frcs
                .contains(&FootprintReasonCode::DocumentOcrLastNameMatches),
        );

        let dob = CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentOcrDobMatches));

        let any_consider = [first, last, dob]
            .iter()
            .any(|r| matches!(r, CipResult::Consider));
        let overall_result = CipResult::clear(!any_consider);
        (
            overall_result,
            DataComparsionBreakDown {
                first_name: first,
                last_name: last,
                date_of_birth: dob,
                address: Some(CipResult::clear(
                    self.frcs
                        .contains(&FootprintReasonCode::DocumentOcrAddressMatches),
                )),
            },
        )
    }

    fn image_integrity(&self) -> (CipResult, ImageIntegrityBreakdown) {
        // TODO: this isn't quite right, but prob need to parse a few of the id tests to get this exactly
        let image_quality = CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentVerified));
        // we error upstream if not
        let supported_document = CipResult::Clear;

        let any_consider = [image_quality, supported_document]
            .iter()
            .any(|r| matches!(r, CipResult::Consider));

        let overall_result = CipResult::clear(!any_consider);

        (
            overall_result,
            ImageIntegrityBreakdown {
                image_quality,
                supported_document,
                // Incode doesn't have a test for this directly
                colour_picture: None,
                // redundant to image quality
                conclusive_document_quality: Some(image_quality),
            },
        )
    }

    fn visual_authenticity(&self) -> VisualAuthenticity {
        VisualAuthenticity {
            // postitcheck is actually what we want but /shrug
            digital_tampering: CipResult::clear(
                self.frcs.contains(&FootprintReasonCode::DocumentNotFakeImage),
            ),
            face_detection: CipResult::clear(
                self.frcs
                    .contains(&FootprintReasonCode::DocumentVisiblePhotoFeaturesVerified),
            ),
            // Incode doesn't have a test for these directly, all bundled into the score
            fonts: CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentVerified)),
            picture_face_integrity: CipResult::clear(
                self.frcs.contains(&FootprintReasonCode::DocumentVerified),
            ),
            security_features: CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentVerified)),
            template: CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentVerified)),
        }
    }

    fn selfie_result(&self) -> CipResult {
        CipResult::clear(self.frcs.contains(&FootprintReasonCode::DocumentSelfieMatches))
    }
}

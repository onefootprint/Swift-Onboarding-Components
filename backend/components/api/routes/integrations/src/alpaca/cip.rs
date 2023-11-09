use std::collections::HashSet;

use alpaca::{
    AlpacaCip, CipRequest, CipResult, DataComparsionBreakDown, ImageIntegrityBreakdown, VisualAuthenticity,
};
use api_core::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    decision::{
        self,
        features::{self, incode_docv::IncodeOcrComparisonDataFields},
        field_validations::create_field_validation_results,
        vendor::{
            vendor_api::{
                vendor_api_response::build_vendor_response_map_from_vendor_results,
                vendor_api_struct::{vendor_api_enum_from_struct, IncodeFetchOCR, IncodeFetchScores},
            },
            vendor_result::VendorResult,
        },
    },
    errors::{cip_error::CipError, ApiResult},
    types::{JsonApiResponse, ResponseData},
    utils::vault_wrapper::{DecryptUncheckedResult, TenantVw, VaultWrapper},
    ApiError, ApiErrorKind, State,
};
use api_wire_types::{AlpacaCipRequest, AlpacaCipResponse};
use chrono::{DateTime, Utc};
use db::{
    actor::{saturate_actors, SaturatedActor},
    models::{
        document_request::DocumentRequest, insight_event::InsightEvent, manual_review::ManualReview,
        ob_configuration::ObConfiguration, onboarding_decision::OnboardingDecision, risk_signal::RiskSignal,
        scoped_vault::ScopedVault, verification_request::VerificationRequest, workflow::Workflow,
    },
};
use idv::ParsedResponse;
use newtypes::{
    format_pii, pii, DataIdentifier, DecisionStatus, DocumentKind, FootprintReasonCode, FpId, IdDocKind,
    IdentityDataKind, MatchLevel, OcrDataKind, PiiJsonValue, PiiString, ReviewReason, SignalScope, TenantId,
    Vendor, VendorAPI,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use DataIdentifier::*;
use DocumentKind::*;
use IdentityDataKind::*;

#[api_v2_operation(
    description = "Forward CIP information to Alpaca",
    tags(Integrations, Alpaca, Preview)
)]
#[actix::post("/integrations/alpaca/cip")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<AlpacaCipRequest>,
) -> JsonApiResponse<AlpacaCipResponse> {
    tracing::info!(%request.fp_user_id, %request.hostname, %request.account_id, "/integrations/alpaca/cip request");
    let request = request.into_inner();
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    // make the client
    let alpaca_client = alpaca::AlpacaCipClient::new(request.api_key, request.api_secret, &request.hostname)
        .map_err(CipError::from)?;

    // build the cip request
    let (cip_request, _) = create_cip_request(
        &state,
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

    ResponseData::ok(AlpacaCipResponse {
        status_code,
        alpaca_response,
    })
    .json()
}

/// create a CIP request from the decision results
pub(crate) async fn create_cip_request(
    state: &State,
    default_approver: PiiString,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> ApiResult<(CipRequest, TenantVw)> {
    let (uvw, wf, decision, scoped_vault, obc, actor, mr, risk_signals, insight, vres, collected_document) =
        state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let fp_obd =
                    OnboardingDecision::latest_footprint_actor_decision(conn, &fp_id, &tenant_id, is_live)?
                        .ok_or(CipError::EntityDecisionDoesNotExist)?;

                let risk_signals =
                    RiskSignal::list_tenant_visible_by_onboarding_decision_id(conn, &fp_obd.id)?;
                let (wf, sv) = Workflow::get_all(conn, &fp_obd.workflow_id)?;
                let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

                let (risk_signals, mr, manual_obd) = match fp_obd.status {
                    DecisionStatus::Pass => (risk_signals, None, None),
                    DecisionStatus::Fail | DecisionStatus::StepUp => {
                        // footprint decided as fail, see if a manual decision override exists
                        let (mr, obd_manual) = ManualReview::latest_completed_for_workflow(conn, &wf.id)?
                            .ok_or(CipError::EntityDecisionStatusNotPass)?;

                        if obd_manual.status != DecisionStatus::Pass {
                            return Err(CipError::EntityDecisionManualReviewStatusNotPass)?;
                        }

                        (risk_signals, Some(mr), Some(obd_manual))
                    }
                };

                let collected_document = DocumentRequest::get(conn, &wf.id)?.map(|d| d.should_collect_selfie);
                let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
                let insight = InsightEvent::get(conn, &wf.id)?;

                let decision = manual_obd.unwrap_or(fp_obd);

                // find the actor either via Manaul OBD or the FP OBD.
                let actor = saturate_actors(conn, vec![decision.clone()])?
                    .pop()
                    .map(|(_, actor)| actor);

                let vres = VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(
                    conn,
                    sv.id.clone(),
                )?;

                Ok((
                    uvw,
                    wf,
                    decision,
                    sv,
                    obc,
                    actor,
                    mr,
                    risk_signals,
                    insight,
                    vres,
                    collected_document,
                ))
            })
            .await??;

    let user_vault_private_key = uvw.vault.e_private_key.clone();
    let document_check_created_at = vres
        .iter()
        .find(|(r, _)| r.vendor_api == VendorAPI::IncodeFetchScores)
        .map(|(r, _)| r._created_at)
        .unwrap_or(Utc::now());

    let vendor_results = VendorResult::from_verification_results_for_onboarding(
        vres,
        &state.enclave_client,
        &user_vault_private_key,
    )
    .await?;
    let vd = uvw
        .decrypt_unchecked(
            &state.enclave_client,
            &[
                Id(FirstName),
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
        &decision,
        insight,
        actor,
        default_approver,
        mr.as_ref(),
        &vd,
    )?;
    let watchlist = watchlist(
        &scoped_vault,
        &obc,
        &decision,
        &risk_signals,
        &vendor_results,
        mr.as_ref(),
    )?;
    let identity = identity(&scoped_vault, &decision, risk_signals);
    let (document, photo) = if let Some(collected_selfie) = collected_document {
        document_and_photo(
            scoped_vault.clone(),
            mr.as_ref(),
            &vendor_results,
            &vd,
            document_check_created_at,
            collected_selfie,
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
    decision: &OnboardingDecision,
    insight: Option<InsightEvent>,
    actor: Option<SaturatedActor>,
    default_approver: PiiString,
    mr: Option<&ManualReview>,
    decrypted_data: &DecryptUncheckedResult,
) -> ApiResult<alpaca::Kyc> {
    // find the right approver
    let approved_by = actor
        .and_then(|a| match a {
            db::actor::SaturatedActor::TenantUser(user) => user.name(),
            db::actor::SaturatedActor::TenantApiKey(_)
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
        Some(review_reason_crs.join(". "))
    } else {
        None
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
            Some(PiiString::from("US")) // for now we treat citizen as meaning nationality US. soon we will explicitly capture nationality for citizens too
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
        applicant_name: format_pii!(
            "{} {}",
            decrypted_data.get_di(FirstName)?,
            decrypted_data.get_di(LastName)?
        ),
        email_address: decrypted_data.get_di(Email)?,
        nationality,
        date_of_birth: decrypted_data.get_di(Dob)?,
        address: if let Ok(address2) = decrypted_data.get_di(AddressLine2) {
            format_pii!("{} {}", decrypted_data.get_di(AddressLine1)?, address2)
        } else {
            decrypted_data.get_di(AddressLine1)?
        },
        postal_code: decrypted_data.get_di(Zip)?,
        country_of_residency: decrypted_data.get_di(Country)?,
        kyc_completed_at: Some(decision.created_at),
        ip_address: pii!(insight.and_then(|ie| ie.ip_address).unwrap_or("0.0.0.0".into())),
        check_initiated_at: wf.authorized_at,
        check_completed_at: Some(decision.created_at),
        approval_status: alpaca::ApprovalStatus::Approved,
        approved_by,
        approved_at: decision.created_at,

        approved_reason,

        id_number,
    };
    Ok(kyc)
}

/// helper for building the alpaca idenity sub-response
fn identity(
    scoped_vault: &ScopedVault,
    decision: &OnboardingDecision,
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
        created_at: decision.created_at,
        matched_address: matched_address_result,
        matched_addresses: vendors.clone(),
        date_of_birth: dob_result,
        date_of_birth_breakdown: vendors.clone(),
        tax_id: tax_id_result,
        tax_id_breakdown: vendors,
    }
}

/// helper for building the alpaca idenity sub-response
fn watchlist(
    scoped_vault: &ScopedVault,
    obc: &ObConfiguration,
    decision: &OnboardingDecision,
    risk_signals: &[RiskSignal],
    vres: &[VendorResult],
    mr: Option<&ManualReview>,
) -> ApiResult<alpaca::Watchlist> {
    let pep: bool = risk_signals
        .iter()
        .any(|rs| rs.reason_code == FootprintReasonCode::WatchlistHitPep);
    let pep_result = CipResult::clear(!pep);

    let ofac: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::WatchlistHitOfac);
    let ofac_result = CipResult::clear(!ofac);

    let sanctions: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::WatchlistHitNonSdn);
    let sanctions_result = CipResult::clear(!sanctions);

    let adverse_media: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::AdverseMediaHit);
    let adverse_media_result = CipResult::clear(!adverse_media);

    let any_consider = [pep_result, ofac_result, sanctions_result, adverse_media_result]
        .iter()
        .any(|r| matches!(r, CipResult::Consider));
    let overall_result = CipResult::clear(!any_consider);

    // Validate wrt to mr.review_reasons
    if adverse_media
        && !mr
            .map(|r| r.review_reasons.contains(&ReviewReason::AdverseMediaHit))
            .unwrap_or(false)
    {
        Err(CipError::ExpectedReviewReasonNotFound(
            ReviewReason::AdverseMediaHit,
        ))?
    }
    if (pep | ofac | sanctions)
        && !mr
            .map(|r| r.review_reasons.contains(&ReviewReason::WatchlistHit))
            .unwrap_or(false)
    {
        Err(CipError::ExpectedReviewReasonNotFound(ReviewReason::WatchlistHit))?
    }

    // We don't currently have a concept of paramaterized RiskSignal's or another way to store watchlist hits,
    // so we pull them from the Vres on the fly here

    let ParsedResponse::IncodeWatchlistCheck(wc) = vres
        .iter()
        .find(|v| matches!(v.response.response, ParsedResponse::IncodeWatchlistCheck(_)))
        .ok_or(CipError::WatchlistResultsNotFoundError)?
        .response
        .response
        .clone()
    else {
        Err(CipError::WatchlistResultsNotFoundError)?
    };

    // For now, we just serialize the raw leaked json blob we get from Incode for each watchlist hit
    let leaked_hits = decision::features::incode_watchlist::get_hits(&wc, &obc.enhanced_aml())
        .into_iter()
        .map(|h| h.leak());
    let records_json: Vec<PiiJsonValue> = leaked_hits
        .map(|h| serde_json::to_value(&h).map(PiiJsonValue::new))
        .collect::<Result<Vec<_>, _>>()?;

    Ok(alpaca::Watchlist {
        id: scoped_vault.fp_id.clone(),
        result: overall_result,
        status: alpaca::CipStatus::Complete,
        created_at: decision.created_at,
        politically_exposed_person: pep_result,
        monitored_lists: ofac_result,
        sanction: sanctions_result,
        adverse_media: adverse_media_result,
        records: records_json,
    })
}

fn document_and_photo(
    scoped_vault: ScopedVault,
    _mr: Option<&ManualReview>,
    vendor_results: &[VendorResult],
    decrypted_data: &DecryptUncheckedResult,
    check_started_at: DateTime<Utc>,
    expect_selfie: bool,
) -> ApiResult<(Option<alpaca::DocumentPhotoId>, Option<alpaca::PhotoSelfie>)> {
    let (vendor_map, _) = build_vendor_response_map_from_vendor_results(vendor_results)?;
    let ocr_api = IncodeFetchOCR;
    let scores_api = IncodeFetchScores;
    let ocr_response = vendor_map
        .get(&ocr_api)
        .ok_or(CipError::VerificationResultNotFound(vendor_api_enum_from_struct(
            ocr_api,
        )))?
        .clone();
    let score_response = vendor_map
        .get(&scores_api)
        .ok_or(CipError::VerificationResultNotFound(vendor_api_enum_from_struct(
            scores_api,
        )))?
        .clone();

    let ocr_name = ok_or(ocr_response.name.as_ref(), "missing ocr name".into())?;
    let type_of_id = ocr_response.type_of_id.as_ref().ok_or_else(|| {
        idv::Error::IncodeError(idv::incode::error::Error::OcrError("Missing type_of_id".into()))
    })?;
    let document_type = IdDocKind::try_from(type_of_id)?.try_into()?;
    let dob = ocr_response
        .dob()
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;
    let over_18_check = ocr_response.age().map_err(idv::Error::from)? >= 18;

    // Construct all of the breakdown fields
    // TODO: load these once FRC<>VRes migration is done
    let incode_vault_data = IncodeOcrComparisonDataFields::from_decrypted_values(decrypted_data);
    let frcs = features::incode_docv::footprint_reason_codes(
        ocr_response.clone(),
        score_response,
        incode_vault_data,
        expect_selfie,
    )?;

    let document_result_helper = DocumentCipResultHelper::new(&frcs);
    let (data_comparison_overall, data_comparison_breakdown) = document_result_helper.data_comparison();
    let (image_integrity_overall, image_integrity_breakdown) = document_result_helper.image_integrity();

    let document_photo_id = alpaca::DocumentPhotoId {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: check_started_at,
        first_name: ok_or(
            ocr_name.first_name.as_ref().map(|p| PiiString::from(p.clone())),
            "first name missing".into(),
        )?,
        last_name: ok_or(
            ocr_name.paternal_last_name.as_ref().map(|p| (**p).clone()),
            "last name missing".into(),
        )?,
        gender: ocr_response.gender.as_ref().map(|p| (**p).clone()),
        date_of_birth: dob.into(),
        date_of_expiry: ocr_response
            .expiration_date()
            .map_err(|e| ApiError::from(idv::Error::from(e)))?
            .into(),
        issuing_country: ok_or(
            ocr_response.issuing_country.as_ref().map(|p| (*p).clone().into()),
            "missing issuing_country".into(),
        )?,
        document_numbers: vec![ok_or(
            ocr_response.document_number.as_ref().map(|p| (*p).clone().into()),
            "missing document_number".into(),
        )?],
        document_type,
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

fn ok_or<T>(o: Option<T>, assert_msg: String) -> ApiResult<T> {
    let unwrapped = o.ok_or(ApiErrorKind::AssertionError(assert_msg))?;

    Ok(unwrapped)
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

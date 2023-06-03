use std::collections::HashSet;

use alpaca::{
    AlpacaCip, CipRequest, CipResult, DataComparsionBreakDown, ImageIntegrityBreakdown, VisualAuthenticity,
};
use api_core::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    decision::field_validations::create_field_validation_results,
    errors::{cip_error::CipError, ApiResult},
    types::{JsonApiResponse, ResponseData},
    utils::vault_wrapper::{TenantVw, VaultWrapper},
    ApiError, State,
};
use api_wire_types::{AlpacaCipRequest, AlpacaCipResponse};
use chrono::Utc;
use db::{
    actor::{saturate_actors, SaturatedActor},
    models::{
        annotation::Annotation, insight_event::InsightEvent, manual_review::ManualReview,
        onboarding::Onboarding, onboarding_decision::OnboardingDecision, risk_signal::RiskSignal,
        scoped_vault::ScopedVault, verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    DbError,
};
use idv::ParsedResponse;
use newtypes::{
    format_pii, pii, AlpacaDocumentType, DataIdentifier, DecisionStatus, DocumentKind,
    EncryptedVaultPrivateKey, FootprintReasonCode, FpId, IdentityDataKind, MatchLevel, PiiJsonValue,
    PiiString, SignalScope, TenantId, Vendor, VendorAPI,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Forward CIP information to Alpaca",
    tags(Integrations, Alpaca, Preview)
)]
#[actix::post("/integrations/alpaca_cip")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<AlpacaCipRequest>,
) -> JsonApiResponse<AlpacaCipResponse> {
    let request = request.into_inner();
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    // make the client
    let alpaca_client = alpaca::AlpacaCipClient::new(request.api_key, request.api_secret, &request.hostname)
        .map_err(CipError::from)?;

    // build the cip request
    let cip_request: CipRequest = create_cip_request(
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
async fn create_cip_request(
    state: &State,
    default_approver: PiiString,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> ApiResult<CipRequest> {
    let (uvw, onboarding, decision, scoped_vault, actor, annotations, risk_signals, insight) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let obd = OnboardingDecision::latest_footprint_actor_decision(conn, &fp_id, &tenant_id, is_live)?;

            let (risk_signals, fp_obd, manual_obd) = match obd {
                Some(obd) => {
                    let risk_signals = RiskSignal::list_by_onboarding_decision_id(conn, &obd.id)?;

                    match obd.status {
                        DecisionStatus::Pass => (risk_signals, obd, None),
                        DecisionStatus::Fail | DecisionStatus::StepUp => {
                            // footprint decided as fail, see if a manual decision override exists
                            let (_, obd_manual) = ManualReview::find_completed(conn, &obd.onboarding_id)?
                                .ok_or(CipError::EntityDecisionStatusNotPass)?;

                            if obd_manual.status != DecisionStatus::Pass {
                                return Err(CipError::EntityDecisionManualReviewStatusNotPass)?;
                            }

                            (risk_signals, obd, Some(obd_manual))
                        }
                    }
                }
                None => return Err(CipError::EntityDecisionDoesNotExist)?,
            };

            let (ob, sv, _mr, _) = Onboarding::get(conn, &fp_obd.onboarding_id)?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let insight = InsightEvent::get_by_onboarding_id(conn, &ob.id)?;

            let annotations = Annotation::list(conn, fp_id, tenant_id, is_live, None)?
                .into_iter()
                .map(|(a, _)| a)
                .collect::<Vec<_>>();

            let decision = manual_obd.unwrap_or(fp_obd);

            // find the actor either via Manaul OBD or the FP OBD.
            let actor = saturate_actors(conn, vec![decision.clone()])?
                .pop()
                .map(|(_, actor)| actor);

            Ok((uvw, ob, decision, sv, actor, annotations, risk_signals, insight))
        })
        .await??;

    let user_vault_private_key = uvw.vault.e_private_key.clone();
    // build the cip object components
    let kyc = kyc(
        state,
        &scoped_vault,
        uvw,
        &onboarding,
        decision,
        insight,
        actor,
        default_approver,
        annotations,
    )
    .await?;
    let watchlist = watchlist(&scoped_vault, &onboarding, &risk_signals);
    let identity = identity(&scoped_vault, &onboarding, risk_signals);
    let (document, photo) = document_and_photo(state, scoped_vault.clone(), &user_vault_private_key).await?;

    let cip = CipRequest {
        provider_name: vec![alpaca::Provider::Footprint],
        kyc,
        watchlist,
        identity,
        document,
        photo,
    };

    Ok(cip)
}

/// helper for building the kyc data
#[allow(clippy::too_many_arguments)]
async fn kyc(
    state: &State,
    scoped_vault: &ScopedVault,
    uvw: TenantVw,
    onboarding: &Onboarding,
    decision: OnboardingDecision,
    insight: InsightEvent,
    actor: Option<SaturatedActor>,
    default_approver: PiiString,
    annotations: Vec<Annotation>,
) -> ApiResult<alpaca::Kyc> {
    use DataIdentifier::*;
    use DocumentKind::*;
    use IdentityDataKind::*;

    let mut vd = uvw
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
                Id(Zip),
                Id(Country),
                // todo: make latest
                Document(PassportNumber),
                Document(IdCardNumber),
                Document(DriversLicenseNumber),
            ],
        )
        .await?;

    // find the right approver
    let approved_by = actor
        .and_then(|a| match a {
            db::actor::SaturatedActor::TenantUser(user) => Some(pii!(user.email.to_string())),
            db::actor::SaturatedActor::TenantApiKey(_)
            | db::actor::SaturatedActor::FirmEmployee(_)
            | db::actor::SaturatedActor::Footprint => None,
        })
        .unwrap_or(default_approver);

    // build the approved reason from the latest annotation if it exists
    // TODO: there should be a better way to signfiy a manual review annotation
    let approved_reason = annotations
        .iter()
        .max_by(|a, b| a.timestamp.cmp(&b.timestamp))
        .map(|annotation| format!("{} ({})", annotation.note, annotation.timestamp));

    // find a gov't id number if we have one
    let id_number = vec![PassportNumber, IdCardNumber, DriversLicenseDob]
        .into_iter()
        .flat_map(|id| vd.rm(id).ok())
        .next();

    let kyc = alpaca::Kyc {
        id: scoped_vault.fp_id.clone(),
        applicant_name: format_pii!("{} {}", vd.rm(FirstName)?, vd.rm(LastName)?),
        email_address: vd.rm(Email)?,
        nationality: alpaca::Nationality::American, // TODO: (FP-4186) we need to collect this FP-4186
        date_of_birth: vd.rm(Dob)?,
        address: if let Ok(address2) = vd.rm(AddressLine2) {
            format_pii!("{} {}", vd.rm(AddressLine1)?, address2)
        } else {
            vd.rm(AddressLine1)?
        },
        postal_code: vd.rm(Zip)?,
        country_of_residency: vd.rm(Country)?,
        kyc_completed_at: onboarding.decision_made_at,
        ip_address: pii!(insight.ip_address.unwrap_or("0.0.0.0".into())),
        check_initiated_at: onboarding.authorized_at,
        check_completed_at: onboarding.decision_made_at,
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
    onboarding: &Onboarding,
    risk_signals: Vec<RiskSignal>,
) -> alpaca::Identity {
    let (reason_codes, vendors): (Vec<_>, Vec<_>) = risk_signals
        .into_iter()
        .map(|rs| (rs.reason_code, rs.vendors))
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

    let date_of_birth = field_validations
        .remove(&SignalScope::Dob)
        .map(|fv| fv.match_level)
        == Some(MatchLevel::Exact);

    let tax_id = field_validations
        .remove(&SignalScope::Ssn)
        .map(|fv| fv.match_level)
        == Some(MatchLevel::Exact);

    alpaca::Identity {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: onboarding.decision_made_at.unwrap_or(chrono::Utc::now()),
        matched_address: CipResult::clear(matched_address),
        matched_addresses: vendors.clone(),
        date_of_birth: CipResult::clear(date_of_birth),
        date_of_birth_breakdown: vendors.clone(),
        tax_id: CipResult::clear(tax_id),
        tax_id_breakdown: vendors,
    }
}

/// helper for building the alpaca idenity sub-response
fn watchlist(
    scoped_vault: &ScopedVault,
    onboarding: &Onboarding,
    risk_signals: &[RiskSignal],
) -> alpaca::Watchlist {
    let pep: bool = risk_signals
        .iter()
        .any(|rs| rs.reason_code == FootprintReasonCode::WatchlistHitPep);

    let ofac: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::WatchlistHitOfac);

    let sanctions: bool = risk_signals
        .iter()
        .any(|rs: &RiskSignal| rs.reason_code == FootprintReasonCode::WatchlistHitNonSdn);

    alpaca::Watchlist {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: onboarding.decision_made_at.unwrap_or(chrono::Utc::now()),
        politically_exposed_person: CipResult::clear(pep),
        monitored_lists: CipResult::clear(ofac),
        sanction: CipResult::clear(sanctions),
        // TODO: FP-4191 (add insertion point for doing these checks)
        adverse_media: CipResult::Clear,
        // TODO: FP-4192 (pull vres and parse them)
        records: vec![],
    }
}

async fn document_and_photo(
    state: &State,
    scoped_vault: ScopedVault,
    user_vault_private_key: &EncryptedVaultPrivateKey,
) -> ApiResult<(Option<alpaca::DocumentPhotoId>, Option<alpaca::PhotoSelfie>)> {
    let su_id = scoped_vault.id.clone();
    let incode_apis = newtypes::vendor_apis_from_vendor(Vendor::Incode);
    let incode_results: Vec<(VerificationRequest, Option<VerificationResult>)> = state
        .db_pool
        .db_query(
            move |conn| -> Result<Vec<(VerificationRequest, Option<VerificationResult>)>, DbError> {
                VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, su_id)
            },
        )
        .await??
        .into_iter()
        .filter(|(req, _)| incode_apis.contains(&req.vendor_api))
        .collect();

    if incode_results.is_empty() {
        // nothing to do here if we haven't collected a doc
        return Ok((None, None));
    }

    // pick a reasonable timestamp
    let score_request_created_at = incode_results
        .iter()
        .find(|(r, _)| r.vendor_api == VendorAPI::IncodeFetchScores)
        .map(|(r, _)| r._created_at)
        .unwrap_or(Utc::now());

    let incode_results =
        crate::decision::vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
            incode_results,
            &state.enclave_client,
            user_vault_private_key,
        )
        .await?;

    let ParsedResponse::IncodeFetchOCR(ocr) = incode_results
        .iter()
        .find(|pr| matches!(pr.response.response, ParsedResponse::IncodeFetchOCR(_)))
        .ok_or(DbError::ObjectNotFound)?
        .response
        .response
        .to_owned() else {
            return Err(ApiError::AssertionError("ocr not found".into()))
        };

    let ocr_name = ok_or(ocr.name.as_ref(), "missing ocr name".into())?;
    let document_type: AlpacaDocumentType = ocr
        .document_kind()
        .map(crate::decision::vendor::incode::id_doc_kind_from_incode_document_type)
        .map_err(|e| ApiError::from(idv::Error::from(e)))??
        .into();
    let dob = ocr.dob().map_err(|e| ApiError::from(idv::Error::from(e)))?;

    let document_photo_id = alpaca::DocumentPhotoId {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: score_request_created_at,
        first_name: ok_or(ocr_name.first_name.clone(), "first name missing".into())?,
        last_name: ok_or(ocr_name.paternal_last_name.clone(), "last name missing".into())?,
        gender: ok_or(ocr.gender.clone(), "missing gender".into())?,
        date_of_birth: dob,
        date_of_expiry: ocr
            .expiration_date()
            .map_err(|e| ApiError::from(idv::Error::from(e)))?,
        issuing_country: ok_or(ocr.issuing_country.clone(), "missing issuing_country".into())?,
        document_numbers: vec![ok_or(
            ocr.document_number.clone(),
            "missing document_number".into(),
        )?],
        document_type,
        // TODO: these should all be computed from actual response
        age_validation: CipResult::Clear,
        data_comparison: CipResult::Clear,
        data_comparison_breakdown: DataComparsionBreakDown {
            first_name: CipResult::Clear,
            last_name: CipResult::Clear,
            date_of_birth: CipResult::Clear,
            address: Some(CipResult::Clear),
        },
        image_integrity: CipResult::Clear,
        image_integrity_breakdown: ImageIntegrityBreakdown {
            image_quality: CipResult::Clear,
            supported_document: CipResult::Clear,
            colour_picture: None,
            conclusive_document_quality: None,
        },
        visual_authenticity: VisualAuthenticity {
            digital_tampering: CipResult::Clear,
            face_detection: CipResult::Clear,
            fonts: CipResult::Clear,
            picture_face_integrity: CipResult::Clear,
            security_features: CipResult::Clear,
            template: CipResult::Clear,
        },
    };

    let photo_selfie = alpaca::PhotoSelfie {
        id: scoped_vault.fp_id.clone(),
        result: CipResult::Clear,
        status: alpaca::CipStatus::Complete,
        created_at: score_request_created_at,
        face_comparison: CipResult::Clear,
        image_integrity: CipResult::Clear,
        visual_authenticity: CipResult::Clear,
    };

    Ok((Some(document_photo_id), Some(photo_selfie)))
}

fn ok_or<T>(o: Option<T>, assert_msg: String) -> ApiResult<T> {
    let unwrapped = o.ok_or(ApiError::AssertionError(assert_msg))?;

    Ok(unwrapped)
}

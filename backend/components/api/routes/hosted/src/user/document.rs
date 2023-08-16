use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::user::documents::upload::{handle_incode_request, save_vres_for_fixture_risk_signals};
use crate::utils::large_json::LargeJson;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{decision, State};
use api_core::auth::user::UserObAuthContext;
use api_core::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use api_core::decision::vendor::incode::states::{save_incode_fixtures, Complete};
use api_core::types::JsonApiResponse;
use api_core::utils::file_upload::FileUpload;
use api_core::utils::vault_wrapper::{seal_file_and_upload_to_s3, Person, VwArgs};
use api_wire_types::document_request::DocumentRequest;
use api_wire_types::DocumentResponse;
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::DocumentRequest as DbDocumentRequest;
use db::models::document_upload::DocumentUpload;
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use db::models::user_consent::UserConsent;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::{DataIdentifier, DecisionIntentKind, WorkflowGuard};
use newtypes::{DocumentKind, DocumentSide, IdentityDocumentStatus};
use paperclip::actix::{self, api_v2_operation, web};

/// Backend APIs for working with identity documents.
/// See API specs here: https://www.notion.so/onefootprint/Bifrost-v2-APIs-d0ec80951ff94753a7ddd8ca62e3b734
/// TODO: rename to /hosted/user/identity_document or find a way to merge in with new generic doc upload endpoint
/// TODO deprecate this
#[api_v2_operation(description = "POSTs an Identity document to footprint servers", tags(Hosted))]
#[actix::post("/hosted/user/document")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    request: LargeJson<DocumentRequest, 15_728_640>,
) -> JsonApiResponse<DocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let wf = user_auth.workflow()?;
    let request = request.0;

    let su_id = user_auth.scoped_user.id.clone();
    let wf_id = wf.id.clone();
    let (uvw, doc_request, user_consent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // If there's no pending doc requests, nothing to do here
            let doc_request =
                DbDocumentRequest::get(conn, &wf_id)?.ok_or(OnboardingError::IdentityDocumentNotPending)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let user_consent = UserConsent::latest(conn, &su_id)?;
            Ok((uvw, doc_request, user_consent))
        })
        .await??;
    let vault = uvw.vault.clone();

    if request.selfie_image.is_some() && !doc_request.should_collect_selfie {
        return Err(OnboardingError::NotExpectingSelfie.into());
    }

    if user_consent.is_none() {
        return Err(OnboardingError::UserConsentNotFound.into());
    }

    if doc_request.only_us() && request.country_code != "US" {
        return Err(OnboardingError::UnsupportedNonUSDocumentCountry.into());
    }
    if let Some(doc_types) = doc_request.global_doc_types_accepted.clone() {
        if !doc_types.contains(&request.document_type.into()) {
            return Err(OnboardingError::UnsupportedDocumentType(Csv::from(doc_types)).into());
        }
    }

    // Check we're in sandbox
    if vault.is_live && request.fixture_result.is_some() {
        return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
    }

    let (side, image) = match (request.front_image, request.back_image, request.selfie_image) {
        (Some(i), None, None) => (DocumentSide::Front, i),
        (None, Some(i), None) => (DocumentSide::Back, i),
        (None, None, Some(i)) => (DocumentSide::Selfie, i),
        _ => return Err(OnboardingError::OnlyOneImageAllowed.into()),
    };

    let mime_type = "image/png";
    let di = DataIdentifier::from(DocumentKind::LatestUpload(request.document_type.into(), side));
    let su_id = user_auth.scoped_user.id.clone();
    let image_bytes = image.try_decode_base64().map_err(crypto::Error::from)?;
    let file = FileUpload::new_simple(image_bytes, format!("{}", di), mime_type);
    let (e_data_key, s3_url) =
        seal_file_and_upload_to_s3(&state, &file, di.clone(), user_auth.user(), &su_id).await?;

    // Check if we should be initiating requests (e.g. check if we are testing)
    let (should_initiate_reqs, ocr_fixture) = decision::utils::should_initiate_requests_for_document(
        &state,
        &uvw,
        &user_auth.tenant()?.id,
        request.fixture_result,
    )
    .await?;
    let fixture = request.fixture_result;

    // write a identity_document
    let su_id = user_auth.scoped_user.id.clone();
    let vault2 = vault.clone();
    let wf_id = wf.id.clone();
    let (missing_sides, created_reqs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;
            // Get or create the identity document
            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id.clone(),
                document_type: request.document_type.into(),
                country_code: request.country_code.clone(),
                fixture_result: fixture,
                skip_selfie: None,
                device_type: None,
            };
            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            if id_doc.status != IdentityDocumentStatus::Pending {
                return Err(OnboardingError::IdentityDocumentNotPending.into());
            }
            // Vault the images under latest uploads
            let (d, seqno) =
                uvw.put_document_unsafe(conn, di, file.mime_type, file.filename, e_data_key, s3_url)?;
            DocumentUpload::create(conn, id_doc.id.clone(), side, d.s3_url, d.e_data_key, seqno)?;
            let existing_sides = id_doc
                .images(conn, true)?
                .into_iter()
                .map(|u| u.side)
                .collect_vec();
            let required_sides = id_doc
                .document_type
                .sides()
                .into_iter()
                .chain(doc_request.should_collect_selfie.then_some(DocumentSide::Selfie))
                .collect_vec();
            let missing_sides = required_sides
                .into_iter()
                .filter(|s| !existing_sides.contains(s))
                .collect_vec();

            // Now that the document is created, either initiate IDV reqs or create fixture data
            let result = if should_initiate_reqs {
                // Initiate IDV reqs once and only once for this id_doc
                let decision_intent = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &su_id,
                    &wf_id,
                    DecisionIntentKind::DocScan,
                )?;
                Some((decision_intent, doc_request, id_doc.id))
            } else {
                if missing_sides.is_empty() {
                    let fixture = id_doc.fixture_result;
                    // Create fixture data once all of the sides are uploaded
                    let ocr = decision::utils::fixture_ocr_response_for_incode(ocr_fixture.clone())?;
                    let doc_type = request.document_type.into();

                    // We need to synthetically set up a vres in order to not get db constraint errors when saving risk signals
                    let fake_score_response =
                        idv::incode::doc::response::FetchScoresResponse::fixture_response(fixture)
                            .map_err(idv::Error::from)?;
                    let vres = save_vres_for_fixture_risk_signals(
                        conn,
                        &su_id,
                        &vault2,
                        &wf_id,
                        serde_json::to_value(fake_score_response.clone())?,
                    )?;

                    // Enter the complete state
                    Complete::enter(
                        conn,
                        &vault2,
                        &su_id,
                        &id_doc.id,
                        doc_type,
                        ocr,
                        fake_score_response,
                        ocr_fixture.unwrap_or(IncodeOcrComparisonDataFields::default()),
                        doc_request.should_collect_selfie,
                        vres.id.clone(),
                        vres.id,
                    )?;
                }
                None
            };

            Ok((missing_sides, result))
        })
        .await?;

    let response = if let Some((di, doc_request, id_doc_id)) = created_reqs {
        // Not sandbox - make our request to vendors!
        let t_id = user_auth.scoped_user.tenant_id.clone();
        let should_collect_selfie = doc_request.should_collect_selfie;
        handle_incode_request(
            &state,
            id_doc_id,
            t_id,
            di.id,
            vault,
            doc_request,
            fixture.is_some(),
            should_collect_selfie,
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

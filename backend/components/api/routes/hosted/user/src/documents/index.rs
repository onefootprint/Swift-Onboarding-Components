use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::{VaultWrapper, Person, VwArgs};
use api_wire_types::{CreateIdentityDocumentRequest, CreateIdentityDocumentResponse};
use db::models::document_request::DocumentRequest as DbDocumentRequest;
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use feature_flag::BoolFlag;
use newtypes::{WorkflowGuard, IdentityDocumentFixtureResult, IdDocKind, Iso3166TwoDigitCountryCode, DocumentScanDeviceType, IdentityDocumentId, WorkflowId, DocKind};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Create a new identity document for this user's outstanding document request",
    tags(Document, Hosted)
)]
#[actix::post("/hosted/user/documents")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: web::Json<CreateIdentityDocumentRequest>,
) -> JsonApiResponse<CreateIdentityDocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let CreateIdentityDocumentRequest {
        document_type,
        country_code,
        fixture_result,
        skip_selfie,
        device_type,
    } = request.into_inner();
    let doc_kind: DocKind = document_type.into();
    let su_id = user_auth.scoped_user.id.clone();
    let su_id2 = su_id.clone();
    let tenant_id = user_auth.tenant().id.clone();
    let wf_id = user_auth.workflow().id.clone();
    let ff_client = state.feature_flag_client.clone();

    // Handle proof of SSN, which doesn't involve a lot of other checks (at this time)
    if doc_kind == DocKind::ProofOfSsn {
        let id_doc_id = handle_proof_of_ssn(&state, wf_id, document_type, country_code, device_type).await?;
        return ResponseData::ok(CreateIdentityDocumentResponse { id: id_doc_id}).json()
    }

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw: VaultWrapper<_> = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id2))?;
            Ok(uvw)
        })
        .await??;

    let residential_country = uvw.get_decrypted_country(&state).await?;

    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no doc requests, nothing to do here
            let doc_request =
                DbDocumentRequest::get_identity(conn, &wf_id)?.ok_or(OnboardingError::NoDocumentRequestFound)?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;         
            decision::vendor::incode::validate_doc_type_is_allowed(
                &obc,
                document_type,
                residential_country,
                country_code,
            )?;

            if let Some(fixture_result) = fixture_result {
                // Check we're in sandbox
                let vault = Vault::get(conn, &su_id)?;
                if vault.is_live {
                    return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
                }

                if matches!(fixture_result, IdentityDocumentFixtureResult::Real) && 
                    !ff_client.flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id)) {
                    return Err(OnboardingError::RealDocumentFixtureNotAllowed.into());
                }
            }


            // we don't want any tenant to be able to skip selfie by default, eventually this will
            // be in the OBC
            let can_tenant_skip_selfie = ff_client
                .flag(BoolFlag::CanSkipSelfie(&tenant_id));

            
            let should_skip_selfie = if skip_selfie == Some(true) && doc_request.should_collect_selfie {
                if can_tenant_skip_selfie {
                    tracing::info!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, requires_selfie=%doc_request.should_collect_selfie, "User skipping selfie");
                    true
                } else {
                    tracing::warn!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, "User tried skipping selfie, but tenant is not allowed");
                    false
                }

            } else {
                false
            };
            
            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id,
                document_type,
                country_code,
                fixture_result,
                skip_selfie: Some(should_skip_selfie),
                device_type
            };

            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            Ok(id_doc)
        })
        .await?;
    ResponseData::ok(CreateIdentityDocumentResponse { id: id_doc.id }).json()
}


async fn handle_proof_of_ssn(state: &State, workflow_id: WorkflowId, document_type: IdDocKind, country_code: Iso3166TwoDigitCountryCode, device_type: Option<DocumentScanDeviceType>) -> ApiResult<IdentityDocumentId> {
    state
    .db_pool
    .db_transaction(move |conn| -> ApiResult<_> {
        // If there's no doc requests for proof of ssn, nothing to do here
        let doc_request =
            DbDocumentRequest::get_proof_of_ssn(conn, &workflow_id)?.ok_or(OnboardingError::NoDocumentRequestFound)?;


            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id,
                document_type,
                country_code,
                fixture_result: None,
                skip_selfie: None,
                device_type
            };
            
            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            Ok(id_doc.id)
        }).await

}
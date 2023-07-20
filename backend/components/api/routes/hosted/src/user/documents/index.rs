use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::types::JsonApiResponse;
use api_wire_types::{CreateIdentityDocumentRequest, CreateIdentityDocumentResponse};
use db::models::document_request::{DocRequestIdentifier, DocumentRequest as DbDocumentRequest};
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use newtypes::output::Csv;
use newtypes::WorkflowGuard;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Create a new identity document for this user's outstanding document request",
    tags(Hosted)
)]
#[actix::post("/hosted/user/documents")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    request: web::Json<CreateIdentityDocumentRequest>,
) -> JsonApiResponse<CreateIdentityDocumentResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddDocument)?;
    let CreateIdentityDocumentRequest {
        document_type,
        country_code,
    } = request.into_inner();

    let su_id = user_auth.scoped_user.id.clone();
    let wf_id = user_auth.workflow().map(|wf| wf.id.clone());
    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no doc requests, nothing to do here
            let identifier = DocRequestIdentifier {
                sv_id: &su_id,
                wf_id: wf_id.as_ref(),
            };
            let doc_request =
                DbDocumentRequest::get(conn, identifier)?.ok_or(OnboardingError::NoDocumentRequestFound)?;
            // Validate that the type of document uploaded matches what's required by the doc request
            if doc_request.only_us && country_code != "US" {
                return Err(OnboardingError::UnsupportedNonUSDocumentCountry.into());
            }
            if let Some(doc_types) = doc_request.doc_type_restriction.clone() {
                if !doc_types.contains(&document_type) {
                    return Err(OnboardingError::UnsupportedDocumentType(Csv::from(doc_types)).into());
                }
            }
            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id,
                document_type: document_type.into(),
                country_code,
            };
            let id_doc = IdentityDocument::create(conn, args)?;
            Ok(id_doc)
        })
        .await?;
    ResponseData::ok(CreateIdentityDocumentResponse { id: id_doc.id }).json()
}

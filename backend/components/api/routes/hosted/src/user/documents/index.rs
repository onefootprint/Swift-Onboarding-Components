use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::{VaultWrapper, Person, VwArgs};
use api_wire_types::{CreateIdentityDocumentRequest, CreateIdentityDocumentResponse};
use db::models::document_request::DocumentRequest as DbDocumentRequest;
use db::models::identity_document::{IdentityDocument, NewIdentityDocumentArgs};
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use feature_flag::BoolFlag;
use newtypes::output::Csv;
use newtypes::{WorkflowGuard, Iso3166TwoDigitCountryCode};
use paperclip::actix::{self, api_v2_operation, web};
use newtypes::IdentityDataKind as IDK;

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
        fixture_result,
        skip_selfie,
        device_type,
    } = request.into_inner();

    let su_id = user_auth.scoped_user.id.clone();
    let su_id2 = su_id.clone();
    let tenant_id = user_auth.tenant()?.id.clone();
    let wf_id = user_auth.workflow()?.id.clone();
    let ff_client = state.feature_flag_client.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw: VaultWrapper<_> = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id2))?;
            Ok(uvw)
        })
        .await??;
    let decrypted_values = uvw.decrypt_unchecked(&state.enclave_client, &[IDK::Country.into()]).await?;
    let residential_country = decrypted_values.get(&IDK::Country.into()).and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok());

    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no doc requests, nothing to do here
            let doc_request =
                DbDocumentRequest::get(conn, &wf_id)?.ok_or(OnboardingError::NoDocumentRequestFound)?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            
            let document_to_country_mapping = obc.supported_country_mapping_for_document(residential_country);
            let Some(allowed_doc_types) = document_to_country_mapping.get(&country_code) else {
                // this country is not in our available countries
                return Err(OnboardingError::UnsupportedDocumentCountryForDocumentType(Csv::from(document_to_country_mapping.keys().cloned().collect::<Vec<_>>())).into())
            };
            
            // Validate that we support this doc type for the given country
            if !allowed_doc_types.contains(&document_type) {
                return Err(OnboardingError::UnsupportedDocumentType(Csv::from(allowed_doc_types.clone())).into());
            }
            
            let vault = Vault::get(conn, &su_id)?;
            // Check we're in sandbox
            if vault.is_live && fixture_result.is_some() {
                return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
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

            let id_doc = IdentityDocument::create(conn, args)?;
            Ok(id_doc)
        })
        .await?;
    ResponseData::ok(CreateIdentityDocumentResponse { id: id_doc.id }).json()
}

use crate::{
    auth::session::AuthSessionData,
    auth::user::{AuthedOnboardingInfo, ValidateUserToken},
    utils::{
        session::AuthSession,
        vault_wrapper::{Business, Person, VaultWrapper, VwArgs},
    },
};
use api_core::{
    auth::user::CheckedUserAuthContext,
    errors::{business::BusinessError, ApiResult},
    State,
};
use api_wire_types::hosted::onboarding_requirement::{AuthorizeFields, OnboardingRequirement};
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, onboarding::Onboarding,
        user_consent::UserConsent,
    },
    DbError, PgConn,
};
use itertools::Itertools;
use newtypes::{
    DataIdentifierDiscriminant, Declaration, DocumentKind, InvestorProfileKind as IPK, OnboardingId,
    PiiString, ScopedVaultId, SessionAuthToken, VaultId,
};
use paperclip::actix::web;

pub mod authorize;
pub mod d2p;
pub mod fingerprint_visit;
pub mod index;
pub mod kyc;
pub mod pat;
pub mod skip_liveness;
pub mod socure_device;
pub mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(kyc::get)
        .service(skip_liveness::post)
        .service(fingerprint_visit::post)
        .service(pat::get)
        .service(socure_device::post);

    d2p::routes(config);
}

fn create_onboarding_validation_token(
    conn: &mut PgConn,
    session_sealing_key: &ScopedSealingKey,
    ob_id: OnboardingId,
) -> Result<SessionAuthToken, DbError> {
    let validation_token = AuthSession::create_sync(
        conn,
        session_sealing_key,
        AuthSessionData::ValidateUserToken(ValidateUserToken { ob_id }),
        Duration::minutes(15),
    )?;
    Ok(validation_token)
}

#[tracing::instrument(skip_all)]
pub async fn get_requirements(
    state: &State,
    user_auth: CheckedUserAuthContext,
) -> ApiResult<(
    Vec<OnboardingRequirement>,
    AuthedOnboardingInfo,
    CheckedUserAuthContext,
)> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let (uvw, ob_info, user_auth) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&ob_info.scoped_user.id))?;
            Ok((uvw, ob_info, user_auth))
        })
        .await??;
    let declarations = uvw
        .decrypt_unchecked_single(&state.enclave_client, IPK::Declarations.into())
        .await?;

    let (requirements, ob_info, user_auth) = state
        .db_pool
        .db_query(|conn| -> ApiResult<_> {
            let scoped_business_id = user_auth.scoped_business_id();
            let requirements = get_requirements_inner(conn, uvw, &ob_info, scoped_business_id, declarations)?;
            Ok((requirements, ob_info, user_auth))
        })
        .await??;
    Ok((requirements, ob_info, user_auth))
}

#[tracing::instrument(skip_all)]
fn get_requirements_inner(
    conn: &mut PgConn,
    uvw: VaultWrapper<Person>,
    ob_info: &AuthedOnboardingInfo,
    scoped_business_id: Option<ScopedVaultId>,
    declarations: Option<PiiString>,
) -> ApiResult<Vec<OnboardingRequirement>> {
    let scoped_user_id = &ob_info.scoped_user.id;

    let missing_id_fields = uvw.missing_fields(&ob_info.ob_config, DataIdentifierDiscriminant::Id);
    let missing_ip_fields =
        uvw.missing_fields(&ob_info.ob_config, DataIdentifierDiscriminant::InvestorProfile);
    let missing_finra_compliance_doc = if let Some(declarations) = declarations {
        let declarations: Vec<Declaration> = declarations.deserialize()?;
        // The finra compliance doc is missing if any of the declarations require a doc and we don't
        // yet have one on file
        declarations.iter().any(|d| d.requires_finra_compliance_doc())
            && !uvw.has_field(DocumentKind::FinraComplianceLetter)
    } else {
        false
    };

    // Fetch missing business fields
    let missing_business_fields = if ob_info.ob_config.must_collect_business() {
        let scoped_business_id = scoped_business_id.ok_or(BusinessError::NotAllowedWithoutBusiness)?;
        let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&scoped_business_id))?;
        bvw.missing_fields(&ob_info.ob_config, DataIdentifierDiscriminant::Business)
    } else {
        vec![]
    };

    // Document requirements are determined by the presence of DocumentRequest database objects.
    // In various places in the codebase, we will determine if a DocumentRequest should be created
    //    -For example, when IDology cannot verify a user using just inputted data, they may ask for a document. In that instance
    //      we will create a DocumentRequest row.
    let user_consent = UserConsent::latest_for_onboarding(conn, &ob_info.onboarding.id)?;

    let doc_request_result = DocumentRequest::get_active(conn, scoped_user_id);
    // Handle not finding an active request differently than other db errors
    let document_request_requirements = match doc_request_result {
        Err(e) => {
            if e.is_not_found() {
                Ok(vec![])
            } else {
                Err(e)
            }
        }
        Ok(doc_request) => Ok(vec![OnboardingRequirement::CollectDocument {
            document_request_id: doc_request.id,
            should_collect_selfie: doc_request.should_collect_selfie,
            should_collect_consent: doc_request.should_collect_selfie && user_consent.is_none(),
        }]),
    }?;

    // TODO: force liveness checks to be re-done and not shared across tenants
    // RELATED: FP-1802 and FP-1800
    let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.vault.id)?;

    let requirements = vec![
        (!missing_id_fields.is_empty()).then_some(OnboardingRequirement::CollectData {
            missing_attributes: missing_id_fields,
        }),
        (!missing_ip_fields.is_empty() || missing_finra_compliance_doc).then_some(
            OnboardingRequirement::CollectInvestorProfile {
                missing_attributes: missing_ip_fields,
                missing_document: missing_finra_compliance_doc,
            },
        ),
        (!missing_business_fields.is_empty()).then_some(OnboardingRequirement::CollectBusinessData {
            missing_attributes: missing_business_fields,
        }),
        // check if we have liveness events
        liveness_events
            .is_empty()
            .then_some(OnboardingRequirement::Liveness),
    ]
    .into_iter()
    .flatten()
    .chain(document_request_requirements)
    .collect();

    tracing::info!(onboarding_id=%ob_info.onboarding.id, requirements=%format!("{:?}", requirements), scoped_user_id=%scoped_user_id, "get_requirements result");

    Ok(requirements)
}

/// This function gets all the fields the User needs to authorize the Tenant having access to.
/// Since we don't know the type of the document until the User selects it and we process it, we
/// need to check the IdentityDocument table for documents gathered during the onboarding
pub fn get_fields_to_authorize(
    conn: &mut PgConn,
    user_vault_id: &VaultId,
    ob_config: &ObConfiguration,
) -> ApiResult<AuthorizeFields> {
    let (onboarding, _, _, _) = Onboarding::get(conn, (user_vault_id, &ob_config.id))?;

    let mut identity_document_types: Vec<_> = vec![];
    let mut selfie_collected = false;
    if ob_config.can_access_document() {
        // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
        let identity_documents =
            IdentityDocument::get_for_scoped_vault_id(conn, &onboarding.scoped_vault_id)?;

        identity_document_types = identity_documents
            .iter()
            .map(|id| id.document_type)
            .unique()
            .collect();

        if ob_config.can_access_selfie() {
            selfie_collected = identity_documents
                .iter()
                .any(|doc| doc.selfie_lifetime_id.is_some());
        }
    }

    let res = AuthorizeFields {
        collected_data: ob_config.can_access_data.clone(),
        identity_document_types,
        selfie_collected,
    };

    Ok(res)
}

use crate::{
    auth::session::AuthSessionData,
    auth::user::ValidateUserToken,
    utils::{
        session::AuthSession,
        vault_wrapper::{Business, Person, VaultWrapper, VwArgs},
    },
};
use api_core::{
    auth::user::{CheckedUserObAuthContext, UserObSession},
    errors::{business::BusinessError, ApiResult},
    State,
};
use api_wire_types::hosted::onboarding_requirement::{AuthorizeFields, OnboardingRequirement};
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, user_consent::UserConsent,
    },
    DbError, PgConn,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use itertools::Itertools;
use newtypes::{
    DataIdentifierDiscriminant, Declaration, DocumentKind, InvestorProfileKind as IPK, OnboardingId,
    PiiString, ScopedVaultId, SessionAuthToken,
};
use paperclip::actix::web;

mod authorize;
mod d2p;
mod fingerprint_visit;
mod index;
mod pat;
mod skip_liveness;
mod socure_device;
mod status;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(skip_liveness::post)
        .service(fingerprint_visit::post)
        .service(pat::get)
        .service(socure_device::post)
        .service(validate::post);

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
    user_auth: CheckedUserObAuthContext,
) -> ApiResult<(Vec<OnboardingRequirement>, CheckedUserObAuthContext)> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let su_id = user_auth.scoped_user.id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id))?;
            Ok(uvw)
        })
        .await??;
    let declarations = uvw
        .decrypt_unchecked_single(&state.enclave_client, IPK::Declarations.into())
        .await?;

    let tenant_id = &user_auth.tenant()?.id;
    let is_demo_tenant = state.feature_flag_client.flag(BoolFlag::IsDemoTenant(tenant_id));
    let (requirements, user_auth) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sb_id = user_auth.scoped_business_id();
            let requirements =
                get_requirements_inner(conn, uvw, &user_auth, sb_id, declarations, is_demo_tenant)?;
            Ok((requirements, user_auth))
        })
        .await??;
    Ok((requirements, user_auth))
}

#[tracing::instrument(skip_all)]
fn get_requirements_inner(
    conn: &mut PgConn,
    uvw: VaultWrapper<Person>,
    ob_info: &UserObSession,
    scoped_business_id: Option<ScopedVaultId>,
    declarations: Option<PiiString>,
    is_demo_tenant: bool,
) -> ApiResult<Vec<OnboardingRequirement>> {
    let id_req = {
        let missing_attributes = uvw.missing_fields(ob_info.ob_config()?, DataIdentifierDiscriminant::Id);
        (!missing_attributes.is_empty()).then_some(OnboardingRequirement::CollectData { missing_attributes })
    };
    let ip_req = {
        let missing_attributes =
            uvw.missing_fields(ob_info.ob_config()?, DataIdentifierDiscriminant::InvestorProfile);
        let missing_document = if let Some(declarations) = declarations {
            let declarations: Vec<Declaration> = declarations.deserialize()?;
            // The finra compliance doc is missing if any of the declarations require a doc and we don't
            // yet have one on file
            declarations.iter().any(|d| d.requires_finra_compliance_doc())
                && !uvw.has_field(DocumentKind::FinraComplianceLetter)
        } else {
            false
        };
        (!missing_attributes.is_empty() || missing_document).then_some(
            OnboardingRequirement::CollectInvestorProfile {
                missing_attributes,
                missing_document,
            },
        )
    };
    let biz_req = {
        // Fetch missing business fields
        let missing_attributes = if ob_info.ob_config()?.must_collect_business() {
            let scoped_business_id = scoped_business_id.ok_or(BusinessError::NotAllowedWithoutBusiness)?;
            let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&scoped_business_id))?;
            bvw.missing_fields(ob_info.ob_config()?, DataIdentifierDiscriminant::Business)
        } else {
            vec![]
        };
        (!missing_attributes.is_empty())
            .then_some(OnboardingRequirement::CollectBusinessData { missing_attributes })
    };
    let liveness_req = {
        // TODO: force liveness checks to be re-done and not shared across tenants
        // RELATED: FP-1802 and FP-1800
        let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.vault.id)?;
        liveness_events
            .is_empty()
            .then_some(OnboardingRequirement::Liveness)
    };
    let doc_req = {
        // Document requirements are determined by the presence of DocumentRequest database objects.
        // In various places in the codebase, we will determine if a DocumentRequest should be created
        //    -For example, when IDology cannot verify a user using just inputted data, they may ask for a document. In that instance
        //      we will create a DocumentRequest row.
        let user_consent = UserConsent::latest_for_onboarding(conn, &ob_info.onboarding()?.id)?;
        let doc_request = DocumentRequest::get_active(conn, &ob_info.scoped_user.id)?;
        doc_request.map(|dr| OnboardingRequirement::CollectDocument {
            document_request_id: dr.id,
            should_collect_selfie: dr.should_collect_selfie,
            should_collect_consent: dr.should_collect_selfie && user_consent.is_none(),
        })
    };
    let authorize_req = {
        if ob_info.onboarding()?.authorized_at.is_none() || is_demo_tenant {
            // TODO we have some weird logic here to ALWAYS serialize an authorize requirement for
            // the demo tenant.
            // In our demos today, we show one-click by onboarding onto the exact same ob config,
            // where the onboarding is already authorized. In the future, a longer-term solution
            // is to just use two separate ob configs to demo
            let fields_to_authorize = get_fields_to_authorize(conn, ob_info)?;
            Some(OnboardingRequirement::Authorize { fields_to_authorize })
        } else {
            None
        }
    };

    let requirements = vec![id_req, ip_req, biz_req, liveness_req, doc_req, authorize_req]
        .into_iter()
        .flatten()
        .collect();

    tracing::info!(onboarding_id=%ob_info.onboarding()?.id, requirements=%format!("{:?}", requirements), scoped_user_id=%ob_info.scoped_user.id, "get_requirements result");

    Ok(requirements)
}

/// This function gets all the fields the User needs to authorize the Tenant having access to.
/// Since we don't know the type of the document until the User selects it and we process it, we
/// need to check the IdentityDocument table for documents gathered during the onboarding
pub fn get_fields_to_authorize(conn: &mut PgConn, ob_info: &UserObSession) -> ApiResult<AuthorizeFields> {
    let ob_config = ob_info.ob_config()?;
    let (identity_document_types, selfie_collected) = if ob_config.can_access_document() {
        // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
        let id_docs = IdentityDocument::get_for_scoped_vault_id(conn, &ob_info.scoped_user.id)?;
        let identity_document_types = id_docs.iter().map(|id| id.document_type).unique().collect();
        let selfie_collected =
            ob_config.can_access_selfie() && id_docs.iter().any(|d| d.selfie_lifetime_id.is_some());
        (identity_document_types, selfie_collected)
    } else {
        (vec![], false)
    };

    let res = AuthorizeFields {
        collected_data: ob_config.can_access_data.clone(),
        identity_document_types,
        selfie_collected,
    };

    Ok(res)
}

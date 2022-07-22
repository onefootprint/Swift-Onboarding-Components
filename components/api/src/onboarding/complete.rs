use crate::auth::get_scoped_user;
use crate::auth::key_context::ob_public_key::PublicTenantAuthContext;
use crate::auth::session_context::{HasUserVaultId, SessionContext};
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::session_data::validate_user::ValidateUserToken;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use chrono::Duration;
use db::models::audit_trails::AuditTrail;
use db::models::insight_event::CreateInsightEvent;
use db::models::onboardings::Onboarding;
use db::models::webauthn_credential::WebauthnCredential;
use db::DbError;
use itertools::Itertools;
use newtypes::{
    AuditTrailEvent, DataKind, FootprintUserId, SessionAuthToken, Status, Vendor, VerificationInfo,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Unique footprint user id
    /// TODO: (FP-486) remove this for better safety rails of api usage
    footprint_user_id: FootprintUserId,
    /// Footprint validation token
    validation_token: SessionAuthToken,
    /// Boolean true / false if webauthn set
    missing_webauthn_credentials: bool,
}

#[api_v2_operation(tags(Onboarding))]
#[post("/complete")]
/// Finish onboarding the user. Returns the footprint_user_id for login. If any necessary
/// attributes were not set, returns an error with the list of missing fields.
fn handler(
    user_auth: SessionContext<OnboardingSession>,
    tenant_auth: PublicTenantAuthContext,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let scoped_user = get_scoped_user(&state.db_pool, &user_auth, &tenant_auth).await?;
    let uv = user_auth.user_vault(&state.db_pool).await?;

    let uv_id = uv.id.clone();

    let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
    let missing_fields = uvw.missing_fields(&tenant_auth.ob_config);
    if !missing_fields.is_empty() {
        return Err(OnboardingError::UserMissingRequiredFields(missing_fields.into_iter().join(", ")).into());
    }

    // TODO kick off user verification with data vendors
    let footprint_user_id = scoped_user.fp_user_id.clone();
    let tenant_id = tenant_auth.tenant.id.clone();
    let session_sealing_key = state.session_sealing_key.clone();
    let (validation_token, webauthn_creds) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let insight_event = CreateInsightEvent::from(insights);
            let ob = Onboarding::get_or_create(
                conn,
                scoped_user.id.clone(),
                tenant_auth.ob_config.id.clone(),
                insight_event,
            )?;
            if ob.status != Status::Verified {
                // Just create some fixture events for now
                // Don't make duplicate fixture events if the user onboards multiple times since it
                // isn't very self-explanatory for the demo
                let events = vec![
                    VerificationInfo {
                        data_kinds: vec![DataKind::FirstName, DataKind::LastName, DataKind::Dob],
                        vendor: Vendor::Experian,
                    },
                    VerificationInfo {
                        data_kinds: vec![DataKind::Country, DataKind::State],
                        vendor: Vendor::Socure,
                    },
                    VerificationInfo {
                        data_kinds: vec![
                            DataKind::StreetAddress,
                            DataKind::StreetAddress2,
                            DataKind::City,
                            DataKind::Zip,
                        ],
                        vendor: Vendor::Idology,
                    },
                    VerificationInfo {
                        data_kinds: vec![DataKind::Ssn],
                        vendor: Vendor::LexisNexis,
                    },
                    VerificationInfo {
                        data_kinds: vec![],
                        vendor: Vendor::Footprint,
                    },
                ];
                events.into_iter().try_for_each(|e| {
                    AuditTrail::create(
                        conn,
                        AuditTrailEvent::Verification(e),
                        uv_id.clone(),
                        Some(tenant_id.clone()),
                    )
                })?;
                // TODO don't mark as verified until data verification with vendors is complete
                ob.update_status(conn, Status::Verified)?;
            }
            // create the session for this scoped_user
            let validation_token = ServerSession::create_sync(
                &session_sealing_key,
                conn,
                SessionData::ValidateUserToken(ValidateUserToken { ob_id: ob.id }),
                Duration::minutes(15),
            )?;
            let webauthn_creds = WebauthnCredential::get_for_user_vault(conn, &uv_id)?;
            Ok((validation_token, webauthn_creds))
        })
        .await?;
    Ok(Json(ApiResponseData {
        data: CommitResponse {
            footprint_user_id,
            validation_token,
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}

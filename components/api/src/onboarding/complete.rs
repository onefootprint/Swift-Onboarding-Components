use crate::auth::get_onboarding_for_tenant;
use crate::auth::session_context::{HasUserVaultId, SessionContext};
use crate::auth::session_data::tenant::ob_public_key::PublicTenantAuthContext;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::session_data::validate_user::ValidateUserToken;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use chrono::Duration;
use db::models::audit_trails::AuditTrail;
use db::DbError;
use db::{models::insight_event::CreateInsightEvent, webauthn_credentials::get_webauthn_creds};
use newtypes::{AuditTrailEvent, DataKind, FootprintUserId, SessionAuthToken, Vendor, VerificationInfo};
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
    state: web::Data<State>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let onboarding = get_onboarding_for_tenant(&state.db_pool, &user_auth, &tenant_auth).await?;
    let uv = user_auth.user_vault(&state.db_pool).await?;

    let uv_id = uv.id.clone();

    let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
    let missing_fields = uvw
        .missing_fields()
        .into_iter()
        // check if we're missing something that's required
        .filter(|x| tenant_auth.ob_config.required_user_data.contains(x))
        .map(|x| x.to_string())
        .collect::<Vec<String>>();
    let webauthn_creds = get_webauthn_creds(&state.db_pool, uv_id.clone()).await?;
    // TODO kick off user verification with data vendors

    if !missing_fields.is_empty() {
        return Err(ApiError::UserMissingRequiredFields(missing_fields.join(",")));
    }

    let tenant_id = tenant_auth.tenant.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            // TODO add it to the onboarding table
            // record the insight for this onboarding
            CreateInsightEvent::from(insights).insert_with_conn(conn)?;
            // Just create some fixture events for now
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
            Ok(())
        })
        .await?;
    // TODO move into txn
    // create the session for this onboarding
    let validation_token = ServerSession::create(
        &state,
        SessionData::ValidateUserToken(ValidateUserToken {
            onboarding_id: onboarding.id,
        }),
        Duration::minutes(15),
    )
    .await?;
    Ok(Json(ApiResponseData {
        data: CommitResponse {
            footprint_user_id: onboarding.user_ob_id.clone(),
            validation_token,
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}

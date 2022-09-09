use crate::auth::key_context::ob_public_key::PublicTenantAuthContext;
use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::idv::initiate_idv_requests;
use crate::utils::idv::IdvRequestData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::audit_trail::AuditTrail;
use db::models::insight_event::CreateInsightEvent;
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use db::models::verification_request::VerificationRequest;
use db::models::webauthn_credential::WebauthnCredential;
use db::PgConnection;
use itertools::Itertools;
use newtypes::TenantId;
use newtypes::ValidatedPhoneNumber;
use newtypes::VerificationInfoStatus;
use newtypes::{AuditTrailEvent, SessionAuthToken, SignalAttribute, Status, Vendor, VerificationInfo};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Footprint validation token
    validation_token: SessionAuthToken,
    /// Boolean true / false if webauthn set
    missing_webauthn_credentials: bool,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/complete",
    operation_id = "hosted-onboarding-complete",
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the footprint_user_id for login. If any \
    necessary attributes were not set, returns an error with the list of missing fields."
)]
#[post("/complete")]
fn handler(
    user_auth: UserAuth,
    tenant_auth: PublicTenantAuthContext,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &user_auth.user_vault_id()))
        .await??;
    let missing_fields = uvw.missing_fields(&tenant_auth.ob_config);
    if !missing_fields.is_empty() {
        return Err(OnboardingError::UserMissingRequiredFields(missing_fields.iter().join(", ")).into());
    }

    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(&state).await?;
        Some(phone_number)
    } else {
        None
    };

    let tenant_id = tenant_auth.tenant.id.clone();
    let session_key = state.session_sealing_key.clone();
    let (validation_token, webauthn_creds, requests, ob_id, scoped_user, uvw) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get_or_create(
                conn,
                uvw.user_vault.id.clone(),
                tenant_auth.tenant.id.clone(),
                tenant_auth.ob_config.is_live,
            )?;
            let insight_event = CreateInsightEvent::from(insights);
            let ob = Onboarding::get_or_create(
                conn,
                scoped_user.id.clone(),
                tenant_auth.ob_config.id.clone(),
                insight_event,
            )?;
            let ob_id = ob.id.clone();
            let requests = initiate_verification(conn, ob, &uvw, &tenant_id, decrypted_phone)?;
            let validation_token =
                super::create_onboarding_validation_token(conn, &session_key, ob_id.clone())?;
            let webauthn_creds = WebauthnCredential::get_for_user_vault(conn, &uvw.user_vault.id.clone())?;
            Ok((
                validation_token,
                webauthn_creds,
                requests,
                ob_id,
                scoped_user,
                uvw,
            ))
        })
        .await?;

    // Fire off all IDV requests
    if !requests.is_empty() {
        let idv_data = uvw.build_idv_request(&state).await?;
        let requests = requests
            .into_iter()
            .map(|r| IdvRequestData {
                user_vault_id: scoped_user.user_vault_id.clone(),
                tenant_id: scoped_user.tenant_id.clone(),
                request: r,
                idv_data: idv_data.clone(),
            })
            .collect();
        initiate_idv_requests(&state, ob_id, requests).await?;
    }

    Ok(Json(ApiResponseData {
        data: CommitResponse {
            validation_token,
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}

fn initiate_verification(
    conn: &mut PgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    decrypted_phone: Option<ValidatedPhoneNumber>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // TODO decide when to re-KYC
    if ob.status == Status::Verified {
        return Ok(vec![]);
    }

    let desired_status = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("fail") {
            Status::Failed
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            Status::ManualReview
        } else if decrypted_phone.suffix.starts_with("idv") {
            Status::Processing
        } else {
            Status::Verified
        }
    } else {
        // TODO kick off user verification with data vendors
        Status::Verified
    };
    let ob = ob.update_status(conn, desired_status)?;
    if desired_status == Status::Processing {
        let idology_request = uvw
            .build_verification_request(ob.id.clone(), Vendor::Idology)
            .save(conn)?;
        let twilio_request = uvw.build_verification_request(ob.id, Vendor::Twilio).save(conn)?;
        return Ok(vec![idology_request, twilio_request]);
    }

    // If we're not kicking off a verification, just create some fixture events for now
    // Don't make duplicate fixture events if the user onboards multiple times since it
    // isn't very self-explanatory for the demo
    // TODO kick off user verification with data vendors,
    // and don't mark as verified until data verification with vendors is complete
    let final_status = match &desired_status {
        Status::Verified => VerificationInfoStatus::Verified,
        _ => VerificationInfoStatus::Failed,
    };
    let events = vec![
        VerificationInfo {
            attributes: vec![SignalAttribute::Name, SignalAttribute::Dob],
            vendor: Vendor::Experian,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalAttribute::Country, SignalAttribute::State],
            vendor: Vendor::Socure,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![
                SignalAttribute::StreetAddress,
                SignalAttribute::City,
                SignalAttribute::Zip,
            ],
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalAttribute::Ssn],
            vendor: Vendor::LexisNexis,
            status: final_status,
        },
        VerificationInfo {
            attributes: vec![],
            vendor: Vendor::Footprint,
            status: final_status,
        },
    ];
    events.into_iter().try_for_each(|e| {
        AuditTrail::create(
            conn,
            AuditTrailEvent::Verification(e),
            uvw.user_vault.id.clone(),
            Some(tenant_id.clone()),
            None,
        )
    })?;
    Ok(vec![])
}

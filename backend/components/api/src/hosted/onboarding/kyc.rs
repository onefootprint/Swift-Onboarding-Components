use crate::auth::key_context::ob_public_key::PublicOnboardingContext;
use crate::auth::session_data::ob_session::ParsedOnboardingSession;
use crate::auth::{session_data::user::UserAuthScope, UserAuth};
use crate::auth::{Either, SessionContext, VerifiedUserAuth};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use crate::utils::idv::initiate_idv_requests;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::audit_trail::AuditTrail;
use db::models::onboarding::{Onboarding, OnboardingUpdate};
use db::models::verification_request::VerificationRequest;
use db::{assert_in_transaction, PgConnection};
use newtypes::requirement_status::RequirementStatus;
use newtypes::{
    AuditTrailEvent, KycStatus, SignalScope, TenantId, ValidatedPhoneNumber, Vendor, VerificationInfo,
    VerificationInfoStatus,
};
use paperclip::actix::{api_v2_operation, get, post, web, Apiv2Schema};

#[derive(Debug, serde::Serialize, Apiv2Schema)]
struct StatusResponse {
    status: RequirementStatus,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/kyc-get",
    operation_id = "hosted-onboarding-kyc",
    tags(Hosted),
    description = "Check the status of KYC checks for a user"
)]
#[get("/kyc")]
fn get(
    state: web::Data<State>,
    user_auth: UserAuth,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<StatusResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let ob = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let ob_config = onboarding_context.ob_config();
            let ob = Onboarding::get_by_config(conn, &user_auth.user_vault_id(), &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            Ok(ob)
        })
        .await??;

    let response = StatusResponse {
        status: ob.kyc_status.public_status(),
    };
    ResponseData::ok(response).json()
}

#[api_v2_operation(
    summary = "/hosted/onboarding/kyc",
    operation_id = "hosted-onboarding-kyc",
    tags(Hosted),
    description = "Initiate KYC checks for a user"
)]
#[post("/kyc")]
fn post(
    state: web::Data<State>,
    user_auth: UserAuth,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;
    let tenant_id = onboarding_context.tenant().id.clone();

    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &user_auth.user_vault_id()))
        .await??;
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(&state).await?;
        Some(phone_number)
    } else {
        None
    };

    let (requests, scoped_user, ob_id) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, su) =
                Onboarding::lock_by_config(conn, &uvw.user_vault.id, &onboarding_context.ob_config().id)?
                    .ok_or(OnboardingError::NoOnboarding)?;
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.kyc_status != KycStatus::New {
                return Err(OnboardingError::WrongKycState(ob.kyc_status).into());
            }
            let ob_id = ob.id.clone();
            let requests = initiate_verification(conn, ob, &uvw, &tenant_id, decrypted_phone)?;
            Ok((requests, su, ob_id))
        })
        .await?;

    // Fire off all IDV requests. Now that the requests are saved in the DB, even if we crash here,
    // we know where to continue processing.
    if !requests.is_empty() {
        initiate_idv_requests(
            &state,
            ob_id,
            scoped_user.user_vault_id,
            scoped_user.tenant_id,
            requests,
        )
        .await?;
    }

    EmptyResponse::ok().json()
}

fn initiate_verification(
    conn: &mut PgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    decrypted_phone: Option<ValidatedPhoneNumber>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // TODO decide when to re-KYC
    assert_in_transaction(conn)?;
    let desired_status = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("fail") {
            KycStatus::Failed
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            KycStatus::ManualReview
        } else if decrypted_phone.suffix.starts_with("idv") {
            KycStatus::Pending
        } else {
            KycStatus::Success
        }
    } else {
        // TODO kick off user verification with data vendors
        KycStatus::Success
    };

    // Create the VerificationRequest and mark the onboarding's kyc_status as Pending in one transaction
    let ob = ob.update(conn, OnboardingUpdate::kyc_status(desired_status))?;
    if desired_status == KycStatus::Pending {
        let requests_to_initiate = vec![Vendor::Idology, Vendor::Twilio];
        let requests_to_initiate = requests_to_initiate
            .into_iter()
            .map(|v| uvw.build_verification_request(ob.id.clone(), v))
            .collect();
        let requests = VerificationRequest::bulk_save(conn, requests_to_initiate)?;
        return Ok(requests);
    }

    // If we're not kicking off a verification, just create some fixture events for now
    // Don't make duplicate fixture events if the user onboards multiple times since it
    // isn't very self-explanatory for the demo
    // TODO kick off user verification with data vendors,
    // and don't mark as verified until data verification with vendors is complete
    let final_status = match &desired_status {
        KycStatus::Success => VerificationInfoStatus::Verified,
        _ => VerificationInfoStatus::Failed,
    };
    let events = vec![
        VerificationInfo {
            attributes: vec![SignalScope::Name, SignalScope::Dob],
            vendor: Vendor::Experian,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::Country, SignalScope::State],
            vendor: Vendor::Socure,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::StreetAddress, SignalScope::City, SignalScope::Zip],
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::Ssn],
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

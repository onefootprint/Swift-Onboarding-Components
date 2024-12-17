use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::State;
use api_errors::NotFoundInto;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use newtypes::OnboardingStatus;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Returns the workflow's status. Only available for demo tenants and POS tenants."
)]
#[actix::post("/hosted/onboarding/avis_result")]
pub async fn post(state: web::Data<State>, auth: UserWfAuthContext) -> ApiResponse<OnboardingResultResponse> {
    let auth = auth.check_guard(UserAuthScope::SignUp)?;

    // NOTE: this API gives access to the workflow status. A fraudster could use this to pump fake
    // identities through and see which ones would pass KYC without any limits.
    // We generally do not want to expose this publicly, but it is needed for the Avis POS app.
    // We should find better ways of locking this down.
    if !auth.tenant.is_demo_tenant && !auth.tenant.id.is_avis_pos() {
        return NotFoundInto("Endpoint not found");
    }

    let mr_filters = ManualReviewFilters::get_active();
    let su_id = auth.scoped_user.id.clone();
    let mrs = state
        .db_query(move |conn| ManualReview::get(conn, &su_id, mr_filters))
        .await?;
    let result = OnboardingResultResponse {
        requires_manual_review: !mrs.is_empty(),
        status: auth.workflow.status,
    };
    Ok(result)
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingResultResponse {
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
}

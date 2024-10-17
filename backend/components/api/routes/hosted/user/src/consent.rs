use crate::auth::user::UserAuthScope;
use crate::utils::headers::InsightHeaders;
use crate::FpResult;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_wire_types::hosted::consent::ConsentRequest;
use chrono::Utc;
use db::models::insight_event::CreateInsightEvent;
use db::models::user_consent::UserConsent;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Records a user's consent to collection of their images.",
    tags(User, Hosted)
)]
#[actix::post("/hosted/user/consent")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    insight: InsightHeaders,
    request: Json<ConsentRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let wf_id = user_auth.workflow.clone();

    let ConsentRequest {
        consent_language_text,
        ml_consent,
    } = request.into_inner();

    state
        .db_transaction(move |conn| -> FpResult<_> {
            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;

            let ml_consent = ml_consent.unwrap_or(false);
            UserConsent::create(
                conn,
                Utc::now(),
                insight_event.id,
                consent_language_text,
                ml_consent,
                wf_id.id,
            )?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

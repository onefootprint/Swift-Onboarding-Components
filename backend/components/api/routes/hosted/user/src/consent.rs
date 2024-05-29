use crate::auth::user::UserAuthScope;
use crate::errors::{
    ApiError,
    ApiResult,
};
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_wire_types::hosted::consent::ConsentRequest;
use chrono::Utc;
use db::models::insight_event::CreateInsightEvent;
use db::models::user_consent::UserConsent;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
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
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let wf_id = user_auth.workflow().clone();

    let ConsentRequest {
        consent_language_text,
        ml_consent,
    } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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

    Ok(Json(EmptyResponse::ok()))
}

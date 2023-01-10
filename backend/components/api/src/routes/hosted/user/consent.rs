use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_wire_types::hosted::consent::ConsentRequest;
use chrono::Utc;
use db::models::insight_event::CreateInsightEvent;
use db::models::user_consent::UserConsent;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Records a user's consent to collection of their images.",
    tags(Hosted)
)]
#[actix::post("/hosted/user/consent")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insight: InsightHeaders,
    request: Json<ConsentRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let user_vault_id = user_auth.user_vault_id();

    let ConsentRequest {
        consent_language_text,
        document_request_id,
    } = request.into_inner();

    state
        .db_pool
        .db_test_transaction(move |conn| -> ApiResult<_> {
            let Some(scoped_user_id) = user_auth.scoped_user(conn)?.map(|su| su.id) else {
                return Err(ApiError::from(OnboardingError::NoOnboarding))
            };

            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;

            let _user_consent = UserConsent::create(
                conn,
                user_vault_id,
                scoped_user_id,
                Utc::now(),
                document_request_id,
                insight_event.id,
                consent_language_text,
            )?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}

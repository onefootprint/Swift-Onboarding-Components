use crate::auth::client_secret_key::SecretTenantAuthContext;
use crate::auth::either::Either;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use chrono::NaiveDateTime;
use db::DbError;
use newtypes::tenant::workos::WorkOsSession;
use newtypes::{DataKind, FootprintUserId, Status};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct OnboardingRequest {
    status: Option<Status>,
    fingerprint: Option<String>,
    footprint_user_id: Option<FootprintUserId>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct OnboardingItem {
    pub footprint_user_id: FootprintUserId,
    pub status: Status,
    pub populated_data_kinds: Vec<DataKind>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

type OnboardingResponse = Vec<OnboardingItem>;

#[api_v2_operation(tags(Org))]
#[get("/onboardings")]
/// Allows a tenant to view a list of their Onboardings, effectively showing all users that have
/// started the onboarding process for the tenant. Optionally allows filtering on Onboarding status.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    request: web::Query<OnboardingRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let tenant = auth.tenant(&state.db_pool).await?;

    let OnboardingRequest {
        status,
        fingerprint,
        footprint_user_id,
    } = request.into_inner();

    // TODO clean phone number or email
    let fingerprint = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = crate::user::clean_for_fingerprint(fingerprint);
            let fingerprint = crate::utils::crypto::signed_hash(&state, cleaned_data).await?;
            Some(fingerprint)
        }
        None => None,
    };

    let conn = state.db_pool.get().await.map_err(DbError::from)?;
    let onboardings = conn
        .interact(move |conn| -> Result<Vec<OnboardingItem>, DbError> {
            let onboardings = db::onboarding::list_for_tenant(
                conn,
                tenant.id.clone(),
                status,
                fingerprint,
                footprint_user_id,
            )?;
            let user_vault_ids = onboardings.iter().map(|ob| ob.user_vault_id.clone()).collect();
            let user_to_kinds = db::user_data::bulk_fetch_populated_kinds(conn, user_vault_ids)?;

            let results = onboardings
                .into_iter()
                .map(|ob| OnboardingItem {
                    footprint_user_id: ob.user_ob_id,
                    status: ob.status,
                    populated_data_kinds: user_to_kinds.get(&ob.user_vault_id).unwrap_or(&vec![]).clone(),
                    created_at: ob.created_at,
                    updated_at: ob.updated_at,
                })
                .collect();
            Ok(results)
        })
        .await
        .map_err(DbError::from)??;

    Ok(Json(ApiResponseData { data: onboardings }))
}

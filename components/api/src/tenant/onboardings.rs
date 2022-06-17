use crate::auth::client_secret_key::SecretTenantAuthContext;
use crate::auth::either::Either;
use crate::types::success::ApiPaginatedResponseData;
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
    cursor: Option<i64>,
    page_size: Option<usize>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct OnboardingItem {
    pub footprint_user_id: FootprintUserId,
    pub status: Status,
    pub populated_data_kinds: Vec<DataKind>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub ordering_id: i64,
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
) -> actix_web::Result<Json<ApiPaginatedResponseData<OnboardingResponse, i64>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

    let OnboardingRequest {
        status,
        fingerprint,
        footprint_user_id,
        cursor,
        page_size,
    } = request.into_inner();
    let page_size = if let Some(page_size) = page_size {
        page_size
    } else {
        state.config.default_page_size
    };

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
    let (onboardings, user_to_kinds) = conn
        .interact(move |conn| -> Result<_, DbError> {
            let onboardings = db::onboarding::list_for_tenant(
                conn,
                tenant.id.clone(),
                status,
                fingerprint,
                footprint_user_id,
                cursor,
                (page_size + 1) as i64,
            )?;
            let user_vault_ids = onboardings.iter().map(|ob| ob.user_vault_id.clone()).collect();
            let user_to_kinds = db::user_data::bulk_fetch_populated_kinds(conn, user_vault_ids)?;

            Ok((onboardings, user_to_kinds))
        })
        .await
        .map_err(DbError::from)??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = if onboardings.len() > page_size {
        onboardings.last().map(|x| x.ordering_id)
    } else {
        None
    };

    let onboardings = onboardings
        .into_iter()
        .take(page_size)
        .map(|ob| OnboardingItem {
            footprint_user_id: ob.user_ob_id,
            status: ob.status,
            populated_data_kinds: user_to_kinds.get(&ob.user_vault_id).unwrap_or(&vec![]).clone(),
            created_at: ob.created_at,
            updated_at: ob.updated_at,
            ordering_id: ob.ordering_id,
        })
        .collect();

    Ok(Json(ApiPaginatedResponseData::ok(onboardings, cursor)))
}

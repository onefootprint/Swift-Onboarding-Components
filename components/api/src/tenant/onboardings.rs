use crate::auth::client_secret_key::SecretTenantAuthContext;
use crate::auth::either::Either;
use crate::types::success::ApiPaginatedResponseData;
use crate::utils::querystring::deserialize_stringified_list;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use chrono::{DateTime, NaiveDateTime, Utc};
use db::onboarding::OnboardingListQueryParams;
use db::DbError;
use newtypes::tenant::workos::WorkOsSession;
use newtypes::{DataKind, FootprintUserId, Status};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct OnboardingRequest {
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    statuses: Vec<Status>,
    fingerprint: Option<String>,
    footprint_user_id: Option<FootprintUserId>,
    // Accept timezones with a timestamp, but translate them to naive utc representation
    timestamp_lte: Option<DateTime<Utc>>,
    timestamp_gte: Option<DateTime<Utc>>,
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
    pub start_timestamp: NaiveDateTime,
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
        statuses,
        fingerprint,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
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
    let query_params = OnboardingListQueryParams {
        tenant_id: tenant.id.clone(),
        statuses,
        fingerprint,
        footprint_user_id,
        timestamp_lte: timestamp_lte.map(|x| x.naive_utc()),
        timestamp_gte: timestamp_gte.map(|x| x.naive_utc()),
    };
    let (onboardings, user_to_kinds, count) = conn
        .interact(move |conn| -> Result<_, DbError> {
            let onboardings =
                db::onboarding::list_for_tenant(conn, query_params.clone(), cursor, (page_size + 1) as i64)?;
            // If no cursor is provided, we're on the first page, so we should return the total
            // count of results matching this query.
            let count = match cursor {
                Some(_) => None,
                None => Some(db::onboarding::count_for_tenant(conn, query_params)?),
            };
            let user_vault_ids = onboardings.iter().map(|ob| ob.user_vault_id.clone()).collect();
            let user_to_kinds = db::user_data::bulk_fetch_populated_kinds(conn, user_vault_ids)?;

            Ok((onboardings, user_to_kinds, count))
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
            start_timestamp: ob.start_timestamp,
            ordering_id: ob.ordering_id,
        })
        .collect();

    Ok(Json(ApiPaginatedResponseData::ok(onboardings, cursor, count)))
}

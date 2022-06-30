use crate::auth::either::Either;
use crate::auth::session_context::HasTenant;
use crate::auth::session_data::tenant::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::types::onboarding::ApiOnboarding;
use crate::types::success::ApiPaginatedResponseData;
use crate::utils::querystring::deserialize_stringified_list;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use chrono::{DateTime, Utc};
use db::onboarding::OnboardingListQueryParams;
use db::DbError;
use newtypes::{DataKind, Fingerprint, Fingerprinter, FootprintUserId, Status};
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

type OnboardingResponse = Vec<ApiOnboarding>;

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
    let fingerprints = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = crate::user::clean_for_fingerprint(fingerprint);

            let fut_fingerprints =
                DataKind::fingerprintable().map(|kind| state.compute_fingerprint(kind, &cleaned_data));
            let fingerprints: Vec<Fingerprint> = futures::future::try_join_all(fut_fingerprints).await?;
            Some(fingerprints)
        }
        None => None,
    };

    let query_params = OnboardingListQueryParams {
        tenant_id: tenant.id.clone(),
        statuses,
        fingerprints,
        footprint_user_id,
        timestamp_lte: timestamp_lte.as_ref().map(DateTime::naive_utc),
        timestamp_gte: timestamp_gte.as_ref().map(DateTime::naive_utc),
    };
    let (onboardings, user_to_kinds, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let onboardings =
                db::onboarding::list_for_tenant(conn, query_params.clone(), cursor, (page_size + 1) as i64)?;
            // If no cursor is provided, we're on the first page, so we should return the total
            // count of results matching this query.
            let count = match cursor {
                Some(_) => None,
                None => Some(db::onboarding::count_for_tenant(conn, query_params)?),
            };
            let user_vault_ids = onboardings.iter().map(|ob| ob.0.user_vault_id.clone()).collect();
            let user_to_kinds = db::user_data::bulk_fetch_populated_kinds(conn, user_vault_ids)?;

            Ok((onboardings, user_to_kinds, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = if onboardings.len() > page_size {
        onboardings.last().map(|x| x.0.ordering_id)
    } else {
        None
    };

    let onboardings = onboardings
        .into_iter()
        .take(page_size)
        .map(|x| {
            (
                user_to_kinds.get(&x.0.user_vault_id).unwrap_or(&vec![]).clone(),
                x.0,
                x.1,
            )
        })
        .map(ApiOnboarding::from)
        .collect();

    Ok(Json(ApiPaginatedResponseData::ok(onboardings, cursor, count)))
}

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::request::PaginatedRequest;
use crate::types::response::ApiPaginatedResponseData;
use crate::types::scoped_user::ApiScopedUser;
use crate::utils::querystring::deserialize_stringified_list;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use chrono::{DateTime, Utc};
use db::models::onboardings::Onboarding;
use db::scoped_users::OnboardingListQueryParams;
use db::DbError;
use newtypes::{DataKind, Fingerprint, Fingerprinter, FootprintUserId, PiiString, Status};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct UsersRequest {
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    statuses: Vec<Status>,
    fingerprint: Option<PiiString>,
    footprint_user_id: Option<FootprintUserId>,
    timestamp_lte: Option<DateTime<Utc>>,
    timestamp_gte: Option<DateTime<Utc>>,
}

type UsersResponse = Vec<ApiScopedUser>;

#[api_v2_operation(tags(Org))]
/// Allows a tenant to view a list of their Onboardings, effectively showing all users that have
/// started the onboarding process for the tenant. Optionally allows filtering on Onboarding status.
/// Requires tenant secret key auth.
pub fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<UsersRequest, i64>>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiPaginatedResponseData<UsersResponse, i64>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

    let cursor = request.cursor;
    let page_size = request.page_size(&state);
    let UsersRequest {
        statuses,
        fingerprint,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    } = request.data.clone();

    // TODO clean phone number or email
    let fingerprints = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = fingerprint.clean_for_fingerprint();

            let fut_fingerprints =
                DataKind::fingerprintable().map(|kind| state.compute_fingerprint(kind, &cleaned_data));
            let fingerprints: Vec<Fingerprint> = futures::future::try_join_all(fut_fingerprints).await?;
            Some(fingerprints)
        }
        None => None,
    };

    let query_params = OnboardingListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        statuses,
        fingerprints,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    };
    let (scoped_users, obs, user_to_kinds, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let scoped_users = db::scoped_users::list_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            // If no cursor is provided, we're on the first page, so we should return the total
            // count of results matching this query.
            let count = cursor.map_or(Ok(None), |_| {
                db::scoped_users::count_for_tenant(conn, query_params).map(Some)
            })?;
            let (scoped_user_ids, user_vault_ids) =
                scoped_users.iter().map(|ob| (&ob.id, &ob.user_vault_id)).unzip();
            let user_to_kinds = db::user_data::bulk_fetch_populated_kinds(conn, user_vault_ids)?;
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids)?;

            Ok((scoped_users, obs, user_to_kinds, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = request
        .cursor_item(&state, &scoped_users)
        .map(|su| su.ordering_id);
    let empty_vec = vec![];
    let scoped_users = scoped_users
        .into_iter()
        .take(page_size)
        .map(|su| {
            (
                user_to_kinds.get(&su.user_vault_id).unwrap_or(&vec![]).clone(),
                obs.get(&su.id).unwrap_or(&empty_vec),
                su,
            )
        })
        .map(ApiScopedUser::from)
        .collect();

    Ok(Json(ApiPaginatedResponseData::ok(scoped_users, cursor, count)))
}

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::request::PaginatedRequest;
use crate::types::response::ApiPaginatedResponseData;
use crate::types::scoped_user::ApiScopedUser;
use crate::utils::querystring::deserialize_stringified_list;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use chrono::{DateTime, Utc};
use db::models::onboardings::Onboarding;
use db::scoped_users::OnboardingListQueryParams;
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

#[api_v2_operation(tags(Org, Users))]
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
        is_live: auth.is_live(&state.db_pool).await?,
        statuses,
        fingerprints,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    };
    let (scoped_users, obs, uvws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_users = db::scoped_users::list_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_users::count_for_tenant(conn, query_params).map(Some)?;
            let (scoped_user_ids, user_vault_ids): (_, Vec<_>) =
                scoped_users.iter().map(|ob| (&ob.id, &ob.user_vault_id)).unzip();
            // TODO bulk fetch user vault wrapper endpoint to save many DB queries
            // https://linear.app/footprint/issue/FP-1004/create-util-to-bulk-hydrate-uvws
            let uvws: Vec<UserVaultWrapper> = user_vault_ids
                .into_iter()
                .map(|id| UserVaultWrapper::from_id(conn, id))
                .collect::<Result<_, _>>()?;
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids)?;

            Ok((scoped_users, obs, uvws, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = request
        .cursor_item(&state, &scoped_users)
        .map(|su| su.ordering_id);
    let empty_vec = vec![];
    let scoped_users = scoped_users
        .into_iter()
        .zip(uvws.into_iter())
        .take(page_size)
        .map(|(su, uvw)| {
            ApiScopedUser::from(
                uvw.get_populated_fields(),
                obs.get(&su.id).unwrap_or(&empty_vec),
                su,
                uvw.user_vault.is_portable,
            )
        })
        .collect();

    Ok(Json(ApiPaginatedResponseData::ok(scoped_users, cursor, count)))
}

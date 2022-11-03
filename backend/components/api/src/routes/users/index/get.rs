use std::collections::HashMap;

use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::request::PaginatedRequest;
use crate::types::response::PaginatedResponseData;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use api_wire_types::DecisionSource;
use api_wire_types::ListUsersRequest;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingInfo;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::scoped_user::ScopedUser;
use db::models::tenant_user::TenantUser;
use db::scoped_user::OnboardingListQueryParams;
use db::HasDataAttributeFields;

use newtypes::FootprintUserId;
use newtypes::LivenessSource;
use newtypes::TenantPermission;
use newtypes::UserVaultId;
use newtypes::{DataAttribute, Fingerprint, Fingerprinter};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type UsersDetailResponse = api_wire_types::User;
type UsersListResponse = Vec<UsersDetailResponse>;

#[api_v2_operation(
    description = "Allows a tenant to view a list of their Onboardings, effectively showing all \
    users that have started the onboarding process for the tenant. Optionally allows filtering on \
    Onboarding status. Requires tenant secret key auth.",
    tags(Users, PublicApi)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<ListUsersRequest, i64>>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<PaginatedResponseData<UsersListResponse, i64>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant = auth.tenant();

    let cursor = request.cursor;
    let page_size = request.page_size(&state);
    let ListUsersRequest {
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

            let fut_fingerprints = DataAttribute::fingerprintable()
                .map(|kind| state.compute_fingerprint(kind, cleaned_data.clone()));
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
    let (scoped_users, obs, uvws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_users = db::scoped_user::list_authorized_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_user::count_authorized_for_tenant(conn, query_params).map(Some)?;
            let (scoped_user_ids, user_vault_ids): (_, Vec<_>) =
                scoped_users.iter().map(|ob| (&ob.id, &ob.user_vault_id)).unzip();
            let uvws: Vec<UserVaultWrapper> = UserVaultWrapper::multi_get(conn, user_vault_ids)?;
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids)?;

            Ok((scoped_users, obs, uvws, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = request
        .cursor_item(&state, &scoped_users)
        .map(|su| su.ordering_id);
    let empty_vec = vec![];

    // Since we zip these Vecs together, we should ensure they are in the same order.
    // scoped_users.sort_by_key(|su| su.user_vault_id.clone());
    let mut uvw_map: HashMap<UserVaultId, UserVaultWrapper> = uvws
        .into_iter()
        .map(move |uvw| (uvw.user_vault.id.clone(), uvw))
        .collect();

    let scoped_users = scoped_users
        .into_iter()
        .take(page_size)
        .map(|su| {
            let uvw = uvw_map.remove(&su.user_vault_id).unwrap();
            <api_wire_types::User as DbToApi<UserDetail>>::from_db((
                uvw.get_populated_fields(),
                obs.get(&su.id).unwrap_or(&empty_vec),
                su,
                uvw.user_vault.is_portable,
            ))
        })
        .collect();

    Ok(Json(PaginatedResponseData::ok(scoped_users, cursor, count)))
}

#[api_v2_operation(
    description = "Allows a tenant to view a specific user",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    footprint_user_id: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<JsonApiResponse<UsersDetailResponse>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant = auth.tenant();

    let query_params = OnboardingListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        statuses: vec![],
        fingerprints: None,
        footprint_user_id: Some(footprint_user_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
    };
    let (su, obs, uvw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = db::scoped_user::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiError::ResourceNotFound)?;
            let uvw = UserVaultWrapper::get(conn, &su.user_vault_id)?;
            let obs = Onboarding::get_for_scoped_users(conn, vec![&su.id])?
                .remove(&su.id)
                .ok_or(ApiError::ResourceNotFound)?;

            Ok((su, obs, uvw))
        })
        .await??;

    let response = <api_wire_types::User as DbToApi<UserDetail>>::from_db((
        uvw.get_populated_fields(),
        &obs,
        su,
        uvw.user_vault.is_portable,
    ));
    Ok(ResponseData::ok(response).json())
}

type UserDetail<'a> = (Vec<DataAttribute>, &'a [OnboardingInfo], ScopedUser, bool);

impl<'a> DbToApi<UserDetail<'a>> for api_wire_types::User {
    fn from_db((identity_data_attributes, onboarding_info, scoped_user, is_portable): UserDetail) -> Self {
        let ScopedUser {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_user;

        api_wire_types::User {
            id: fp_user_id,
            is_portable,
            identity_data_attributes,
            start_timestamp,
            onboardings: onboarding_info
                .iter()
                .map(|x| api_wire_types::Onboarding::from_db(x.clone()))
                .collect(),
            ordering_id,
        }
    }
}

impl DbToApi<OnboardingInfo> for api_wire_types::Onboarding {
    fn from_db((onboarding, config, liveness_event, insight, decision): OnboardingInfo) -> Self {
        let Onboarding {
            start_timestamp,
            status,
            ..
        } = onboarding;
        let db::models::ob_configuration::ObConfiguration {
            name,
            can_access_data,
            can_access_identity_document_images,
            ..
        } = config;

        let can_access_data_attributes = can_access_data.iter().flat_map(|x| x.attributes()).collect();
        api_wire_types::Onboarding {
            id: onboarding.id,
            name,
            config_id: config.id,
            status,
            timestamp: start_timestamp,
            is_liveness_skipped: liveness_event
                .map(|s| matches!(s.liveness_source, LivenessSource::Skipped))
                .unwrap_or_default(),
            insight_event: api_wire_types::InsightEvent::from_db(insight),
            can_access_data,
            can_access_data_attributes,
            can_access_identity_document_images,
            latest_decision: decision.map(api_wire_types::OnboardingDecision::from_db),
        }
    }
}

impl DbToApi<(OnboardingDecision, Option<TenantUser>)> for api_wire_types::OnboardingDecision {
    fn from_db(d: (OnboardingDecision, Option<TenantUser>)) -> Self {
        let (decision, tenant_user) = d;
        let OnboardingDecision {
            id,
            verification_status,
            compliance_status,
            created_at,
            ..
        } = decision;
        let source = if let Some(tenant_user) = tenant_user {
            DecisionSource::Organization {
                member: tenant_user.email,
            }
        } else {
            DecisionSource::Footprint
        };
        api_wire_types::OnboardingDecision {
            id,
            verification_status,
            compliance_status,
            timestamp: created_at,
            source,
        }
    }
}

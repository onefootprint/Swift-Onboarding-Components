use std::collections::HashSet;

use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{
    tenant::{CheckTenantPermissions, WorkOsAuthContext},
    Either, SessionContext,
};
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyRequest;
use crate::types::PaginatedRequest;
use crate::types::PaginatedResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::DbError;
use itertools::Itertools;
use newtypes::CollectedDataOption;
use newtypes::ObConfigurationId;
use newtypes::{ApiKeyStatus, TenantPermission};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

#[api_v2_operation(
    tags(Organization, PublicApi),
    description = " Uses tenant public key auth to return information about the tenant."
)]
#[get("/org/onboarding_config")]
pub fn get_detail(
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((
            onboarding_context.ob_config().clone(),
            onboarding_context.tenant().clone(),
        )),
    )))
}

#[api_v2_operation(
    tags(Organization, PublicApi),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<
    Json<PaginatedResponseData<Vec<api_wire_types::OnboardingConfiguration>, DateTime<Utc>>>,
    ApiError,
> {
    let auth = auth.check_permissions(vec![TenantPermission::OnboardingConfiguration])?;
    let tenant = auth.tenant();
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
    };
    let (configs, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let results = ObConfiguration::list(conn, &query, cursor, (page_size + 1) as i64)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, count))
        })
        .await??;

    let cursor = request.cursor_item(&state, &configs).map(|x| x.created_at);
    let configs = configs
        .into_iter()
        .take(page_size)
        .map(|x| (x, tenant.clone()))
        .map(api_wire_types::OnboardingConfiguration::from_db)
        .collect::<Vec<api_wire_types::OnboardingConfiguration>>();
    Ok(Json(PaginatedResponseData::ok(configs, cursor, Some(count))))
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data: Vec<CollectedDataOption>,
    can_access_data: Vec<CollectedDataOption>,
    #[serde(default)]
    must_collect_identity_document: bool,
    #[serde(default)]
    can_access_identity_document_images: bool,
}

const REQUIRED_FIELDS: [CollectedDataOption; 4] = [
    CollectedDataOption::Name,
    CollectedDataOption::FullAddress,
    CollectedDataOption::Email,
    CollectedDataOption::PhoneNumber,
];

impl CreateOnboardingConfigurationRequest {
    fn validate(&self) -> Result<(), TenantError> {
        let invalid_config = self
            .must_collect_data
            .iter()
            .cloned()
            .map(|x| (x.parent(), x))
            .sorted()
            .group_by(|(p, _)| *p)
            .into_iter()
            .map(|(_, g)| g.map(|x| x.1).collect())
            .find(|x: &Vec<_>| x.len() > 1);
        if let Some(invalid_config) = invalid_config {
            return Err(TenantError::ValidationError(format!(
                "Cannot provide both {} and {}",
                invalid_config[0], invalid_config[1]
            )));
        } else if !HashSet::<&CollectedDataOption>::from_iter(self.can_access_data.iter()).is_subset(
            &HashSet::<&CollectedDataOption>::from_iter(self.must_collect_data.iter()),
        ) {
            return Err(TenantError::ValidationError(
                "Decryptable fields must be a subset of collected fields".to_owned(),
            ));
        } else if self.can_access_identity_document_images && !self.must_collect_identity_document {
            return Err(TenantError::ValidationError(
                "Cannot access document images without collecting them".to_owned(),
            ));
        }
        let missing_required_fields: Vec<_> = REQUIRED_FIELDS
            .into_iter()
            .filter(|x| !self.must_collect_data.contains(x))
            .collect();
        if !missing_required_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "All ob configurations must require {:?}",
                missing_required_fields
            )));
        }
        Ok(())
    }
}

#[api_v2_operation(
    description = "Creates a new onboarding configuration.",
    tags(Organization, PublicApi)
)]
#[post("/org/onboarding_configs")]
pub fn post(
    state: web::Data<State>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OnboardingConfiguration])?;
    request.validate()?;
    let tenant = auth.tenant().clone();
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        can_access_data,
        must_collect_identity_document,
        can_access_identity_document_images,
    } = request.into_inner();

    let obc = ObConfiguration::create(
        &state.db_pool,
        name,
        tenant.id.clone(),
        must_collect_data,
        can_access_data,
        must_collect_identity_document,
        can_access_identity_document_images,
        auth.is_live()?,
    )
    .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, tenant)),
    )))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigPath {
    id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[api_v2_operation(
    description = "Updates an existing onboarding configuration.",
    tags(Organization, PublicApi)
)]
#[patch("/org/onboarding_configs/{id}")]
async fn patch(
    state: web::Data<State>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    path: web::Path<UpdateObConfigPath>,
    request: web::Json<UpdateObConfigRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OnboardingConfiguration])?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let UpdateObConfigPath { id } = path.into_inner();
    let UpdateObConfigRequest { name, status } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let result = state
        .db_pool
        .db_transaction(move |conn| ObConfiguration::update(conn, id, tenant_id, is_live, name, status))
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((result, tenant)),
    )))
}

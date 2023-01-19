use std::collections::HashSet;

use crate::auth::tenant::ObPkAuth;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::{
    tenant::{CheckTenantGuard, TenantUserAuthContext},
    Either,
};
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::PaginatedResponseData;
use crate::types::PaginationRequest;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::DbError;
use itertools::Itertools;
use newtypes::ApiKeyStatus;
use newtypes::CollectedDataOption;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

#[api_v2_operation(
    tags(Organization, PublicApi),
    description = " Uses tenant public key auth to return information about the tenant."
)]
#[get("/org/onboarding_config")]
pub fn get_detail(
    ob_pk_auth: ObPkAuth,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((
            ob_pk_auth.ob_config().clone(),
            ob_pk_auth.tenant().clone(),
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
    pagination: web::Query<PaginationRequest<DateTime<Utc>>>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<
    Json<PaginatedResponseData<Vec<api_wire_types::OnboardingConfiguration>, DateTime<Utc>>>,
    ApiError,
> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

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

    let cursor = pagination.cursor_item(&state, &configs).map(|x| x.created_at);
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
    #[serde(default)]
    must_collect_selfie: bool,
    #[serde(default)]
    can_access_selfie_image: bool,
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
            .into_group_map()
            .into_iter()
            // Find the CollectedDataOption parents that have more than one option specified
            .find(|(_, options)| options.len() > 1);
        if let Some(invalid_config) = invalid_config {
            return Err(TenantError::ValidationError(format!(
                "Cannot provide both {} and {}",
                invalid_config.1[0], invalid_config.1[1]
            )));
        } else if !HashSet::<&CollectedDataOption>::from_iter(self.can_access_data.iter()).is_subset(
            &HashSet::<&CollectedDataOption>::from_iter(self.must_collect_data.iter()),
        ) {
            return Err(TenantError::ValidationError(
                "Decryptable fields must be a subset of collected fields".to_owned(),
            ));
        } else if self.must_collect_selfie && !self.must_collect_identity_document {
            return Err(TenantError::ValidationError(
                "Cannot collect selfie without collecting a document".to_owned(),
            ));
        } else if self.can_access_identity_document_images && !self.must_collect_identity_document {
            return Err(TenantError::ValidationError(
                "Cannot access document images without collecting them".to_owned(),
            ));
        } else if self.can_access_selfie_image && !self.must_collect_selfie {
            return Err(TenantError::ValidationError(
                "Cannot access selfie images without collecting them".to_owned(),
            ));
        };
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
pub async fn post(
    state: web::Data<State>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    request.validate()?;
    let tenant = auth.tenant().clone();
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        can_access_data,
        must_collect_identity_document,
        can_access_identity_document_images,
        must_collect_selfie,
        can_access_selfie_image,
    } = request.into_inner();

    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    let obc = state
        .db_pool
        .db_query(move |conn| {
            ObConfiguration::create(
                conn,
                name,
                tenant_id,
                must_collect_data,
                can_access_data,
                must_collect_identity_document,
                can_access_identity_document_images,
                must_collect_selfie,
                can_access_selfie_image,
                is_live,
            )
        })
        .await??;

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
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    path: web::Path<UpdateObConfigPath>,
    request: web::Json<UpdateObConfigRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let UpdateObConfigPath { id } = path.into_inner();
    let UpdateObConfigRequest { name, status } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let result = state
        .db_pool
        .db_transaction(move |conn| ObConfiguration::update(conn, &id, &tenant_id, is_live, name, status))
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((result, tenant)),
    )))
}

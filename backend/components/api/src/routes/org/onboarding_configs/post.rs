use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::{
    tenant::{CheckTenantGuard, TenantSessionAuth},
    Either,
};
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use itertools::Itertools;
use newtypes::CollectedDataOption;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::collections::HashSet;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data: Vec<CollectedDataOption>,
    can_access_data: Vec<CollectedDataOption>,
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
pub async fn post(
    state: web::Data<State>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    request.validate()?;
    let tenant = auth.tenant().clone();
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        can_access_data,
    } = request.into_inner();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    let obc = state
        .db_pool
        .db_query(move |conn| {
            ObConfiguration::create(conn, name, tenant_id, must_collect_data, can_access_data, is_live)
        })
        .await??;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, tenant)),
    )))
}

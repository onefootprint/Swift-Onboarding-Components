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
    #[serde(default)]
    /// TODO: deprecate
    must_collect_identity_document: bool,
    #[serde(default)]
    /// TODO: deprecate
    can_access_identity_document_images: bool,
    #[serde(default)]
    /// TODO: deprecate
    must_collect_selfie: bool,
    #[serde(default)]
    /// TODO: deprecate
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
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    request.validate()?;
    let tenant = auth.tenant().clone();
    let CreateOnboardingConfigurationRequest {
        name,
        mut must_collect_data,
        mut can_access_data,
        must_collect_identity_document,
        can_access_identity_document_images,
        must_collect_selfie,
        can_access_selfie_image,
    } = request.into_inner();
    if must_collect_identity_document && must_collect_selfie {
        must_collect_data.push(CollectedDataOption::DocumentAndSelfie)
    } else if must_collect_identity_document {
        must_collect_data.push(CollectedDataOption::Document)
    }
    if can_access_identity_document_images && can_access_selfie_image {
        can_access_data.push(CollectedDataOption::DocumentAndSelfie)
    } else if can_access_identity_document_images {
        can_access_data.push(CollectedDataOption::Document)
    }

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

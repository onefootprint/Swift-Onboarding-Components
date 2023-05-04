use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::{
    tenant::{CheckTenantGuard, TenantSessionAuth},
    Either,
};
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::errors::AssertionError;
use db::models::ob_configuration::ObConfiguration;
use itertools::Itertools;
use newtypes::CollectedData as CD;
use newtypes::CollectedDataOption as CDO;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
}

impl CreateOnboardingConfigurationRequest {
    const REQUIRED_FIELDS: [CDO; 4] = [CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber];
    /// Core validation business logic, separated from checking simple required fields
    fn validate_inner(&self) -> ApiResult<()> {
        let group_by_parent = |cdos: Vec<CDO>| {
            cdos
            .into_iter()
            .map(|cdo| (cdo.parent(), cdo))
            .into_group_map()
            .into_iter()
            .map(|(cd, cdos)| -> ApiResult<(CD, CDO)>  {
            if cdos.len() > 1 {
                Err(TenantError::ValidationError(format!(
                    "Cannot provide both {} and {}",
                    cdos[0], cdos[1]
                ))
                .into())
            } else {
                let cdo = cdos.into_iter().next().ok_or(AssertionError("No CDO for CD"))?;
                 Ok((cd, cdo))
            }})
            // Find the CDO parents that have more than one option specified
            .collect::<ApiResult<HashMap<_, _>>>()
        };

        // Make sure there's only one CDO per CD, and create a map of CD -> selected CDO
        let must_collect = group_by_parent(self.must_collect_data.clone())?;
        let can_access = group_by_parent(self.can_access_data.clone())?;

        // Make sure all decryption permissions are a subset of collected data
        let invalid_cd = CD::iter().find(|cd| {
            let is_valid = match (must_collect.get(cd), can_access.get(cd)) {
                // The fun case - if we have a collect and an access CDO for the same CD, make sure
                // the collect CDO is "more complete" than the access CDO
                (Some(collect), Some(access)) => {
                    // The options for each CD are ordered in ascending "completeness"
                    let collect_idx = cd.options().iter().position(|cdo| cdo == collect);
                    let access_idx = cd.options().iter().position(|cdo| cdo == access);
                    collect_idx >= access_idx
                }
                // No problems if we want to collect more than we want to decrypt
                (Some(_), None) | (None, None) => true,
                // Not allowed to decrypt a CD that is never collected
                (None, Some(_)) => false,
            };
            !is_valid
        });
        if let Some(cd) = invalid_cd {
            return Err(TenantError::ValidationError(format!(
                "Decryptable {} fields must be a subset of collected fields",
                cd
            ))
            .into());
        }
        Ok(())
    }

    fn validate(&self) -> ApiResult<()> {
        self.validate_inner()?;

        // Check for required fields
        let missing_required_fields: Vec<_> = Self::REQUIRED_FIELDS
            .into_iter()
            .filter(|x| !self.must_collect_data.contains(x))
            .collect();
        if !missing_required_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "All ob configurations must require {:?}",
                missing_required_fields
            ))
            .into());
        }
        Ok(())
    }
}

#[api_v2_operation(
    description = "Creates a new onboarding configuration.",
    tags(Organization, Private)
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
        api_wire_types::OnboardingConfiguration::from_db((obc, tenant, None)),
    )))
}

#[cfg(test)]
mod test {
    use super::CreateOnboardingConfigurationRequest;
    use newtypes::CollectedDataOption as CDO;
    use test_case::test_case;

    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::DocumentAndSelfie], vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::DocumentAndSelfie] => true)]
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::DocumentAndSelfie], vec![CDO::Name, CDO::Ssn4, CDO::PartialAddress, CDO::Document] => true)]
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::DocumentAndSelfie], vec![] => true)]
    #[test_case(vec![CDO::Ssn4, CDO::Ssn9], vec![] => false)]
    #[test_case(vec![CDO::PartialAddress, CDO::FullAddress], vec![] => false)]
    #[test_case(vec![CDO::Document, CDO::DocumentAndSelfie], vec![] => false)]
    #[test_case(vec![CDO::DocumentAndSelfie], vec![CDO::DocumentAndSelfie] => true)]
    #[test_case(vec![CDO::DocumentAndSelfie], vec![CDO::Document] => true)]
    #[test_case(vec![CDO::Document], vec![CDO::DocumentAndSelfie] => false)]
    #[test_case(vec![CDO::Ssn4], vec![CDO::Ssn9] => false)]
    #[test_case(vec![CDO::PartialAddress], vec![CDO::FullAddress] => false)]
    fn test(must_collect_data: Vec<CDO>, can_access_data: Vec<CDO>) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data,
            can_access_data,
        };
        req.validate_inner().is_ok()
    }
}

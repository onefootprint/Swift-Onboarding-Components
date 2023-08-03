use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, TenantSessionAuth};
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::errors::AssertionError;
use db::models::ob_configuration::ObConfiguration;
use feature_flag::BoolFlag;
use itertools::Itertools;
use newtypes::CipKind;
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
    cip_kind: Option<CipKind>,
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
                    match cd {
                        CD::Document => {
                            // TODO document permissions are a little different since we don't
                            // represent the options. Here, we only allow decrypting either what's
                            // collected or nothing at all
                            collect == access
                        }
                        _ => {
                            // The options for each CD are ordered in ascending "completeness"
                            let collect_idx = cd.options().iter().position(|cdo| cdo == collect);
                            let access_idx = cd.options().iter().position(|cdo| cdo == access);
                            // maybe enforce doc permissions are all or npthingj
                            collect_idx >= access_idx
                        }
                    }
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
    auth: TenantSessionAuth,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    request.validate()?;
    let tenant = auth.tenant().clone();
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        can_access_data,
        cip_kind,
    } = request.into_inner();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    if is_live && tenant.is_prod_ob_config_restricted {
        return Err(TenantError::CannotCreateProdObConfigs.into());
    }
    let is_alpaca_tenant = state
        .feature_flag_client
        .flag(BoolFlag::IsAlpacaTenant(&tenant_id));
    // TODO: throw error if is_alpaca_tenant and another cip_kind sent up? TODO: restrict cip_kind to integration tenants now?
    let cip_kind = cip_kind.or(is_alpaca_tenant.then_some(CipKind::Alpaca));
    if let Some(cip_kind) = cip_kind {
        validate_for_cip(cip_kind, &must_collect_data)?
    }
    let obc = state
        .db_pool
        .db_query(move |conn| {
            ObConfiguration::create(
                conn,
                name,
                tenant_id,
                must_collect_data,
                can_access_data,
                is_live,
                cip_kind,
            )
        })
        .await??;

    let ff_client = state.feature_flag_client.clone();
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, tenant, None, ff_client)),
    )))
}

fn validate_for_cip(kind: CipKind, must_collect_data: &[CDO]) -> Result<(), TenantError> {
    let missing_cdos = kind
        .required_cdos()
        .into_iter()
        .filter(|c| !must_collect_data.contains(c))
        .collect_vec();
    if !missing_cdos.is_empty() {
        Err(TenantError::MissingCdosForCip(missing_cdos.into(), kind))
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use newtypes::{
        CollectedDataOption as CDO, CountryRestriction, DocTypeRestriction, DocumentCdoInfo, Selfie,
    };
    use test_case::test_case;

    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![CDO::Name, CDO::Ssn4, CDO::PartialAddress, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![] => true)]
    #[test_case(vec![CDO::Ssn4, CDO::Ssn9], vec![] => false)]
    #[test_case(vec![CDO::PartialAddress, CDO::FullAddress], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None)), CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => false)]
    #[test_case(vec![CDO::Ssn4], vec![CDO::Ssn9] => false)]
    #[test_case(vec![CDO::PartialAddress], vec![CDO::FullAddress] => false)]
    fn test(must_collect_data: Vec<CDO>, can_access_data: Vec<CDO>) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data,
            can_access_data,
            cip_kind: None,
        };
        req.validate_inner().is_ok()
    }

    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality] => true)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn4, CDO::FullAddress, CDO::Nationality] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::PartialAddress, CDO::Nationality] => false)]
    #[test_case(CipKind::Apex, vec![] => true)]
    fn test_validate_for_cip(kind: CipKind, must_collect_data: Vec<CDO>) -> bool {
        validate_for_cip(kind, &must_collect_data).is_ok()
    }
}

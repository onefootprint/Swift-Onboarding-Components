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
use newtypes::CollectedDataOption as CDO;
use newtypes::{CipKind, TenantId};
use newtypes::{CollectedData as CD, Iso3166TwoDigitCountryCode};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data: Vec<CDO>,
    optional_data: Option<Vec<CDO>>,
    can_access_data: Vec<CDO>,
    cip_kind: Option<CipKind>,
    is_no_phone_flow: Option<bool>,
    #[serde(default)]
    is_doc_first_flow: bool,
    #[serde(default)]
    allow_international_residents: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
}

impl CreateOnboardingConfigurationRequest {
    const ALLOWED_OPTIONAL_FIELDS: [CDO; 2] = [CDO::Ssn4, CDO::Ssn9];
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

        let optional_data = self.optional_data.clone().unwrap_or(vec![]);
        let unallowed_optional_data_cdos: Vec<_> = optional_data
            .iter()
            .filter(|cdo| !Self::ALLOWED_OPTIONAL_FIELDS.contains(cdo))
            .collect();
        if !unallowed_optional_data_cdos.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "{:?} cannot be optional",
                unallowed_optional_data_cdos
            ))
            .into());
        }

        if self.is_no_phone_flow.unwrap_or(false) {
            let collect_phone = self.must_collect_data.contains(&CDO::PhoneNumber)
                || self
                    .optional_data
                    .as_ref()
                    .map(|od| od.contains(&CDO::PhoneNumber))
                    .unwrap_or(false);
            if collect_phone {
                return Err(TenantError::ValidationError(
                    "Cannot collect phone if is_no_phone_flow is true".to_owned(),
                )
                .into());
            }
        }
        if self.is_doc_first_flow {
            let doc_cdo = self
                .must_collect_data
                .iter()
                .chain(self.optional_data.iter().flatten())
                .find(|cdo| matches!(cdo, CDO::Document(_)));
            if doc_cdo.is_none() {
                return Err(TenantError::ValidationError(
                    "Must collect document if is_doc_first is true".to_owned(),
                )
                .into());
            }

            // it would be really difficult to support the doc-first flow (for now)
            // since we won’t know what document kinds/countries to restrict to until we have the residential address
            if self.allow_international_residents {
                return Err(TenantError::ValidationError(
                    "Cannot have is_doc_first and allow_international_residents".to_owned(),
                )
                .into());
            }
        }

        if self.international_country_restrictions.is_some() && !self.allow_international_residents {
            return Err(TenantError::ValidationError(
                "Cannot specify international_country_restrictions without allow_international_residents"
                    .to_owned(),
            )
            .into());
        }

        // Make sure there's only one CDO per CD, and create a map of CD -> selected CDO
        let must_collect = group_by_parent(self.must_collect_data.clone())?;
        let optional_data = group_by_parent(optional_data)?;
        let can_access = group_by_parent(self.can_access_data.clone())?;

        // Make sure all decryption permissions are a subset of collected data
        CD::iter()
            .map(|cd| {
                let must_collect_cdo = must_collect.get(&cd);
                let optional_cdo = optional_data.get(&cd);
                let can_access_cdo = can_access.get(&cd);

                let collectable_cdo = match (must_collect_cdo, optional_cdo) {
                    (None, None) => Ok::<_, ApiError>(None),
                    (None, Some(c)) => Ok(Some(c)),
                    (Some(c), None) => Ok(Some(c)),
                    (Some(_), Some(_)) => Err(TenantError::ValidationError(format!(
                        "Field {} cannot be included in both must_collect_data and optional_data",
                        cd
                    ))
                    .into()),
                }?;

                let is_valid = match (collectable_cdo, can_access_cdo) {
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
                if !is_valid {
                    Err(TenantError::ValidationError(format!(
                        "Decryptable {} fields must be a subset of collected fields",
                        cd
                    ))
                    .into())
                } else {
                    Ok(())
                }
            })
            .collect::<ApiResult<Vec<_>>>()?;
        Ok(())
    }

    fn validate(&self) -> ApiResult<()> {
        self.validate_inner()?;

        let required_fields = if self.is_no_phone_flow.unwrap_or(false) {
            vec![CDO::Name, CDO::FullAddress, CDO::Email]
        } else {
            vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber]
        };

        // Check for required fields
        let missing_required_fields: Vec<_> = required_fields
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

    fn validate_flags(&self, state: &State, tenant_id: &TenantId) -> ApiResult<()> {
        let is_alpaca_tenant = state
            .feature_flag_client
            .flag(BoolFlag::IsAlpacaTenant(tenant_id));
        // TODO: throw error if is_alpaca_tenant and another cip_kind sent up? TODO: restrict cip_kind to integration tenants now?
        let cip_kind = self.cip_kind.or(is_alpaca_tenant.then_some(CipKind::Alpaca));
        if let Some(cip_kind) = cip_kind {
            validate_for_cip(cip_kind, &self.must_collect_data)?
        }

        let can_make_no_phone_obc = !state.config.service_config.is_production()
            || tenant_id.is_integration_test_tenant()
            || state
                .feature_flag_client
                .flag(BoolFlag::TenantCanMakeNoPhoneObc(tenant_id));
        if self.is_no_phone_flow.unwrap_or(false) && !can_make_no_phone_obc {
            return Err(TenantError::ValidationError(
                "Unable to create config with is_no_phone_flow = true".to_owned(),
            )
            .into());
        }

        let can_make_doc_first = state
            .feature_flag_client
            .flag(BoolFlag::TenantCanMakeDocFirstObc(tenant_id));
        if self.is_doc_first_flow && !can_make_doc_first {
            return Err(TenantError::ValidationError(
                "Unable to create config with is_doc_first = true".to_owned(),
            )
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
    request.validate_flags(&state, &tenant.id)?;
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind,
        is_no_phone_flow,
        is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
    } = request.into_inner();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    if is_live && tenant.is_prod_ob_config_restricted {
        return Err(TenantError::CannotCreateProdObConfigs.into());
    }

    let actor = auth.actor().into();
    let obc = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let obc = ObConfiguration::create(
                conn,
                name,
                tenant_id,
                must_collect_data,
                optional_data.unwrap_or(vec![]),
                can_access_data,
                is_live,
                cip_kind,
                is_no_phone_flow.unwrap_or(false),
                is_doc_first_flow,
                allow_international_residents,
                international_country_restrictions,
                actor,
            )?;
            let obc = db::actor::saturate_actor_nullable(conn, obc)?;
            Ok(obc)
        })
        .await??;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db(obc),
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

    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Name, CDO::Ssn4, CDO::PartialAddress, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => true)]
    #[test_case(vec![CDO::Ssn4, CDO::Ssn9], vec![], vec![] => false)]
    #[test_case(vec![CDO::PartialAddress, CDO::FullAddress], vec![], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None)), CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => false)]
    #[test_case(vec![CDO::Ssn4], vec![], vec![CDO::Ssn9] => false)]
    #[test_case(vec![CDO::PartialAddress], vec![], vec![CDO::FullAddress] => false)]
    // optional_data
    #[test_case(vec![CDO::Name], vec![CDO::Ssn9], vec![] => true; "allow Ssn9 to be optional")]
    #[test_case(vec![CDO::Name], vec![CDO::Ssn4], vec![] => true; "allow Ssn4 to be optional")]
    #[test_case(vec![CDO::Email], vec![CDO::Name], vec![] => false; "don't allow non-SSN CDO's to be optional, for now")]
    #[test_case(vec![CDO::Name, CDO::Ssn9], vec![CDO::Ssn9], vec![] => false; "can't duplicate across must_collect_data and optional_data")]
    #[test_case(vec![CDO::Name, CDO::Ssn9], vec![CDO::Ssn4], vec![] => false; "can't duplicate CDO's with identical parents across must_collect_data and optional_data")]
    #[test_case(vec![CDO::Name], vec![CDO::Ssn9], vec![CDO::Name, CDO::Ssn9] => true; "can_access_data can include CDO's in optional_data")]
    // same basic validations done on must_collect are done on optional_data
    #[test_case(vec![CDO::Name], vec![CDO::Ssn4, CDO::Ssn9], vec![] => false)]
    #[test_case(vec![CDO::Name], vec![CDO::Ssn4], vec![CDO::Ssn9] => false)]
    fn test(must_collect_data: Vec<CDO>, optional_data: Vec<CDO>, can_access_data: Vec<CDO>) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data,
            optional_data: Some(optional_data),
            can_access_data,
            cip_kind: None,
            is_no_phone_flow: Some(false),
            is_doc_first_flow: false,
            allow_international_residents: false,
            international_country_restrictions: None,
        };
        req.validate_inner().is_ok()
    }

    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![], vec![] => true)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], vec![], vec![] => false)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![CDO::PhoneNumber], vec![] => false)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![], vec![CDO::PhoneNumber] => false)]
    fn test_is_no_phone_flow(
        must_collect_data: Vec<CDO>,
        optional_data: Vec<CDO>,
        can_access_data: Vec<CDO>,
    ) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data,
            optional_data: Some(optional_data),
            can_access_data,
            cip_kind: None,
            is_no_phone_flow: Some(true),
            is_doc_first_flow: false,
            allow_international_residents: false,
            international_country_restrictions: None,
        };
        req.validate().is_ok()
    }

    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], false => true)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], true => false)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], vec![], false => false)]
    fn test_is_doc_first(
        must_collect_data: Vec<CDO>,
        can_access_data: Vec<CDO>,
        allow_international: bool,
    ) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data,
            optional_data: None,
            can_access_data,
            cip_kind: None,
            is_no_phone_flow: Some(false),
            is_doc_first_flow: true,
            allow_international_residents: allow_international,
            international_country_restrictions: None,
        };
        req.validate().is_ok()
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

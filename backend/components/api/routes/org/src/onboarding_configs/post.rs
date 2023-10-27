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
use newtypes::{
    AdverseMediaListKind, CipKind, DataIdentifierDiscriminant, EnhancedAml, ObConfigurationKind, TenantId,
};
use newtypes::{CollectedData as CD, Iso3166TwoDigitCountryCode};
use newtypes::{CollectedDataOption as CDO, EnhancedAmlOption};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
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
    #[serde(default)]
    skip_kyc: bool,
    #[serde(default)]
    doc_scan_for_optional_ssn: Option<CDO>,
    #[serde(default)]
    enhanced_aml: Option<EnhancedAml>,
    // TODO: drop this option
    allow_us_residents: Option<bool>,
    // TODO: drop this option
    allow_us_territory_residents: Option<bool>,
    kind: Option<ObConfigurationKind>,
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

        let optional_data = self.optional_data.clone().unwrap_or_default();
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
        let doc_cdo = self
            .must_collect_data
            .iter()
            .find(|cdo| matches!(cdo, CDO::Document(_)));

        if self.is_doc_first_flow {
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

        if self.skip_kyc && !self.allow_international_residents && doc_cdo.is_none() {
            return Err(TenantError::ValidationError(
                "Cannot specify skip_kyc if allow_international_residents=false and no Document is collected in must_collect_data"
                    .to_owned(),
            )
            .into());
        }

        self.validate_countries()?;

        // Optional ssn
        if [CDO::Ssn4, CDO::Ssn9]
            .iter()
            .any(|ssn_cdo| optional_data.contains(ssn_cdo))
        {
            if doc_cdo.is_some() && self.doc_scan_for_optional_ssn.is_some() {
                return Err(TenantError::ValidationError(
                    "Cannot specify doc_scan_for_optional_ssn if already collecting a document".to_owned(),
                )
                .into());
            }

            if self
                .doc_scan_for_optional_ssn
                .as_ref()
                .map(|cdo| !matches!(cdo, CDO::Document(_)))
                .unwrap_or(false)
            {
                return Err(TenantError::ValidationError(
                    "doc_scan_for_optional_ssn must be a Document collected data option".to_owned(),
                )
                .into());
            }
        } else if self.doc_scan_for_optional_ssn.is_some() {
            return Err(TenantError::ValidationError(
                "Cannot specify doc_scan_for_optional_ssn if Ssn4 or Ssn9 is not optional".to_owned(),
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

    fn validate(&self, kind: ObConfigurationKind) -> ApiResult<()> {
        self.validate_inner()?;

        let required_fields = match kind {
            ObConfigurationKind::Auth => {
                vec![CDO::Email, CDO::PhoneNumber]
            }
            ObConfigurationKind::Kyb => {
                vec![CDO::BusinessName, CDO::BusinessAddress]
            }
            ObConfigurationKind::Kyc => {
                if self.is_no_phone_flow.unwrap_or(false) {
                    vec![CDO::Name, CDO::FullAddress, CDO::Email]
                } else {
                    vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber]
                }
            }
        };

        self.validate_enhanced_aml()?;

        // Check for required fields
        let missing_required_fields: Vec<_> = required_fields
            .into_iter()
            .filter(|x| !self.must_collect_data.contains(x))
            .collect();
        if !missing_required_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "Playbook must collect {:?}",
                missing_required_fields
            ))
            .into());
        }
        Ok(())
    }

    fn validate_enhanced_aml(&self) -> ApiResult<()> {
        if let Some(r) = &self.enhanced_aml {
            if !r.enhanced_aml && (r.adverse_media || r.ofac || r.pep) {
                return Err(TenantError::ValidationError(
                    "cannot set adverse_media, ofac, or pep if enhanced_aml = false".to_owned(),
                )
                .into());
            }
            if r.enhanced_aml && !(r.adverse_media || r.ofac || r.pep) {
                return Err(TenantError::ValidationError(
                    "at least one of adverse_media, ofac, or pep must be set if enhanced_aml = true"
                        .to_owned(),
                )
                .into());
            }
        }

        Ok(())
    }

    fn validate_countries(&self) -> ApiResult<()> {
        if self.allow_us_residents == Some(false) && !self.allow_international_residents {
            return Err(TenantError::ValidationError(
                "Must set one of allow_us_residents or allow_international_residents to true".to_owned(),
            )
            .into());
        }

        if let Some(country_restrictions) = self.international_country_restrictions.as_ref() {
            if !self.allow_international_residents {
                return Err(TenantError::ValidationError(
                    "Cannot specify international_country_restrictions without allow_international_residents"
                        .to_owned(),
                )
                .into());
            }

            if country_restrictions.is_empty() {
                return Err(TenantError::ValidationError(
                    "Must specify 1 or more countries in international_country_restrictions".to_owned(),
                )
                .into());
            }
        }

        if self.allow_us_territory_residents == Some(true)
            && self.international_country_restrictions.is_none()
            && self.allow_international_residents
        {
            return Err(TenantError::ValidationError(
                "Specifying allow_us_territory_residents with allow_international_residents is redundant"
                    .to_owned(),
            )
            .into());
        }
        Ok(())
    }

    fn validate_flags(&self, state: &State, tenant_id: &TenantId) -> ApiResult<()> {
        if matches!(self.kind, Some(ObConfigurationKind::Auth)) {
            // Not strictly necessary, but just a warm-up for better per-config-kind validation
            let unallowed_flags = vec![
                (self.is_no_phone_flow == Some(true), "is_no_phone_flow"),
                (self.is_doc_first_flow, "is_doc_first_flow"),
                (
                    self.allow_international_residents,
                    "allow_international_residents",
                ),
                (
                    self.international_country_restrictions.is_some(),
                    "international_country_restrictions",
                ),
                (self.skip_kyc, "skip_kyc"),
                (
                    self.enhanced_aml.as_ref().is_some_and(|e| e.enhanced_aml),
                    "enhanced_aml",
                ),
            ];
            if let Some((_, f)) = unallowed_flags.into_iter().find(|(v, _)| *v) {
                return Err(
                    TenantError::ValidationError(format!("Cannot provide {} on auth playbook", f)).into(),
                );
            }
        }

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
        skip_kyc,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        allow_us_residents,
        allow_us_territory_residents,
        kind,
    } = request.clone();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    let is_kyc = must_collect_data
        .iter()
        .all(|d| d.parent().data_identifier_kind() != DataIdentifierDiscriminant::Business);
    let is_kyb = must_collect_data
        .iter()
        .any(|d| d.parent().data_identifier_kind() == DataIdentifierDiscriminant::Business);
    if is_live && tenant.is_prod_ob_config_restricted && is_kyc {
        return Err(TenantError::CannotCreateProdKycPlaybook.into());
    }
    if is_live && tenant.is_prod_kyb_playbook_restricted && is_kyb {
        return Err(TenantError::CannotCreateProdKybPlaybook.into());
    }
    // Newer auth playbooks will have the kind specified in API
    // TODO deprecate this when we start receiving the kind from all requests
    let kind = kind.unwrap_or(if is_kyc {
        ObConfigurationKind::Kyc
    } else {
        ObConfigurationKind::Kyb
    });

    request.validate(kind)?;

    // Hard coded for now until we expose in playbooks. TODO: could maybe have "tenant defaults" expressed in our code where we could map tenants to default invariants for them
    // like Coba should always have skip_kyc=true. Probably better than doing this purely via PG or via feature flags
    let skip_kyc = skip_kyc
        || state
            .feature_flag_client
            .flag(BoolFlag::IsSkipKycTenant(&tenant_id));

    let enhanced_aml = enhanced_aml
        .map(|r| r.into())
        .or(hardcoded_tenant_enhanced_aml_option(&tenant_id))
        .unwrap_or(EnhancedAmlOption::No);

    let actor = auth.actor().into();
    let obc = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let skip_kyb = false;
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
                skip_kyc,
                doc_scan_for_optional_ssn,
                enhanced_aml,
                // TODO: remove these once frontend is merged
                allow_us_residents.unwrap_or(true),
                allow_us_territory_residents.unwrap_or(false),
                kind,
                skip_kyb,
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
    } else if kind == CipKind::Alpaca
        && must_collect_data
            .iter()
            .any(|cdo| matches!(cdo, CDO::Document(_)))
    {
        Err(TenantError::ValidationError(
            "Cannot specify documents in Playbook and be using an Alpaca CIP".to_owned(),
        ))
    } else {
        Ok(())
    }
}

fn hardcoded_tenant_enhanced_aml_option(tenant_id: &TenantId) -> Option<EnhancedAmlOption> {
    if tenant_id.is_coba() {
        Some(EnhancedAmlOption::Yes {
            ofac: true,
            pep: true,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        })
    } else if tenant_id.is_composer() {
        Some(EnhancedAmlOption::Yes {
            ofac: true,
            pep: true,
            adverse_media: true,
            continuous_monitoring: false,
            adverse_media_lists: Some(vec![
                AdverseMediaListKind::FinancialCrime,
                AdverseMediaListKind::Fraud,
            ]),
        })
    } else {
        None
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
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Name, CDO::Ssn4, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => true)]
    #[test_case(vec![CDO::Ssn4, CDO::Ssn9], vec![], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None)), CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => false)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
    #[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => false)]
    #[test_case(vec![CDO::Ssn4], vec![], vec![CDO::Ssn9] => false)]
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
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: Some(EnhancedAml::default()),
            allow_us_residents: Some(true),
            allow_us_territory_residents: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
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
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: Some(EnhancedAml::default()),
            allow_us_residents: Some(true),
            allow_us_territory_residents: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
        };
        req.validate(ObConfigurationKind::Kyc).is_ok()
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
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: Some(EnhancedAml::default()),
            allow_us_residents: Some(true),
            allow_us_territory_residents: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
        };
        req.validate(ObConfigurationKind::Kyc).is_ok()
    }

    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], true => true)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], false => true)]
    #[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], false => false)]
    fn test_skip_kyc(must_collect_data: Vec<CDO>, allow_international: bool) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data: must_collect_data.clone(),
            optional_data: None,
            can_access_data: must_collect_data,
            cip_kind: None,
            is_no_phone_flow: Some(false),
            is_doc_first_flow: false,
            allow_international_residents: allow_international,
            international_country_restrictions: None,
            skip_kyc: true,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: Some(EnhancedAml::default()),
            allow_us_residents: Some(true),
            allow_us_territory_residents: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
        };
        req.validate(ObConfigurationKind::Kyc).is_ok()
    }

    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality] => true)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn4, CDO::FullAddress, CDO::Nationality] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::Nationality] => false)]
    #[test_case(CipKind::Apex, vec![] => true)]
    fn test_validate_for_cip(kind: CipKind, must_collect_data: Vec<CDO>) -> bool {
        validate_for_cip(kind, &must_collect_data).is_ok()
    }
}

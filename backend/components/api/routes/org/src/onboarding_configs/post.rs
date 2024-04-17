use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::{tenant::TenantError, ApiError, ApiResult},
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{
    decision::rule_engine,
    errors::{AssertionError, ValidationError},
    telemetry::RootSpan,
};
use db::models::{ob_configuration::ObConfiguration, rule_set_version::RuleSetVersion};
use feature_flag::BoolFlag;
use itertools::Itertools;
use newtypes::{
    output::Csv, AdverseMediaListKind, CipKind, CollectedData as CD, CollectedDataOption as CDO,
    CollectedDataOptionKind as CDOK, DataIdentifier, DataIdentifierDiscriminant,
    DocumentAndCountryConfiguration, DocumentKind, DocumentRequestConfig, EnhancedAml, EnhancedAmlOption,
    Iso3166TwoDigitCountryCode, ObConfigurationKind, TenantId,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
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
    allow_us_territories: Option<bool>,
    kind: Option<ObConfigurationKind>,
    skip_confirm: Option<bool>,
    document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    #[serde(default)]
    documents_to_collect: Vec<DocumentRequestConfig>,
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

        self.validate_documents()?;

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
        // TODO make sure we aren't decrypting more than can access?
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

    fn validate_documents(&self) -> ApiResult<()> {
        let docs = &self.documents_to_collect;
        if docs
            .iter()
            .any(|d| matches!(d, DocumentRequestConfig::Identity { .. }))
        {
            return ValidationError(
                "Cannot yet provide ID document configs here. Please use must_collect_data instead.",
            )
            .into();
        }

        if docs
            .iter()
            .filter(|d| matches!(d, DocumentRequestConfig::ProofOfAddress { .. }))
            .count()
            > 1
        {
            return ValidationError("Can only collect one proof of address doc").into();
        }

        if docs
            .iter()
            .filter(|d| matches!(d, DocumentRequestConfig::ProofOfSsn { .. }))
            .count()
            > 1
        {
            return ValidationError("Can only collect one proof of SSN doc").into();
        }

        // Custom doc validation

        let custom_docs = docs
            .iter()
            .filter_map(|d| match d {
                DocumentRequestConfig::Custom(i) => Some(i),
                _ => None,
            })
            .collect_vec();

        let num_identifiers = custom_docs.iter().map(|d| &d.identifier).unique().count();
        if num_identifiers != custom_docs.len() {
            return ValidationError("Cannot specify the same identifier for multiple custom documents")
                .into();
        }
        if custom_docs
            .iter()
            .any(|d| !matches!(d.identifier, DataIdentifier::Document(DocumentKind::Custom(_))))
        {
            return ValidationError(
                "Must use identifier starting with document.custom. for custom documents",
            )
            .into();
        }
        if custom_docs.iter().any(|d| d.name.is_empty()) {
            return ValidationError("Custom document name cannot be empty").into();
        }

        Ok(())
    }

    fn validate(&self, kind: ObConfigurationKind) -> ApiResult<()> {
        self.validate_inner()?;
        self.validate_enhanced_aml()?;
        self.validate_kind(kind)?;
        Ok(())
    }

    fn get_enhanced_aml(&self, tenant_id: &TenantId) -> EnhancedAmlOption {
        self.enhanced_aml
            .clone()
            .map(|r| r.into())
            .or(hardcoded_tenant_enhanced_aml_option(tenant_id))
            .unwrap_or(EnhancedAmlOption::No)
    }

    fn validate_kind(&self, kind: ObConfigurationKind) -> ApiResult<()> {
        // Check for required fields based on playbook kind
        let required_fields = match kind {
            ObConfigurationKind::Auth => vec![CDOK::Email, CDOK::PhoneNumber],
            ObConfigurationKind::Kyb => vec![CDOK::BusinessName, CDOK::BusinessAddress],
            ObConfigurationKind::Kyc => {
                if self.is_no_phone_flow.unwrap_or(false) {
                    vec![CDOK::Name, CDOK::FullAddress, CDOK::Email]
                } else {
                    vec![CDOK::Name, CDOK::FullAddress, CDOK::Email, CDOK::PhoneNumber]
                }
            }
            ObConfigurationKind::Document => vec![CDOK::Document],
        };
        let missing_required_fields: Vec<_> = required_fields
            .into_iter()
            .filter(|x| !self.must_collect_data.iter().map(CDOK::from).contains(x))
            .collect();
        if !missing_required_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "Playbook of kind {} must collect {}",
                kind,
                Csv(missing_required_fields)
            ))
            .into());
        }

        // Check for disallowed fields based on playbook kind
        let is_field_allowed = match kind {
            ObConfigurationKind::Auth => |cdo: &CDO| -> bool { matches!(cdo, CDO::Email | CDO::PhoneNumber) },
            ObConfigurationKind::Kyb => |_: &CDO| -> bool { true },
            ObConfigurationKind::Kyc => |cdo: &CDO| -> bool {
                cdo.parent().data_identifier_kind() != DataIdentifierDiscriminant::Business
            },
            ObConfigurationKind::Document => |cdo: &CDO| -> bool { matches!(cdo, CDO::Document(_)) },
        };
        let collected_disallowed_fields = self
            .must_collect_data
            .iter()
            .filter(|&cdo| !is_field_allowed(cdo))
            .cloned()
            .collect_vec();
        if !collected_disallowed_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "Playbooks of kind {} cannot collect {}",
                kind,
                Csv(collected_disallowed_fields),
            ))
            .into());
        }

        // Document playbooks must not run KYC
        if kind == ObConfigurationKind::Document {
            if !self.skip_kyc {
                return Err(ValidationError("Playbook of kind document must skip KYC").into());
            }
            if !self.skip_confirm.unwrap_or(false) {
                return Err(ValidationError("Playbook of kind document must skip confirm").into());
            }
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

        if self.allow_us_territories == Some(true)
            && self.international_country_restrictions.is_none()
            && self.allow_international_residents
        {
            return Err(TenantError::ValidationError(
                "Specifying allow_us_territories with allow_international_residents is redundant".to_owned(),
            )
            .into());
        }
        Ok(())
    }

    fn validate_for_cip(&self, kind: CipKind, enhanced_aml: EnhancedAmlOption) -> Result<(), TenantError> {
        validate_must_collect_for_cip(kind, &self.must_collect_data)?;

        // Residency
        if self.allow_international_residents {
            return Err(TenantError::ValidationError(
                "Cannot create Alpaca playbook with allow_international_residents=true".to_owned(),
            ));
        };

        if !(self.allow_us_residents.unwrap_or(false) && self.allow_us_territories.unwrap_or(false)) {
            return Err(TenantError::ValidationError(
                "Cannot create Alpaca playbook without allow_us_residents=true && allow_us_territories=true"
                    .to_owned(),
            ));
        };

        // Document
        let doc_cdo = self
            .must_collect_data
            .iter()
            .find(|cdo| matches!(cdo, CDO::Document(_)));

        if doc_cdo.is_some() {
            return Err(TenantError::ValidationError(
                "Cannot collect document for Alpaca playbook".to_owned(),
            ));
        }
        // AML
        match enhanced_aml {
            EnhancedAmlOption::No => Err(TenantError::ValidationError(
                "Must choose EnhancedAmlOption Alpaca playbook".to_owned(),
            )),
            EnhancedAmlOption::Yes {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring: _,
                adverse_media_lists: _,
            } => {
                if !(ofac && pep && adverse_media) {
                    Err(TenantError::ValidationError(
                        "Must run OFAC/PEP/AdverseMedia for Alpaca playbook".to_owned(),
                    ))
                } else {
                    Ok(())
                }
            }
        }
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
                (self.skip_confirm.unwrap_or(false), "skip_confirm"),
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
            self.validate_for_cip(cip_kind, self.get_enhanced_aml(tenant_id))?
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
    tags(Playbooks, Organization, Private)
)]
#[post("/org/onboarding_configs")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateOnboardingConfigurationRequest>,
    root_span: RootSpan,
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
        enhanced_aml: _, // validated/set elsewhere
        allow_us_residents,
        allow_us_territories,
        kind,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect,
    } = request.clone();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    let is_kyc = must_collect_data
        .iter()
        .all(|d| d.parent().data_identifier_kind() != DataIdentifierDiscriminant::Business);
    // Newer auth playbooks will have the kind specified in API
    // TODO deprecate this when we start receiving the kind from all requests
    match &kind {
        None => root_span.record("meta", "without_kind"),
        Some(_) => root_span.record("meta", "with_kind"),
    };
    let kind = kind.unwrap_or(if is_kyc {
        ObConfigurationKind::Kyc
    } else {
        ObConfigurationKind::Kyb
    });

    let restrictions = vec![
        (tenant.is_prod_ob_config_restricted, ObConfigurationKind::Kyc),
        (tenant.is_prod_ob_config_restricted, ObConfigurationKind::Document), // Separate flag?
        (tenant.is_prod_kyb_playbook_restricted, ObConfigurationKind::Kyb),
        (tenant.is_prod_auth_playbook_restricted, ObConfigurationKind::Auth),
    ];
    for (is_restricted, restricted_kind) in restrictions {
        if is_live && is_restricted && kind == restricted_kind {
            return Err(TenantError::CannotCreateProdPlaybook(kind).into());
        }
    }
    request.validate(kind)?;

    // Hard coded for now until we expose in playbooks. TODO: could maybe have "tenant defaults" expressed in our code where we could map tenants to default invariants for them
    // like Coba should always have skip_kyc=true. Probably better than doing this purely via PG or via feature flags
    let skip_kyc = skip_kyc
        || state
            .feature_flag_client
            .flag(BoolFlag::IsSkipKycTenant(&tenant_id));

    let actor = auth.actor().into();
    let ff_client = state.feature_flag_client.clone();
    let (obc, actor, rs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let skip_kyb = false;
            let obc: ObConfiguration = ObConfiguration::create(
                conn,
                name,
                tenant_id.clone(),
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
                request.get_enhanced_aml(&tenant_id),
                // TODO: remove these once frontend is merged
                allow_us_residents.unwrap_or(true),
                allow_us_territories.unwrap_or(false),
                kind,
                skip_kyb,
                skip_confirm.unwrap_or(false),
                document_types_and_countries,
                documents_to_collect,
            )?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, Some(ff_client))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc.into_inner())?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.feature_flag_client.clone())),
    )))
}

fn validate_must_collect_for_cip(kind: CipKind, must_collect_data: &[CDO]) -> Result<(), TenantError> {
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
    use std::str::FromStr;

    use super::*;
    use newtypes::{
        CollectedDataOption as CDO, CountryRestriction, CustomDocumentConfig, DocTypeRestriction,
        DocumentCdoInfo, Selfie,
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
            allow_us_territories: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
            skip_confirm: None,
            document_types_and_countries: None,
            documents_to_collect: vec![],
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
            allow_us_territories: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
            skip_confirm: None,
            document_types_and_countries: None,
            documents_to_collect: vec![],
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
            allow_us_territories: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
            skip_confirm: None,
            document_types_and_countries: None,
            documents_to_collect: vec![],
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
            allow_us_territories: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
            skip_confirm: None,
            document_types_and_countries: None,
            documents_to_collect: vec![],
        };
        req.validate(ObConfigurationKind::Kyc).is_ok()
    }

    #[test_case(vec![] => true)]
    #[test_case(vec![DocumentRequestConfig::Identity{ collect_selfie: true }] => false)]
    #[test_case(vec![DocumentRequestConfig::ProofOfAddress {}, DocumentRequestConfig::ProofOfSsn {}, DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.bye").unwrap(), name: "Bye".to_owned(), description: None})] => true; "proofofssn-proofofaddress-multiple-custom")]
    #[test_case(vec![DocumentRequestConfig::ProofOfAddress {}, DocumentRequestConfig::ProofOfAddress {}] => false)]
    #[test_case(vec![DocumentRequestConfig::ProofOfSsn {}, DocumentRequestConfig::ProofOfSsn {}] => false)]
    #[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None})] => false; "two-custom-with-same-di")]
    #[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "".to_owned(), description: None})] => false; "custom-with-empty-name")]
    #[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("custom.hi").unwrap(), name: "Hi".to_owned(), description: None})] => false; "custom-with-non-doc-DI")]
    fn test_documents(documents_to_collect: Vec<DocumentRequestConfig>) -> bool {
        let req = CreateOnboardingConfigurationRequest {
            name: "Flerp".to_owned(),
            must_collect_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
            optional_data: None,
            can_access_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
            cip_kind: None,
            is_no_phone_flow: Some(false),
            is_doc_first_flow: false,
            allow_international_residents: false,
            international_country_restrictions: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: Some(EnhancedAml::default()),
            allow_us_residents: Some(true),
            allow_us_territories: Some(false),
            kind: Some(ObConfigurationKind::Kyc),
            skip_confirm: None,
            document_types_and_countries: None,
            documents_to_collect,
        };
        req.validate(ObConfigurationKind::Kyc).is_ok()
    }

    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality] => true)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn4, CDO::FullAddress, CDO::Nationality] => false)]
    #[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::Nationality] => false)]
    #[test_case(CipKind::Apex, vec![] => true)]
    fn test_validate_for_cip(kind: CipKind, must_collect_data: Vec<CDO>) -> bool {
        validate_must_collect_for_cip(kind, &must_collect_data).is_ok()
    }
}

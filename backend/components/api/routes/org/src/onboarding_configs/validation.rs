use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::errors::tenant::TenantError;
use api_core::FpError;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequestInto;
use api_errors::ServerErr;
use api_wire_types::CreateOnboardingConfigurationRequest;
use api_wire_types::Patch;
use db::models::ob_configuration::IsLive;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::VerificationChecks;
use db::models::tenant::Tenant;
use feature_flag::BoolFlag;
use itertools::chain;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::sentilink::SentilinkProduct;
use newtypes::AuthMethodKind;
use newtypes::CipKind;
use newtypes::CollectedData as CD;
use newtypes::CollectedDataOption as CDO;
use newtypes::CollectedDataOptionKind as CDOK;
use newtypes::DataIdentifier;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::DbActor;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAmlOption;
use newtypes::ObConfigurationKind;
use newtypes::TenantId;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[derive(derive_more::Deref)]
/// Wrapper around NewObConfigurationArgs to perform some validation
pub struct ObConfigurationArgsToValidate(pub(super) NewObConfigurationArgs);

// TODO: refactor this so it's closer to models.
impl ObConfigurationArgsToValidate {
    const ALLOWED_OPTIONAL_FIELDS: [CDO; 2] = [CDO::Ssn4, CDO::Ssn9];

    pub fn validate(
        state: &State,
        args: NewObConfigurationArgs,
        tenant: &Tenant,
        is_live: IsLive,
        tvc: &TenantVendorControl,
    ) -> FpResult<NewObConfigurationArgs> {
        let args: ObConfigurationArgsToValidate = Self(args);

        args.validate_inner()?;
        args.validate_kind()?;
        args.validate_flags(state, &tenant.id)?;
        args.validate_tenant_restrictions(tenant, is_live)?;
        args.validate_checks(tvc, is_live)?;
        args.validate_required_auth_methods()?;
        Ok(args.0)
    }

    /// Core validation business logic, separated from checking simple required fields
    pub(super) fn validate_inner(&self) -> FpResult<()> {
        let group_by_parent = |cdos: Vec<CDO>| {
            cdos
            .into_iter()
            .map(|cdo| (cdo.parent(), cdo))
            .into_group_map()
            .into_iter()
            .map(|(cd, cdos)| -> FpResult<(CD, CDO)>  {
            if cdos.len() > 1 {
                Err(TenantError::ValidationError(format!(
                    "Cannot provide both {} and {}",
                    cdos[0], cdos[1]
                ))
                .into())
            } else {
                let cdo = cdos.into_iter().next().ok_or(ServerErr("No CDO for CD"))?;
                 Ok((cd, cdo))
            }})
            // Find the CDO parents that have more than one option specified
            .collect::<FpResult<HashMap<_, _>>>()
        };

        let optional_data = self.optional_data.clone();
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

        if self.is_no_phone_flow {
            let collect_phone = self.must_collect_data.contains(&CDO::PhoneNumber)
                || self.optional_data.contains(&CDO::PhoneNumber);
            if collect_phone {
                return Err(TenantError::ValidationError(
                    "Cannot collect phone if is_no_phone_flow is true".to_owned(),
                )
                .into());
            }
        }

        let is_collecting_doc = self.collects_document();
        if self.is_doc_first {
            // We need to collect a document for doc_first playbooks
            if !is_collecting_doc {
                return Err(TenantError::ValidationError(
                    "Must collect document if is_doc_first is true".to_owned(),
                )
                .into());
            }
        }

        if self.verification_checks.skip_kyc()
            && !self.allow_international_residents
            && !is_collecting_doc
            && self.kind != ObConfigurationKind::Kyb
        {
            return Err(TenantError::ValidationError(
                "Can only skip_kyc if allow_international_residents or Document is collected or kind is Kyb"
                    .to_owned(),
            )
            .into());
        }

        self.validate_documents()?;

        self.validate_countries()?;

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
                    (None, None) => Ok::<_, FpError>(None),
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
            .collect::<FpResult<Vec<_>>>()?;
        Ok(())
    }

    fn collects_document(&self) -> bool {
        // WIP while we are migrating to documents_to_collect
        let has_document_cdo = self
            .must_collect_data
            .iter()
            .any(|d| CDOK::from(d) == CDOK::Document);
        let has_other_document = !self.documents_to_collect.is_empty();
        has_document_cdo || has_other_document
    }

    fn validate_documents(&self) -> FpResult<()> {
        if self
            .documents_to_collect
            .iter()
            .any(|d| matches!(d, DocumentRequestConfig::Identity { .. }))
        {
            return BadRequestInto(
                "Cannot yet provide ID document configs here. Please use must_collect_data instead.",
            );
        }

        DocumentRequestConfig::validate(&self.documents_to_collect)?;
        Ok(())
    }

    fn validate_kind(&self) -> FpResult<()> {
        // Check for required fields based on playbook kind
        let required_fields = match self.kind {
            ObConfigurationKind::Auth => vec![CDOK::Email, CDOK::PhoneNumber],
            ObConfigurationKind::Kyb => vec![CDOK::BusinessName],
            ObConfigurationKind::Kyc => {
                if self.is_no_phone_flow {
                    vec![CDOK::Name, CDOK::FullAddress, CDOK::Email]
                } else {
                    vec![CDOK::Name, CDOK::FullAddress, CDOK::Email, CDOK::PhoneNumber]
                }
            }
            ObConfigurationKind::Document => vec![],
        };
        let missing_required_fields: Vec<_> = required_fields
            .into_iter()
            .filter(|x| !self.must_collect_data.iter().map(CDOK::from).contains(x))
            .collect();
        if !missing_required_fields.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "Playbook of kind {} must collect {}",
                self.kind,
                Csv(missing_required_fields)
            ))
            .into());
        }

        if self.kind == ObConfigurationKind::Document && !self.collects_document() {
            return BadRequestInto("Playbook of kind document must collect document");
        }

        // Check for disallowed fields based on playbook kind
        let is_field_allowed = match self.kind {
            ObConfigurationKind::Auth => |cdo: &CDO| -> bool { matches!(cdo, CDO::Email | CDO::PhoneNumber) },
            ObConfigurationKind::Kyb => |_: &CDO| -> bool { true },
            ObConfigurationKind::Kyc => |cdo: &CDO| -> bool { !cdo.matches(DID::Business) },
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
                self.kind,
                Csv(collected_disallowed_fields),
            ))
            .into());
        }

        // Document playbooks must not run KYC
        if self.kind == ObConfigurationKind::Document && !self.verification_checks.skip_kyc() {
            return BadRequestInto("Playbook of kind document must skip KYC");
        }

        // KYB playbooks have some additional rules around collecting KYC data
        if self.kind == ObConfigurationKind::Kyb {
            let has_bo_cdo = (self.must_collect_data).contains(&CDO::BusinessKycedBeneficialOwners);
            let collecting_kyc_data = self.must_collect_data.iter().any(|cdo| cdo.matches(DID::Id));

            if has_bo_cdo != collecting_kyc_data {
                return BadRequestInto("If collecting KYC data, must collect from all beneficial owners");
            }
            if !self.verification_checks.skip_kyc() && !has_bo_cdo {
                return BadRequestInto("Must skip KYC if not collecting BOs");
            }
            if self.verification_checks.skip_kyc() && has_bo_cdo {
                return BadRequestInto("Must run KYC if collecting BOs");
            }
        }

        if !self.business_documents_to_collect.is_empty() && self.kind != ObConfigurationKind::Kyb {
            return BadRequestInto("Cannot collect business documents in non-KYB playbook");
        }

        Ok(())
    }

    fn validate_countries(&self) -> FpResult<()> {
        if !self.allow_us_residents && !self.allow_international_residents {
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

        if self.allow_us_territory_residents
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

    pub(super) fn validate_for_cip(&self, kind: CipKind) -> Result<(), TenantError> {
        let missing_cdos = kind
            .required_cdos()
            .into_iter()
            .filter(|c| !self.must_collect_data.contains(c))
            .collect_vec();
        if !missing_cdos.is_empty() {
            return Err(TenantError::MissingCdosForCip(missing_cdos.into(), kind));
        } else if kind == CipKind::Alpaca
            && self
                .must_collect_data
                .iter()
                .any(|cdo| matches!(cdo, CDO::Document(_)))
        {
            return Err(TenantError::ValidationError(
                "Cannot specify documents in Playbook and be using an Alpaca CIP".to_owned(),
            ));
        }

        // Residency
        if self.allow_international_residents {
            return Err(TenantError::ValidationError(
                "Cannot create Alpaca playbook with allow_international_residents=true".to_owned(),
            ));
        };

        if !(self.allow_us_residents && self.allow_us_territory_residents) {
            return Err(TenantError::ValidationError(
                "Cannot create Alpaca playbook without allow_us_residents=true && allow_us_territories=true"
                    .to_owned(),
            ));
        };

        // Document
        if self.collects_document() {
            return Err(TenantError::ValidationError(
                "Cannot collect document for Alpaca playbook".to_owned(),
            ));
        }
        // AML
        match self.verification_checks.enhanced_aml() {
            EnhancedAmlOption::No => Err(TenantError::ValidationError(
                "Must choose EnhancedAmlOption Alpaca playbook".to_owned(),
            )),
            EnhancedAmlOption::Yes {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring: _,
                adverse_media_lists: _,
                match_kind: _,
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

    pub(super) fn validate_flags(&self, state: &State, tenant_id: &TenantId) -> FpResult<()> {
        if matches!(self.kind, ObConfigurationKind::Auth) {
            // Not strictly necessary, but just a warm-up for better per-config-kind validation
            let unallowed_flags = vec![
                (self.is_no_phone_flow, "is_no_phone_flow"),
                (self.is_doc_first, "is_doc_first_flow"),
                (
                    self.allow_international_residents,
                    "allow_international_residents",
                ),
                (
                    self.international_country_restrictions.is_some(),
                    "international_country_restrictions",
                ),
                (self.verification_checks.skip_kyc(), "skip_kyc"),
                (
                    matches!(
                        self.verification_checks.enhanced_aml(),
                        EnhancedAmlOption::Yes { .. }
                    ),
                    "enhanced_aml",
                ),
                (self.skip_confirm, "skip_confirm"),
            ];
            if let Some((_, f)) = unallowed_flags.into_iter().find(|(v, _)| *v) {
                return Err(
                    TenantError::ValidationError(format!("Cannot provide {} on auth playbook", f)).into(),
                );
            }
        }

        let is_alpaca_tenant = state.ff_client.flag(BoolFlag::IsAlpacaTenant(tenant_id));
        // TODO: throw error if is_alpaca_tenant and another cip_kind sent up? TODO: restrict cip_kind to
        // integration tenants now?
        let cip_kind = self.cip_kind.or(is_alpaca_tenant.then_some(CipKind::Alpaca));

        if let Some(cip_kind) = cip_kind {
            self.validate_for_cip(cip_kind)?
        }

        let can_make_no_phone_obc = !state.config.service_config.is_production()
            || tenant_id.is_integration_test_tenant()
            || state.ff_client.flag(BoolFlag::TenantCanMakeNoPhoneObc(tenant_id));
        if self.is_no_phone_flow && !can_make_no_phone_obc {
            return Err(TenantError::ValidationError(
                "Unable to create config with is_no_phone_flow = true".to_owned(),
            )
            .into());
        }

        let can_make_doc_first = state
            .ff_client
            .flag(BoolFlag::TenantCanMakeDocFirstObc(tenant_id));
        if self.is_doc_first && !can_make_doc_first {
            return Err(TenantError::ValidationError(
                "Unable to create config with is_doc_first = true".to_owned(),
            )
            .into());
        }

        Ok(())
    }

    pub(super) fn validate_tenant_restrictions(&self, tenant: &Tenant, is_live: IsLive) -> FpResult<()> {
        let restrictions = vec![
            (tenant.is_prod_ob_config_restricted, ObConfigurationKind::Kyc),
            (tenant.is_prod_ob_config_restricted, ObConfigurationKind::Document), // Separate flag?
            (tenant.is_prod_kyb_playbook_restricted, ObConfigurationKind::Kyb),
            (tenant.is_prod_auth_playbook_restricted, ObConfigurationKind::Auth),
        ];
        for (is_restricted, restricted_kind) in restrictions {
            if is_live && is_restricted && self.kind == restricted_kind {
                return Err(TenantError::CannotCreateProdPlaybook(self.kind).into());
            }
        }
        Ok(())
    }

    pub(super) fn validate_checks(&self, tvc: &TenantVendorControl, obc_is_live: bool) -> FpResult<()> {
        let duplicates: Vec<VerificationCheckKind> = self
            .verification_checks
            .clone()
            .into_inner()
            .into_iter()
            .fold(HashMap::new(), |mut acc: HashMap<_, _>, check| {
                *acc.entry(VerificationCheckKind::from(check)).or_insert(0) += 1;
                acc
            })
            .into_iter()
            .filter(|(_, count)| *count > 1)
            .collect::<HashMap<VerificationCheckKind, i32>>()
            .keys()
            .cloned()
            .collect();

        if !duplicates.is_empty() {
            return Err(TenantError::ValidationError(format!(
                "Duplicate verification_checks defined: {0}",
                Csv(duplicates.iter().map(|d| d.to_string()).collect())
            ))
            .into());
        }

        // validate against kind
        self.verification_checks
            .inner()
            .iter()
            .try_for_each(|c| -> FpResult<()> {
                match c {
                    VerificationCheck::Kyb { .. } => {
                        if !matches!(&self.kind, &ObConfigurationKind::Kyb) {
                            return Err(TenantError::ValidationError(
                                "Cannot run KYB for non-KYB Playbooks".to_owned(),
                            )
                            .into());
                        }
                    },
                    VerificationCheck::BusinessAml{ } => {
                        let has_kyb_check = self.verification_checks
                            .inner()
                            .iter()
                            .any(|vc| matches!(vc, VerificationCheck::Kyb { .. }));

                        if !has_kyb_check {
                            return Err(TenantError::ValidationError(
                                "Cannot run Business AML without KYB".to_owned(),
                            )
                            .into());
                        }

                        if !matches!(&self.kind, &ObConfigurationKind::Kyb) {
                            return Err(TenantError::ValidationError(
                                "Cannot run Business AML for non-KYB Playbooks".to_owned(),
                            )
                            .into());
                        }
                    },
                    VerificationCheck::Aml {
                        ofac,
                        pep,
                        adverse_media,
                        continuous_monitoring: _,
                        adverse_media_lists: _,
                        match_kind: _,
                    } => {
                        if !(*adverse_media || *ofac || *pep) {
                            return Err(TenantError::ValidationError(
                                "at least one of adverse_media, ofac, or pep must be set for AML verification check".to_owned(),
                            )
                            .into());
                        }
                    }
                    VerificationCheck::CurpValidation {} => {
                        // TODO: should be identity doc, not any doc
                        if !self.collects_document() {
                            return Err(TenantError::ValidationError(
                                "Must collect document if `curp_validation_enabled=true".to_owned(),
                            )
                            .into());
                        }
                    }
                    VerificationCheck::Phone {attributes} => {
                        if attributes.is_empty() {
                            return Err(TenantError::ValidationError(
                                "Must provide `attributes` if enabling a phone verification check".to_owned(),
                            )
                            .into());
                        }
                    }
                    VerificationCheck::Kyc { } => (),
                    VerificationCheck::IdentityDocument {  } => (),
                    VerificationCheck::StytchDevice {  } => (),
                    VerificationCheck::NeuroId {  } => {
                        if !matches!(self.kind, ObConfigurationKind::Kyc) {
                            let err = format!("Cannot create playbook with Neuro ID of kind {}, only KYC", self.kind);
                            return Err(TenantError::ValidationError(err).into())
                        }
                        if !tvc.is_neuro_enabled_for_tenant() && obc_is_live {
                            return Err(TenantError::ValidationError("Cannot create playbook with Neuro ID. Please reach out to support@onefootprint.com to enable".into()).into())
                        }
                    },
                    VerificationCheck::Sentilink {  } => {
                        let required_idks = SentilinkProduct::iter().flat_map(|p| p.required_identity_data_kinds()).unique();
                        let missing = required_idks.map(DataIdentifier::from).filter(|x| {
                            let must_collect_dis = self.must_collect_data.iter().flat_map(|cdo| cdo.data_identifiers().unwrap_or_default()).collect_vec();
                            !must_collect_dis.contains(x)
                        }).collect_vec();

                        if !missing.is_empty() {
                            return Err(TenantError::ValidationError(
                                format!("Must collect {} to use Sentilink", Csv::from(missing))
                            ).into())
                        }

                        if !tvc.is_sentilink_enabled_for_tenant() && obc_is_live {
                            return Err(TenantError::ValidationError("Cannot create playbook with Sentilink. Please reach out to support@onefootprint.com to enable".into()
                           ).into())
                        }

                        if !matches!(self.kind, ObConfigurationKind::Kyc | ObConfigurationKind::Kyb) {
                            let err = format!("Cannot create playbook with Sentilink of kind {}. Only KYC and KYB are supported", self.kind);
                            return Err(TenantError::ValidationError(err).into())
                        }
                    },
                }
                Ok(())
            })?;

        // validate against collected data
        self.verification_checks
            .inner()
            .iter()
            .try_for_each(|c| -> FpResult<()> {
                self.validate_verification_check_collected_data(c.clone())?;

                Ok(())
            })?;

        Ok(())
    }

    fn validate_verification_check_collected_data(
        &self,
        verification_check: VerificationCheck,
    ) -> FpResult<()> {
        match verification_check {
            VerificationCheck::Kyb { ein_only } => {
                let required_fields = if ein_only {
                    vec![CDOK::BusinessName, CDOK::BusinessTin]
                } else {
                    vec![CDOK::BusinessName, CDOK::BusinessAddress] // this is what we do for
                                                                    // validating OBCKind, idk why
                };
                let missing_required_fields: Vec<_> = required_fields
                    .into_iter()
                    .filter(|x| !self.must_collect_data.iter().map(CDOK::from).contains(x))
                    .collect();
                if !missing_required_fields.is_empty() {
                    Err(TenantError::ValidationError(format!(
                        "Playbook performing `kyb` verification_check with ein_only={} must collect: {}",
                        ein_only,
                        Csv(missing_required_fields)
                    ))
                    .into())
                } else {
                    Ok(())
                }
            }
            // TODO
            _ => Ok(()),
        }
    }

    fn validate_required_auth_methods(&self) -> FpResult<()> {
        let Some(reqd_methods) = self.required_auth_methods.as_ref() else {
            return Ok(());
        };
        if matches!(self.kind, ObConfigurationKind::Document) {
            // TODO we could in theory support document playbooks one day, but it's kind of weird
            return BadRequestInto("Cannot required auth methods for playbook of kind document");
        }
        if reqd_methods.iter().unique().count() != reqd_methods.len() {
            return BadRequestInto("Cannot provide duplicates in required auth methods");
        }
        if reqd_methods.iter().any(|r| r == &AuthMethodKind::Passkey) {
            return BadRequestInto("Cannot yet require passkey as an auth method");
        }
        if reqd_methods.iter().any(|r| r == &AuthMethodKind::Phone) && self.is_no_phone_flow {
            return BadRequestInto("Cannot require phone auth method in no phone flow");
        }
        if reqd_methods.is_empty() {
            return BadRequestInto("Must have at least one required auth method if provided");
        }
        if self.prompt_for_passkey && self.kind == ObConfigurationKind::Auth {
            return BadRequestInto("Cannot require passkey on an auth playbook");
        }
        Ok(())
    }
}

fn collects_identity_document(create_obc_req: &CreateOnboardingConfigurationRequest) -> bool {
    let has_document_cdo = create_obc_req
        .must_collect_data
        .iter()
        .any(|d| CDOK::from(d) == CDOK::Document);
    let has_other_document = create_obc_req
        .documents_to_collect
        .iter()
        .any(|c| c.is_identity());
    has_document_cdo || has_other_document
}

pub async fn prepare_onboarding_configuration_request(
    state: &State,
    obc_request: CreateOnboardingConfigurationRequest,
    tenant: &Tenant,
    is_live: IsLive,
    author: DbActor,
) -> FpResult<NewObConfigurationArgs> {
    // First, map some of the API format to the format we write to the DB
    if let Some(r) = &obc_request.enhanced_aml {
        if !r.enhanced_aml && (r.adverse_media || r.ofac || r.pep) {
            return Err(TenantError::ValidationError(
                "cannot set adverse_media, ofac, or pep if enhanced_aml = false".to_owned(),
            )
            .into());
        }
        if r.enhanced_aml && !(r.adverse_media || r.ofac || r.pep) {
            return Err(TenantError::ValidationError(
                "at least one of adverse_media, ofac, or pep must be set if enhanced_aml = true".to_owned(),
            )
            .into());
        }
    }

    if obc_request.doc_scan_for_optional_ssn.is_some() {
        return Err(TenantError::ValidationError(
            "doc_scan_for_optional_ssn not supported. Please use the `ssn_not_provided` risk signal in a StepUp Rule to encode this logic.".to_string(),
        )
        .into());
    }

    let collects_identity_document = collects_identity_document(&obc_request);

    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        optional_data,
        deprecated_can_access_data,
        cip_kind,
        is_no_phone_flow,
        is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
        skip_kyc,
        allow_us_residents,
        allow_us_territories,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        curp_validation_enabled,
        enhanced_aml: api_enhanced_aml,
        kind,
        verification_checks,
        required_auth_methods,
        prompt_for_passkey,
        doc_scan_for_optional_ssn: _,
    } = obc_request;

    // TODO: clean this up by surfacing AM lists in FE
    let db_enhanced_aml = api_enhanced_aml.map(|r| r.into());

    // VERIFICATION CHECK MIGRATION: construct verification checks
    let curp_validation_enabled = curp_validation_enabled.unwrap_or(false);
    let verification_checks = VerificationChecks::new(
        &tenant.id,
        verification_checks,
        skip_kyc,
        db_enhanced_aml.clone(),
        collects_identity_document,
        curp_validation_enabled,
    );

    let is_no_phone_flow = is_no_phone_flow.unwrap_or(false);

    // TODO remove once client start providing this
    let required_auth_methods = match required_auth_methods {
        Patch::Null => None,
        Patch::Value(v) => Some(v),
        Patch::Missing => match kind {
            // Auth and Document playbooks don't (yet) have an opinion on which login method is used
            ObConfigurationKind::Auth | ObConfigurationKind::Document => None,
            ObConfigurationKind::Kyc | ObConfigurationKind::Kyb => Some(if is_no_phone_flow {
                vec![AuthMethodKind::Email]
            } else {
                vec![AuthMethodKind::Phone]
            }),
        },
    };

    let prompt_for_passkey =
        prompt_for_passkey.unwrap_or(!is_no_phone_flow && kind != ObConfigurationKind::Auth);
    let optional_data = optional_data.unwrap_or(vec![]);
    let can_access_data = deprecated_can_access_data
        .unwrap_or(chain!(must_collect_data.clone(), optional_data.clone()).collect());

    let args = NewObConfigurationArgs {
        name,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind,
        is_no_phone_flow,
        is_doc_first: is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
        author,
        // TODO: remove these once frontend is merged
        allow_us_residents: allow_us_residents.unwrap_or(true),
        allow_us_territory_residents: allow_us_territories.unwrap_or(false),
        kind,
        skip_confirm: skip_confirm.unwrap_or(false),
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        verification_checks,
        required_auth_methods,
        prompt_for_passkey,
    };


    // Need to check Tenants are able to use certain vendors
    let tvc = TenantVendorControl::new(
        tenant.id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;
    let args = ObConfigurationArgsToValidate::validate(state, args, tenant, is_live, &tvc)?;
    Ok(args)
}

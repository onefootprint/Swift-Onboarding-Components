use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::errors::tenant::TenantError;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::FpResult;
use api_errors::BadRequestInto;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::PgConn;
use idv::requirements::HasIdentityDataRequirements;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::sentilink::SentilinkProduct;
use newtypes::DataIdentifier;
use newtypes::DocumentRequestConfig;
use newtypes::ExperianPreciseId;
use newtypes::IdologyExpectId;
use newtypes::IncodeWatchlistCheck;
use newtypes::LexisFlexId;
use newtypes::Locked;
use newtypes::ObConfigurationKind;
use newtypes::VaultKind;
use newtypes::VerificationCheck;
use newtypes::WfrAdhocVendorCallConfig;
use newtypes::WorkflowRequestConfig;
use strum::IntoEnumIterator;

pub(super) fn validate_triggers(
    conn: &mut PgConn,
    trigger: &WorkflowRequestConfig,
    su: &ScopedVault,
    sb: Option<&ScopedVault>,
) -> FpResult<()> {
    let has_sb = sb.is_some();
    match trigger {
        WorkflowRequestConfig::Onboard(cfg) => {
            let (_, obc) = ObConfiguration::get(conn, (&cfg.playbook_id, &su.tenant_id, su.is_live))?;
            if cfg
                .recollect_attributes
                .iter()
                .any(|cdo| !obc.must_collect_data.contains(cdo))
            {
                return BadRequestInto("recollect_attributes must be a subset of the playbook's data");
            }
            let is_kyb = obc.kind == ObConfigurationKind::Kyb;
            if cfg.reuse_existing_bo_kyc && !is_kyb {
                return BadRequestInto("reuse_existing_bo_kyc can only be used with KYB playbooks");
            }
            if has_sb && !is_kyb {
                return BadRequestInto("Must provide a KYB playbook when providing fp_bid");
            }
            // Temporary until we implement this
            if has_sb && !cfg.reuse_existing_bo_kyc {
                return BadRequestInto("Must provide reuse_existing_bo_kyc for KYB flows");
            }
        }
        WorkflowRequestConfig::Document(cfg) => {
            DocumentRequestConfig::validate(&cfg.configs)?;
            DocumentRequestConfig::validate(&cfg.business_configs)?;
            if cfg.business_configs.iter().any(|c| !c.is_custom()) {
                return BadRequestInto("business_configs can only contain custom document requests");
            }
            let has_business_configs = !cfg.business_configs.is_empty();
            if has_sb != has_business_configs {
                return BadRequestInto("fp_bid and business_configs must both be provided together");
            }
        }
        WorkflowRequestConfig::AdhocVendorCall(_) => {
            // MOVE this
            todo!()
        }
    }
    Ok(())
}


pub(super) fn validate_adhoc_vendor_call(
    config: WfrAdhocVendorCallConfig,
    sv: &Locked<ScopedVault>,
    tvc: &TenantVendorControl,
    is_live: bool,
    vw: &TenantVw,
) -> FpResult<()> {
    if config.verification_checks.is_empty() {
        return Err(
            TenantError::ValidationError("Must provide at least one verification check".to_owned()).into(),
        );
    }

    let has_full_kyb_check = config
        .verification_checks
        .iter()
        .any(|vc| matches!(vc, VerificationCheck::Kyb { ein_only: false }));

    let populated_idks = vw
        .populated_dis()
        .iter()
        .filter_map(|di| {
            if let DataIdentifier::Id(id) = di {
                Some(id)
            } else {
                None
            }
        })
        .cloned()
        .collect_vec();

    // TODO: consolidate this with playbook creation logic
    // Realistically, hello to the engineer fixing this now because of some bug :see-no-evil:
    config
        .verification_checks
        .iter()
        .try_for_each(|vc| -> FpResult<()> {
            match vc {
                vc @ VerificationCheck::NeuroId {}
                | vc @ VerificationCheck::CurpValidation {}
                | vc @ VerificationCheck::IdentityDocument {}
                | vc @ VerificationCheck::StytchDevice {} => Err(TenantError::ValidationError(format!(
                    "Cannot run {:?} as an adhoc vendor call",
                    vc
                ))
                .into()),
                VerificationCheck::Phone { attributes } => {
                    if attributes.is_empty() {
                        return Err(TenantError::ValidationError(
                            "Must provide `attributes` if requesting a phone verification check".to_owned(),
                        )
                        .into());
                    };

                    Ok(())
                }
                VerificationCheck::Kyc {} => {
                    if !matches!(sv.kind, VaultKind::Person) {
                        return Err(TenantError::ValidationError(
                            "KYC can only be run on person vaults".to_owned(),
                        )
                        .into());
                    };

                    if tvc.enabled_kyc_vendors().is_empty() {
                        return Err(TenantError::ValidationError(
                            "KYC is not enabled. Please reach out to support@onefootprint.com to enable".to_owned(),
                        ).into())
                    }

                    if !(
                        ExperianPreciseId.requirements_are_satisfied(&populated_idks)
                        || LexisFlexId.requirements_are_satisfied(&populated_idks)
                        || IdologyExpectId.requirements_are_satisfied(&populated_idks)
                    ) {
                        return Err(TenantError::ValidationError(
                            "User does not have minimum required collected data to use KYC".to_owned(),
                        ).into())
                    }

                    Ok(())
                }
                VerificationCheck::Kyb { .. } => {
                    if !matches!(sv.kind, VaultKind::Business) {
                        return Err(TenantError::ValidationError(
                            "KYB can only be run on business vaults".to_owned(),
                        )
                        .into());
                    };

                    Ok(())
                }
                VerificationCheck::Aml {
                    continuous_monitoring,
                    ..
                } => {
                    if !matches!(sv.kind, VaultKind::Person) {
                        return Err(TenantError::ValidationError(
                            "KYC can only be run on person vaults".to_owned(),
                        )
                        .into());
                    };

                    if !(
                        IncodeWatchlistCheck.requirements_are_satisfied(&populated_idks)
                    ) {
                        return Err(TenantError::ValidationError(
                            "User does not have minimum required collected data to use AML".to_owned(),
                        ).into())
                    }

                    // As of 2025-01-08 his won't get picked up by the watchlist check tasks so we can't allow
                    // it In the future we'll support registering continuous monitoring
                    if *continuous_monitoring {
                        return Err(TenantError::ValidationError(
                            "Continuous monitoring is not supported for adhoc vendor calls".to_owned(),
                        )
                        .into());
                    };

                    Ok(())
                }
                VerificationCheck::BusinessAml { .. } => {
                    if !matches!(sv.kind, VaultKind::Business) {
                        return Err(TenantError::ValidationError(
                            "BusinessAML can only be run on business vaults".to_owned(),
                        )
                        .into());
                    };

                    // This is required because we currently get biz AML as part of middesk KYB
                    if !has_full_kyb_check {
                        return Err(TenantError::ValidationError(
                            "Cannot run Business AML without KYB".to_owned(),
                        )
                        .into());
                    };

                    Ok(())
                }
                VerificationCheck::Sentilink {} => {
                    if !matches!(sv.kind, VaultKind::Person) {
                        return Err(TenantError::ValidationError(
                            "Sentilink can only be run on person vaults".to_owned(),
                        )
                        .into());
                    };
                    if !tvc.is_sentilink_enabled_for_tenant() && is_live {
                        return Err(TenantError::ValidationError("Cannot run adhoc vendor call with Sentilink. Please reach out to support@onefootprint.com to enable".into()
                       ).into())
                    };
                    let required_idks = SentilinkProduct::iter().flat_map(|p| p.required_identity_data_kinds()).unique();
                    let missing = required_idks
                        .map(DataIdentifier::from)
                        .filter(|x| !vw.populated_dis().contains(x))
                        .collect_vec();

                    if !missing.is_empty() {
                        return Err(TenantError::ValidationError(
                            format!("User must have {} to use Sentilink", Csv::from(missing))
                        ).into())
                    }
                    Ok(())
                }
            }
        })?;

    Ok(())
}

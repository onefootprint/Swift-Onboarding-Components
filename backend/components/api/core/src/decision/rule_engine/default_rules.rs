use crate::FpResult;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstance;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::BooleanOperator;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::CountrySpecificDocumentMapping;
use newtypes::DbActor;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAmlOption;
use newtypes::FootprintReasonCode as FRC;
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::RuleActionConfig as RAC;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::VerificationCheck;
use std::collections::HashMap;
use strum::EnumIter;
use strum::IntoEnumIterator;

pub fn base_kyc_rules() -> Vec<(RuleExpression, RAC)> {
    vec![
        (if_risk_signal(FRC::IdNotLocated), RAC::Fail {}),
        (if_risk_signal(FRC::IdFlagged), RAC::Fail {}),
        (if_risk_signal(FRC::SubjectDeceased), RAC::Fail {}),
        (if_risk_signal(FRC::AddressInputIsPoBox), RAC::Fail {}),
        (if_risk_signal(FRC::DobLocatedCoppaAlert), RAC::Fail {}),
        (if_risk_signal(FRC::MultipleRecordsFound), RAC::Fail {}),
    ]
}

pub fn ssn_rules() -> Vec<(RuleExpression, RAC)> {
    vec![
        (if_risk_signal(FRC::SsnDoesNotMatch), RAC::Fail {}),
        (if_risk_signal(FRC::SsnPartiallyMatches), RAC::Fail {}),
        (if_risk_signal(FRC::SsnInputIsInvalid), RAC::Fail {}),
        (if_risk_signal(FRC::SsnLocatedIsInvalid), RAC::Fail {}),
        (if_risk_signal(FRC::SsnIssuedPriorToDob), RAC::Fail {}),
    ]
}


pub fn default_verification_check_rules(check: &VerificationCheck) -> Vec<(RuleExpression, RAC)> {
    match check {
        VerificationCheck::Sentilink {} => {
            vec![
                (if_risk_signal(FRC::SentilinkIdentityTheftHighRisk), RAC::Fail {}),
                (
                    if_risk_signal(FRC::SentilinkSyntheticIdentityHighRisk),
                    RAC::Fail {},
                ),
            ]
        }
        // TODO: Change FRCs to be neuro specific maybe?
        VerificationCheck::NeuroId {} => {
            // These are the suggested rules from Neuro
            vec![
                (if_risk_signal(FRC::BehaviorHighRisk), RAC::Fail {}),
                (if_risk_signal(FRC::DeviceHighRisk), RAC::Fail {}),
                (if_risk_signal(FRC::DeviceMediumRisk), RAC::ManualReview {}),
            ]
        }
        VerificationCheck::Kyb { ein_only } => base_kyb_rules(*ein_only),
        _ => vec![],
    }
}

// we use this base set of Document rules for both Alpaca and regular playbooks. However, precedent
// for Alpaca currently is to always raise a review if a doc was uploaded. We haven't yet decided
// with folks that there are cases where they want a document to "hard fail" and not even raise a
// review. so for now, the alpaca rules will pass in always_review=true here and that means would be
// Fail RuleAction's here are instead RuleAction::ManualReview
pub fn base_doc_rules(always_review: bool) -> Vec<(RuleExpression, RAC)> {
    let fail_action = match always_review {
        true => RAC::ManualReview {},
        false => RAC::Fail {},
    };

    vec![
        (if_risk_signal(FRC::DocumentNotVerified), fail_action.clone()),
        (
            if_risk_signal(FRC::DocumentSelfieDoesNotMatch),
            fail_action.clone(),
        ),
        (
            if_risk_signal(FRC::DocumentSelfieNotLiveImage),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::DocumentLiveCaptureFailed),
            RAC::ManualReview {},
        ),
        (if_risk_signal(FRC::DocumentExpired), fail_action),
        (if_risk_signal(FRC::DocumentUploadFailed), RAC::ManualReview {}),
        (if_risk_signal(FRC::DocumentTypeMismatch), RAC::ManualReview {}),
        (
            if_risk_signal(FRC::DocumentUnknownCountryCode),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::DocumentCountryCodeMismatch),
            RAC::ManualReview {},
        ),
    ]
}

fn alpaca_identity_stepup() -> RAC {
    // In the general case, we need to accept a document that might have address
    let alpaca_doc_types = vec![IdDocKind::DriversLicense, IdDocKind::IdCard];
    // Alpaca supports territories: https://www.notion.so/onefootprint/Alpaca-US-Territory-31c04ec7d2b64cc5ad9cbbde0c026af2?pvs=4
    // Allow docs from the US or territories
    // There's a small difference in behavior in that we don't restrict to the territory the person said
    // they were living in, but this is something we can add in the future as a param on
    // DocReqConfig#restrict_to_residential_country
    let alpaca_allowed_countries: Vec<Iso3166TwoDigitCountryCode> = Iso3166TwoDigitCountryCode::iter()
        .filter(|c| c.is_us_including_territories())
        .collect();

    let map = HashMap::from_iter(
        alpaca_allowed_countries
            .into_iter()
            .map(|c| (c, alpaca_doc_types.clone())),
    );

    let config = DocumentRequestConfig::Identity {
        collect_selfie: true,
        document_types_and_countries: Some(DocumentAndCountryConfiguration {
            global: vec![],
            country_specific: CountrySpecificDocumentMapping(map),
        }),
    };

    RAC::StepUp(vec![config])
}
pub fn alpaca_kyc_field_validation_rules() -> Vec<(RuleExpression, RAC)> {
    vec![
        (if_not_risk_signal(FRC::SsnMatches), RAC::Fail {}),
        (if_not_risk_signal(FRC::NameMatches), alpaca_identity_stepup()),
        (if_not_risk_signal(FRC::DobMatches), alpaca_identity_stepup()),
        (if_risk_signal(FRC::AddressDoesNotMatch), alpaca_identity_stepup()),
        (
            if_risk_signal(FRC::AddressNewerRecordFound),
            alpaca_identity_stepup(),
        ),
    ]
}

pub fn alpaca_doc_field_validation_rules() -> Vec<(RuleExpression, RAC)> {
    vec![
        (
            if_risk_signal(FRC::DocumentOcrAddressDoesNotMatch),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::DocumentOcrDobDoesNotMatch),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::DocumentOcrNameDoesNotMatch),
            RAC::ManualReview {},
        ),
    ]
}

fn ein_only_rules() -> Vec<(RuleExpression, RAC)> {
    vec![
        (
            if_risk_signal(FRC::BeneficialOwnerFailedKyc),
            RAC::ManualReview {},
        ),
        (if_risk_signal(FRC::TinNotFound), RAC::ManualReview {}),
        (if_risk_signal(FRC::TinInvalid), RAC::ManualReview {}),
        (if_risk_signal(FRC::TinDoesNotMatch), RAC::ManualReview {}),
    ]
}

pub fn base_kyb_rules(ein_only: bool) -> Vec<(RuleExpression, RAC)> {
    let base = ein_only_rules();

    let address_rules = vec![
        (
            if_risk_signal(FRC::BusinessAddressIncompleteMatch),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::BusinessAddressDoesNotMatch),
            RAC::ManualReview {},
        ),
    ];

    let name_rules = vec![
        (
            if_risk_signal(FRC::BusinessNameAlternateMatch),
            RAC::ManualReview {},
        ),
        (
            if_risk_signal(FRC::BusinessNameDoesNotMatch),
            RAC::ManualReview {},
        ),
    ];

    let watchlist_rules = vec![(
        if_risk_signal(FRC::BusinessNameWatchlistHit),
        RAC::ManualReview {},
    )];

    if ein_only {
        base
    } else {
        base.into_iter()
            .chain(address_rules)
            .chain(name_rules)
            .chain(watchlist_rules)
            .collect()
    }
}

#[derive(EnumIter)]
enum RuleGroup {
    Kyc,
    Document,
    VerificationCheck,
    Alpaca,
    Aml,
}

impl RuleGroup {
    fn has_kyc(obc: &ObConfiguration) -> bool {
        (obc.kind == ObConfigurationKind::Kyc || obc.kind == ObConfigurationKind::Kyb)
            && !obc.verification_checks().skip_kyc()
    }

    fn kyc_rules(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        let mut kyc_rules = vec![];
        let must_collect_ssn =
            obc.must_collect_data.contains(&CDO::Ssn9) || obc.must_collect_data.contains(&CDO::Ssn4);
        let optional_ssn = obc.optional_data.contains(&CDO::Ssn9) || obc.optional_data.contains(&CDO::Ssn4);

        if Self::has_kyc(obc) {
            kyc_rules.append(&mut base_kyc_rules());

            if must_collect_ssn || optional_ssn {
                kyc_rules.append(&mut ssn_rules());
            }
        }

        if optional_ssn {
            kyc_rules.append(&mut vec![(
                if_risk_signal(FRC::SsnNotProvided),
                RAC::ManualReview {},
            )]);
        }

        kyc_rules
    }

    fn alpaca_rules(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        let mut alpaca_rules = vec![];
        if matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
            alpaca_rules.append(&mut alpaca_kyc_field_validation_rules());
            alpaca_rules.append(&mut alpaca_doc_field_validation_rules());
        }
        alpaca_rules
    }

    fn document_rules(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        let mut document_rules = vec![];
        if obc.document_cdo().is_some() || matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
            document_rules.append(&mut base_doc_rules(matches!(obc.cip_kind, Some(CipKind::Alpaca))));
        }
        document_rules
    }

    fn aml_rules(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        let mut aml_rules = vec![];
        let aml_risk_signals = match obc.verification_checks().enhanced_aml() {
            // We do get some watchlist risk signals from normal KYC
            EnhancedAmlOption::No if Self::has_kyc(obc) => {
                vec![FRC::WatchlistHitOfac, FRC::WatchlistHitNonSdn]
            }
            // But if we're not running KYC at all, there will be no risk signals
            EnhancedAmlOption::No => vec![],
            EnhancedAmlOption::Yes {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring: _,
                adverse_media_lists: _,
                match_kind: _,
            } => {
                let mut rs = vec![];
                if ofac {
                    rs.push(FRC::WatchlistHitOfac);
                    rs.push(FRC::WatchlistHitNonSdn);
                    // not really "ofac" but our EnhancedAmlOption doesn't separately specify this
                    rs.push(FRC::WatchlistHitWarning);
                }
                if pep {
                    rs.push(FRC::WatchlistHitPep);
                }
                if adverse_media {
                    rs.push(FRC::AdverseMediaHit);
                }
                rs
            }
        };
        aml_risk_signals.into_iter().for_each(|rs| {
            aml_rules.push((if_risk_signal(rs.clone()), RAC::ManualReview {}));
        });

        aml_rules
    }

    fn verification_check_rules(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        obc.verification_checks()
            .inner()
            .iter()
            .flat_map(default_verification_check_rules)
            .collect_vec()
    }

    fn rules(&self, obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
        match self {
            Self::Kyc => Self::kyc_rules(obc),
            Self::Document => Self::document_rules(obc),
            Self::VerificationCheck => Self::verification_check_rules(obc),
            Self::Alpaca => Self::alpaca_rules(obc),
            Self::Aml => Self::aml_rules(obc),
        }
    }
}

#[tracing::instrument(skip_all)]
pub fn default_rules_for_obc(obc: &ObConfiguration) -> Vec<(RuleExpression, RAC)> {
    RuleGroup::iter().flat_map(|g| g.rules(obc)).collect_vec()
}

#[tracing::instrument(skip_all)]
pub fn save_default_rules_for_obc(
    conn: &mut TxnPgConn,
    playbook: &Locked<Playbook>,
    obc_id: &ObConfigurationId,
) -> FpResult<()> {
    let existing_rules = RuleInstance::list(
        conn,
        &playbook.tenant_id,
        playbook.is_live,
        obc_id,
        IncludeRules::All,
    )?;
    if !existing_rules.is_empty() {
        tracing::warn!(
            ?obc_id,
            "save_default_rules_for_obc, skipping because there are existing rules"
        );
        return Ok(());
    }

    let (obc, _) = ObConfiguration::get(conn, obc_id)?;
    let rules = default_rules_for_obc(&obc);
    RuleInstance::bulk_create(
        conn,
        playbook,
        obc_id,
        &DbActor::Footprint,
        rules
            .into_iter()
            .map(|(e, a)| {
                let action = a.clone().into();
                NewRule {
                    rule_expression: e,
                    action,
                    rule_action: a,
                    name: None,
                    is_shadow: false,
                }
            })
            .collect(),
    )?;
    Ok(())
}

fn if_risk_signal(frc: FRC) -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: frc,
        op: BooleanOperator::Equals,
        value: true,
    }])
}

fn if_not_risk_signal(frc: FRC) -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: frc,
        op: BooleanOperator::DoesNotEqual,
        value: true,
    }])
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::AmlMatchKind;
    use newtypes::CountryRestriction;
    use newtypes::DocTypeRestriction;
    use newtypes::DocumentCdoInfo;
    use newtypes::Selfie;

    fn kyb_vc(ein_only: bool) -> Option<Vec<VerificationCheck>> {
        Some(vec![VerificationCheck::Kyb { ein_only }])
    }


    #[db_test_case(ObConfigurationOpts { ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn),  RAC::ManualReview {})]].concat() ; "basic KYC")]
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Ssn9], ..Default::default()}, [base_kyc_rules(), ssn_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {})]].concat() ; "basic KYC with SSN")]
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Ssn9], skip_kyc: true, ..Default::default()}, vec![]  ; "SSN but skip_kyc")]
    #[db_test_case(ObConfigurationOpts { optional_data: vec![CDO::Ssn9], ..Default::default()}, [base_kyc_rules(), ssn_rules(), vec![(if_risk_signal(FRC::SsnNotProvided), RAC::ManualReview {})], vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {})]].concat() ; "basic KYC with optional SSN")]
    #[db_test_case(ObConfigurationOpts { skip_kyc: true, ..Default::default()}, vec![]; "skip_kyc")]
    #[db_test_case(ObConfigurationOpts { skip_kyc: true, enhanced_aml: EnhancedAmlOption::Yes { ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None, match_kind: AmlMatchKind::ExactName}, ..Default::default()}, [vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitWarning),  RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitPep), RAC::ManualReview {}), (if_risk_signal(FRC::AdverseMediaHit), RAC::ManualReview {})]].concat() ; "enhanced_aml even with skip kyc")]
    #[db_test_case(ObConfigurationOpts { enhanced_aml: EnhancedAmlOption::Yes { ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None, match_kind: AmlMatchKind::ExactName}, ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitWarning),  RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitPep), RAC::ManualReview {}), (if_risk_signal(FRC::AdverseMediaHit), RAC::ManualReview {})]].concat() ; "enhanced_aml, all options")]
    #[db_test_case(ObConfigurationOpts { enhanced_aml: EnhancedAmlOption::Yes { ofac: false, pep: true, adverse_media: false, continuous_monitoring: true, adverse_media_lists: None, match_kind: AmlMatchKind::ExactName}, ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitPep), RAC::ManualReview {})]].concat() ; "enhanced_aml, subbset of options")]
    // non-Alpaca but must_collect_data contains DOC CDO
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))],  ..Default::default()}, [base_doc_rules(false), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {})]].concat() ; "Doc CDO")]
    // doc only (indicated by `kind = Document`)
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Document, must_collect_data: vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))],  ..Default::default()}, base_doc_rules(false); "Doc only")]
    // cip_kind = Alpaca
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, must_collect_data: vec![CDO::BusinessKycedBeneficialOwners, CDO::BusinessTin], verification_checks: kyb_vc(false), ..Default::default()}, [base_kyb_rules(false), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {})]].concat() ; "KYB")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, must_collect_data: vec![CDO::BusinessKycedBeneficialOwners, CDO::BusinessTin], verification_checks: kyb_vc(true), ..Default::default()}, [ein_only_rules(), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RAC::ManualReview {}), (if_risk_signal(FRC::WatchlistHitNonSdn), RAC::ManualReview {})]].concat() ; "KYB EIN Only")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, skip_kyc: true, must_collect_data: vec![CDO::BusinessTin], verification_checks: kyb_vc(true), ..Default::default()}, [ein_only_rules()].concat() ; "KYB ein only, no BOs")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, skip_kyc: true, must_collect_data: vec![CDO::BusinessTin], verification_checks: kyb_vc(false), ..Default::default()}, [base_kyb_rules(false)].concat() ; "KYB full, no BOs")]
    fn test_default_rules_for_obc(
        conn: &mut TestPgConn,
        obc_opts: ObConfigurationOpts,
        expected: Vec<(RuleExpression, RAC)>,
    ) {
        let t = tests::fixtures::tenant::create(conn);
        let (_, obc) = tests::fixtures::ob_configuration::create_with_opts(conn, &t.id, obc_opts);

        assert_have_same_elements(expected, default_rules_for_obc(&obc))
    }
}

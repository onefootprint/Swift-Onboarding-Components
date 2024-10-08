use crate::FpResult;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstance;
use db::TxnPgConn;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::BooleanOperator;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DbActor;
use newtypes::EnhancedAmlOption;
use newtypes::FootprintReasonCode as FRC;
use newtypes::Locked;
use newtypes::ObConfigurationKind;
use newtypes::RuleAction;
use newtypes::RuleAction as RA;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::RuleInstanceKind;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use std::sync::Arc;

pub fn base_kyc_rules() -> Vec<(RuleExpression, RuleAction)> {
    vec![
        (if_risk_signal(FRC::IdNotLocated), RA::Fail),
        (if_risk_signal(FRC::IdFlagged), RA::Fail),
        (if_risk_signal(FRC::SubjectDeceased), RA::Fail),
        (if_risk_signal(FRC::AddressInputIsPoBox), RA::Fail),
        (if_risk_signal(FRC::DobLocatedCoppaAlert), RA::Fail),
        (if_risk_signal(FRC::MultipleRecordsFound), RA::Fail),
    ]
}

pub fn ssn_rules() -> Vec<(RuleExpression, RuleAction)> {
    vec![
        (if_risk_signal(FRC::SsnDoesNotMatch), RA::Fail),
        (if_risk_signal(FRC::SsnPartiallyMatches), RA::Fail),
        (if_risk_signal(FRC::SsnInputIsInvalid), RA::Fail),
        (if_risk_signal(FRC::SsnLocatedIsInvalid), RA::Fail),
        (if_risk_signal(FRC::SsnIssuedPriorToDob), RA::Fail),
    ]
}


pub fn default_verification_check_rules(check: &VerificationCheck) -> Vec<(RuleExpression, RuleAction)> {
    match check {
        VerificationCheck::Sentilink {} => {
            vec![
                (if_risk_signal(FRC::SentilinkIdentityTheftHighRisk), RA::Fail),
                (if_risk_signal(FRC::SentilinkSyntheticIdentityHighRisk), RA::Fail),
            ]
        }
        _ => vec![],
    }
}

// we use this base set of Document rules for both Alpaca and regular playbooks. However, precedent
// for Alpaca currently is to always raise a review if a doc was uploaded. We haven't yet decided
// with folks that there are cases where they want a document to "hard fail" and not even raise a
// review. so for now, the alpaca rules will pass in always_review=true here and that means would be
// Fail RuleAction's here are instead RuleAction::ManualReview
pub fn base_doc_rules(always_review: bool) -> Vec<(RuleExpression, RuleAction)> {
    let fail_action = match always_review {
        true => RA::ManualReview,
        false => RA::Fail,
    };

    vec![
        (if_risk_signal(FRC::DocumentNotVerified), fail_action),
        (if_risk_signal(FRC::DocumentSelfieDoesNotMatch), fail_action),
        (if_risk_signal(FRC::DocumentSelfieNotLiveImage), RA::ManualReview),
        (if_risk_signal(FRC::DocumentLiveCaptureFailed), RA::ManualReview),
        (if_risk_signal(FRC::DocumentExpired), fail_action),
        (if_risk_signal(FRC::DocumentUploadFailed), RA::ManualReview),
        (if_risk_signal(FRC::DocumentTypeMismatch), RA::ManualReview),
        (if_risk_signal(FRC::DocumentUnknownCountryCode), RA::ManualReview),
        (if_risk_signal(FRC::DocumentCountryCodeMismatch), RA::ManualReview),
    ]
}

pub fn alpaca_kyc_field_validation_rules() -> Vec<(RuleExpression, RuleAction)> {
    vec![
        (if_not_risk_signal(FRC::SsnMatches), RA::Fail),
        (if_not_risk_signal(FRC::NameMatches), RA::identity_stepup()),
        (if_not_risk_signal(FRC::DobMatches), RA::identity_stepup()),
        (if_risk_signal(FRC::AddressDoesNotMatch), RA::identity_stepup()),
        (
            if_risk_signal(FRC::AddressNewerRecordFound),
            RA::identity_stepup(),
        ),
    ]
}

pub fn alpaca_doc_field_validation_rules() -> Vec<(RuleExpression, RuleAction)> {
    vec![
        (
            if_risk_signal(FRC::DocumentOcrAddressDoesNotMatch),
            RA::ManualReview,
        ),
        (if_risk_signal(FRC::DocumentOcrDobDoesNotMatch), RA::ManualReview),
        (if_risk_signal(FRC::DocumentOcrNameDoesNotMatch), RA::ManualReview),
    ]
}

fn ein_only_rules() -> Vec<(RuleExpression, RA)> {
    vec![
        (if_risk_signal(FRC::BeneficialOwnerFailedKyc), RA::ManualReview),
        (if_not_risk_signal(FRC::TinMatch), RA::ManualReview),
    ]
}

pub fn base_kyb_rules(ein_only: bool) -> Vec<(RuleExpression, RA)> {
    let base = ein_only_rules();

    let full_kyb = vec![
        (
            RuleExpression(vec![
                RuleExpressionCondition::RiskSignal {
                    field: FRC::BusinessNameMatch,
                    op: BooleanOperator::DoesNotEqual,
                    value: true,
                },
                RuleExpressionCondition::RiskSignal {
                    field: FRC::BusinessNameSimilarMatch,
                    op: BooleanOperator::DoesNotEqual,
                    value: true,
                },
            ]),
            RA::ManualReview,
        ),
        (
            RuleExpression(vec![
                RuleExpressionCondition::RiskSignal {
                    field: FRC::BusinessAddressMatch,
                    op: BooleanOperator::DoesNotEqual,
                    value: true,
                },
                RuleExpressionCondition::RiskSignal {
                    field: FRC::BusinessAddressCloseMatch,
                    op: BooleanOperator::DoesNotEqual,
                    value: true,
                },
                RuleExpressionCondition::RiskSignal {
                    field: FRC::BusinessAddressSimilarMatch,
                    op: BooleanOperator::DoesNotEqual,
                    value: true,
                },
            ]),
            RA::ManualReview,
        ),
        (if_risk_signal(FRC::BusinessNameWatchlistHit), RA::ManualReview),
    ];

    if ein_only {
        base
    } else {
        base.into_iter().chain(full_kyb).collect()
    }
}

#[tracing::instrument(skip_all)]
pub fn default_rules_for_obc(
    obc: &ObConfiguration,
    ff_client: Option<Arc<dyn FeatureFlagClient>>,
) -> Vec<(RuleExpression, RuleAction, RuleInstanceKind)> {
    let mut person_rules = vec![];

    // KYC
    let has_kyc = (obc.kind == ObConfigurationKind::Kyc || obc.kind == ObConfigurationKind::Kyb)
        && !obc.verification_checks().skip_kyc();
    let must_collect_ssn =
        obc.must_collect_data.contains(&CDO::Ssn9) || obc.must_collect_data.contains(&CDO::Ssn4);
    let optional_ssn = obc.optional_data.contains(&CDO::Ssn9) || obc.optional_data.contains(&CDO::Ssn4);

    if has_kyc {
        person_rules.append(&mut base_kyc_rules());

        if must_collect_ssn || optional_ssn {
            person_rules.append(&mut ssn_rules());
        }
    }

    if optional_ssn {
        person_rules.append(&mut vec![(if_risk_signal(FRC::SsnNotProvided), RA::ManualReview)]);
    }

    // Alpaca
    if matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
        person_rules.append(&mut alpaca_kyc_field_validation_rules());
        person_rules.append(&mut alpaca_doc_field_validation_rules());
    }

    // If collection of a Doc is possible, then include Document related rules
    if obc.document_cdo().is_some()
        || obc.document_cdo_for_optional_ssn().is_some()
        || matches!(obc.cip_kind, Some(CipKind::Alpaca))
    {
        person_rules.append(&mut base_doc_rules(matches!(obc.cip_kind, Some(CipKind::Alpaca))));
    }

    // AML
    let aml_risk_signals = match obc.verification_checks().enhanced_aml() {
        // We do get some watchlist risk signals from normal KYC
        EnhancedAmlOption::No if has_kyc => vec![FRC::WatchlistHitOfac, FRC::WatchlistHitNonSdn],
        // But if we're not running KYC at all, there will be no risk signals
        EnhancedAmlOption::No => vec![],
        EnhancedAmlOption::Yes {
            ofac,
            pep,
            adverse_media,
            continuous_monitoring: _,
            adverse_media_lists: _,
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
        person_rules.push((if_risk_signal(rs.clone()), RA::ManualReview));

        if ff_client
            .clone()
            .map(|ff| ff.flag(BoolFlag::StepUpOnAmlHit(&obc.key)))
            .unwrap_or(false)
        {
            person_rules.push((if_risk_signal(rs), RA::identity_stepup()));
        }
    });

    // KYB
    let business_rules = if let Some(VerificationCheck::Kyb { ein_only }) =
        obc.verification_checks().get(VerificationCheckKind::Kyb)
    {
        base_kyb_rules(ein_only)
    } else {
        vec![]
    }
    .into_iter()
    .map(|(r, a)| (r, a, RuleInstanceKind::Business));

    let verification_check_rules = obc
        .verification_checks()
        .inner()
        .iter()
        .flat_map(default_verification_check_rules)
        .map(|(re, ra)| (re, ra, RuleInstanceKind::Person))
        .collect_vec();

    person_rules
        .into_iter()
        .map(|(r, a)| (r, a, RuleInstanceKind::Person))
        .chain(business_rules)
        .chain(verification_check_rules)
        .collect()
}

#[tracing::instrument(skip_all)]
pub fn save_default_rules_for_obc(
    conn: &mut TxnPgConn,
    obc: &Locked<ObConfiguration>,
    ff_client: Option<Arc<dyn FeatureFlagClient>>,
) -> FpResult<()> {
    let existing_rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, IncludeRules::All)?;
    if !existing_rules.is_empty() {
        tracing::warn!(
            ?obc,
            "save_default_rules_for_obc, skipping because there are existing rules"
        );
        return Ok(());
    }

    let rules = default_rules_for_obc(obc, ff_client);
    RuleInstance::bulk_create(
        conn,
        obc,
        &DbActor::Footprint,
        rules
            .into_iter()
            .map(|(e, a, kind)| NewRule {
                rule_expression: e,
                action: a,
                name: None,
                kind,
                is_shadow: false,
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
    use db::tests::MockFFClient;
    use macros::db_test_case;
    use newtypes::CountryRestriction;
    use newtypes::DocTypeRestriction;
    use newtypes::DocumentCdoInfo;
    use newtypes::Selfie;

    fn kyb_vc(ein_only: bool) -> Option<Vec<VerificationCheck>> {
        Some(vec![VerificationCheck::Kyb { ein_only }])
    }

    #[db_test_case(ObConfigurationOpts { ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn),  RA::ManualReview)]].concat() ; "basic KYC")]
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Ssn9], ..Default::default()}, [base_kyc_rules(), ssn_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "basic KYC with SSN")]
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Ssn9], skip_kyc: true, ..Default::default()}, vec![]  ; "SSN but skip_kyc")]
    #[db_test_case(ObConfigurationOpts { optional_data: vec![CDO::Ssn9], ..Default::default()}, [base_kyc_rules(), ssn_rules(), vec![(if_risk_signal(FRC::SsnNotProvided), RA::ManualReview)], vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "basic KYC with optional SSN")]
    #[db_test_case(ObConfigurationOpts { skip_kyc: true, ..Default::default()}, vec![]; "skip_kyc")]
    #[db_test_case(ObConfigurationOpts { skip_kyc: true, enhanced_aml: EnhancedAmlOption::Yes { ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None}, ..Default::default()}, [vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitWarning),  RA::ManualReview), (if_risk_signal(FRC::WatchlistHitPep), RA::ManualReview), (if_risk_signal(FRC::AdverseMediaHit), RA::ManualReview)]].concat() ; "enhanced_aml even with skip kyc")]
    #[db_test_case(ObConfigurationOpts { enhanced_aml: EnhancedAmlOption::Yes { ofac: true, pep: true, adverse_media: true, continuous_monitoring: true, adverse_media_lists: None}, ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitWarning),  RA::ManualReview), (if_risk_signal(FRC::WatchlistHitPep), RA::ManualReview), (if_risk_signal(FRC::AdverseMediaHit), RA::ManualReview)]].concat() ; "enhanced_aml, all options")]
    #[db_test_case(ObConfigurationOpts { enhanced_aml: EnhancedAmlOption::Yes { ofac: false, pep: true, adverse_media: false, continuous_monitoring: true, adverse_media_lists: None}, ..Default::default()}, [base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitPep), RA::ManualReview)]].concat() ; "enhanced_aml, subbset of options")]
    // non-Alpaca but must_collect_data contains DOC CDO
    #[db_test_case(ObConfigurationOpts { must_collect_data: vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))],  ..Default::default()}, [base_doc_rules(false), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "Doc CDO")]
    // doc only (indicated by `kind = Document`)
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Document, must_collect_data: vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))],  ..Default::default()}, base_doc_rules(false); "Doc only")]
    // cip_kind = Alpaca
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, must_collect_data: vec![CDO::BusinessKycedBeneficialOwners, CDO::BusinessTin], verification_checks: kyb_vc(false), ..Default::default()}, [base_kyb_rules(false), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "KYB")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, must_collect_data: vec![CDO::BusinessKycedBeneficialOwners, CDO::BusinessTin], verification_checks: kyb_vc(true), ..Default::default()}, [ein_only_rules(), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "KYB EIN Only")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, must_collect_data: vec![CDO::BusinessBeneficialOwners, CDO::BusinessTin], verification_checks: kyb_vc(false),  ..Default::default()}, [base_kyb_rules(false), base_kyc_rules(), vec![(if_risk_signal(FRC::WatchlistHitOfac), RA::ManualReview), (if_risk_signal(FRC::WatchlistHitNonSdn), RA::ManualReview)]].concat() ; "KYB, non-KYC BO")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, skip_kyc: true, must_collect_data: vec![CDO::BusinessTin], verification_checks: kyb_vc(true), ..Default::default()}, [ein_only_rules()].concat() ; "KYB ein only, no BOs")]
    #[db_test_case(ObConfigurationOpts { kind: ObConfigurationKind::Kyb, skip_kyc: true, must_collect_data: vec![CDO::BusinessTin], verification_checks: kyb_vc(false), ..Default::default()}, [base_kyb_rules(false)].concat() ; "KYB full, no BOs")]
    fn test_default_rules_for_obc(
        conn: &mut TestPgConn,
        obc_opts: ObConfigurationOpts,
        expected: Vec<(RuleExpression, RuleAction)>,
    ) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(conn, &t.id, obc_opts);

        assert_have_same_elements(
            expected,
            default_rules_for_obc(&obc, Some(MockFFClient::new().into_mock()))
                .into_iter()
                .map(|(r, a, _)| (r, a))
                .collect(),
        )
    }
}

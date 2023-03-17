use newtypes::{DbActor, DecisionStatus, OnboardingDecisionId, OnboardingId, VendorAPI};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
    },
    DbPool, TxnPgConn,
};

use super::{
    features::kyc_features::*,
    rule::{self, actionable_rule_set::ActionableRuleSetBuilder, onboarding_rules, RuleName},
};
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::VaultWrapper,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use strum::IntoEnumIterator;

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
/// assert_is_first_decision_for_onboarding determines if an error should be thrown if the onboarding already has a decision made
///     we set this true to perform this check during the initial decisioning we make at the end of Bifrost.
///     we also can make decisions post-Bifrost, when we manually trigger a running of decisioning and in those cases we would set this false
#[tracing::instrument(skip(features, db_pool, ff_client))]
pub async fn save_final_decision(
    ob_id: OnboardingId,
    features: FeatureVector,
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    decision: OnboardingRulesDecisionOutput,
    assert_is_first_decision_for_onboarding: bool,
) -> ApiResult<OnboardingDecision> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status

    let obid = ob_id.clone();
    let tenant_id = db_pool
        .db_query(move |conn| ScopedVault::get(conn, &ob_id))
        .await??
        .tenant_id;

    let tenant_can_view_socure_risk_signal = ff_client.flag(BoolFlag::CanViewSocureRiskSignals(&tenant_id));

    let obd = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &obid)?;
            let scoped_user = ScopedVault::get(conn, &ob.scoped_user_id)?;

            // prevent race conditions from producing 2 decisions
            if assert_is_first_decision_for_onboarding && ob.decision_made_at.is_some() {
                return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
            }

            // If we should commit, mark all data as verified for the onboarding
            let seqno = if decision.should_commit {
                let uvw = VaultWrapper::lock_for_onboarding(conn, &ob.scoped_user_id)?;
                let seqno = uvw.commit_identity_data(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create decision
            let onboarding_decision = OnboardingDecisionCreateArgs {
                user_vault_id: scoped_user.user_vault_id,
                onboarding: &ob,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision.decision_status,
                result_ids: features.verification_results(),
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno,
            };
            let obd = OnboardingDecision::create(conn, onboarding_decision)?;

            let ob = ob.into_inner();
            // Make a billable event here
            ob.update(
                conn,
                OnboardingUpdate::set_has_final_decision(decision.decision_status),
            )?;

            // Create ManualReview row if requested
            if decision.create_manual_review {
                ManualReview::create(conn, obid)?;
            }

            write_risk_signals(
                conn,
                &features,
                obd.id.clone(),
                tenant_can_view_socure_risk_signal,
            )?;

            Ok(obd)
        })
        .await?;
    Ok(obd)
}

#[derive(PartialEq, Eq, Debug)]
pub struct OnboardingRulesDecisionOutput {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
}
pub fn evaluate_onboarding_rules(
    features: &FeatureVector,
    feature_flag_client: &impl FeatureFlagClient,
) -> ApiResult<OnboardingRulesDecisionOutput> {
    // Run our rules and log
    let idology_features = features
        .idology_features
        .as_ref()
        .ok_or_else(|| super::Error::MissingDataForRuleSet(onboarding_rules::idology_base_rule_set().name))?;

    // The set of rules that determine if a user passes onboarding
    let prod_idology_rules = vec![onboarding_rules::idology_base_rule_set()];
    // Additional sets of rules that might be toggled on via a FF or by tenant
    let additional_idology_rules = vec![onboarding_rules::idology_conservative_rule_set()]
        .into_iter()
        .map(|rs| ActionableRuleSetBuilder::new(rs).build(feature_flag_client))
        .collect();

    //
    // PROD
    // Evaluate our rules
    let base = rule::rules_engine::evaluate_onboarding_rules(prod_idology_rules, idology_features);

    // Evaluate conservative rules
    let conservative =
        rule::rules_engine::evaluate_onboarding_rules(additional_idology_rules, idology_features);
    let idology_onboarding_rule_evaluation_result = base.join(conservative);

    //
    // TESTING
    //
    // TODO: might need a concept of prod/prod candidate/shadow style rules here.
    let experian_rules = vec![onboarding_rules::experian_rules()];
    features
        .experian_features
        .as_ref()
        .map(|e| rule::rules_engine::evaluate_onboarding_rules(experian_rules, e));

    // If we no rules that triggered, we consider that a pass
    let decision_status = if idology_onboarding_rule_evaluation_result.triggered {
        DecisionStatus::Fail
    } else {
        DecisionStatus::Pass
    };

    // For now, we just queue up failures so we can see until we have a better sense of
    // what reviews we want to be doing
    let create_manual_review = decision_status == DecisionStatus::Fail;

    let output = OnboardingRulesDecisionOutput {
        should_commit: should_commit(&idology_onboarding_rule_evaluation_result.rules_triggered),
        decision_status,
        create_manual_review,
        rules_triggered: idology_onboarding_rule_evaluation_result.rules_triggered,
        rules_not_triggered: idology_onboarding_rule_evaluation_result.rules_not_triggered,
    };
    Ok(output)
}

fn write_risk_signals(
    conn: &mut TxnPgConn,
    feature_vector: &FeatureVector,
    onboarding_decision_id: OnboardingDecisionId,
    tenant_can_view_socure_risk_signal: bool,
) -> ApiResult<()> {
    let mut vendor_apis: Vec<VendorAPI> = VendorAPI::iter()
        .filter(|v| !matches!(v, &VendorAPI::SocureIDPlus))
        .collect();

    if tenant_can_view_socure_risk_signal {
        vendor_apis.push(VendorAPI::SocureIDPlus)
    }

    let reason_codes = feature_vector.consolidated_reason_codes(vendor_apis);
    RiskSignal::bulk_create(conn, onboarding_decision_id, reason_codes)?;
    Ok(())
}

/// For now, we have very simple logic to decide when to commit which is just "if the only thing that failed this user is a watchlist hit, commit"
///
/// More thoughts: https://www.notion.so/onefootprint/Design-Doc-Portabilization-Decision-71f1cfb945234c58b74e97f005211917?pvs=4
fn should_commit(rules_triggered: &Vec<RuleName>) -> bool {
    rules_triggered.is_empty()
        || (rules_triggered.len() == 1 && rules_triggered.contains(&RuleName::WatchlistHit))
}

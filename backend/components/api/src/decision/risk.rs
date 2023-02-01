use newtypes::{DbActor, DecisionStatus, OnboardingDecisionId, OnboardingId, TenantId, VendorAPI};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_user::ScopedUser,
    },
    TxnPgConnection,
};

use super::{features::*, rule::rule_set::RuleSetResult};
use crate::{decision::rule::rule_impl::idology_rule_set, feature_flag::FeatureFlagClient};
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    feature_flag::LaunchDarklyFeatureFlagClient,
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
#[tracing::instrument(skip(state, features))]
pub async fn create_final_decision(
    state: &State,
    ob_id: OnboardingId,
    features: FeatureVector,
) -> ApiResult<OnboardingDecision> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status
    let feature_flag_client = state.feature_flag_client.clone();
    let obd = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            let scoped_user = ScopedUser::get(conn, &ob.scoped_user_id)?;

            // prevent race conditions from producing 2 decisions
            if ob.has_final_decision {
                return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
            }

            let decision = final_decision(&features, ob.id.clone(), &feature_flag_client)?;

            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision.decision_status == DecisionStatus::Pass {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &ob.scoped_user_id)?;
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

            // If we are done, we no longer need a decision
            if !obd.status.new_decision_required() {
                let ob = ob.into_inner();
                ob.update(conn, OnboardingUpdate::has_final_decision(true))?;
            }

            // Create ManualReview row if requested
            if decision.create_manual_review {
                ManualReview::create(conn, ob_id)?;
            }

            write_risk_signals(
                conn,
                &features,
                obd.id.clone(),
                &feature_flag_client,
                &scoped_user.tenant_id,
            )?;

            Ok(obd)
        })
        .await?;
    Ok(obd)
}

#[derive(PartialEq, Eq, Debug)]
pub struct DecisionOutput {
    pub decision_status: DecisionStatus,
    pub onboarding_id: OnboardingId,
    pub create_manual_review: bool,
}
pub fn final_decision(
    features: &FeatureVector,
    onboarding_id: OnboardingId,
    feature_flag_client: &impl FeatureFlagClient,
) -> ApiResult<DecisionOutput> {
    // Run our rules and log
    // TODO: we should remove status_from_features or add a diff set of defaults
    let (status_from_features, idology_rule_result) = features
        .idology_features
        .as_ref()
        .map(|i| (i.status, idology_rule_set().evaluate(i)))
        .ok_or_else(|| super::Error::MissingDataForRuleSet(idology_rule_set().name))?;

    // Compute our decision from the output of the rules
    let decision_from_idology_ruleset =
        decision_from_ruleset_result(&idology_rule_result, feature_flag_client);

    // If we are make decisions based on the idology rules, use that decision. Else
    // fall back to default
    let decision_status = if decision_from_idology_ruleset.can_action {
        decision_from_idology_ruleset.decision
    } else {
        status_from_features
    };

    // For now, we just queue up failures so we can see until we have a better sense of
    // what reviews we want to be doing
    let create_manual_review = decision_status == DecisionStatus::Fail;

    // Log
    tracing::info!(
        rule_set_name=%idology_rule_result.ruleset_name,
        can_action=%decision_from_idology_ruleset.can_action,
        decision_from_rules=%decision_from_idology_ruleset.decision,
        decision_for_onboarding=%decision_status,
        onboarding_id=%&onboarding_id,
        passing_rules_triggered=%idology_rule_result.passing_rules_triggered.clone().join(","),
        failing_rules_triggered=%idology_rule_result.failing_rules_triggered.clone().join(","),
        rules_not_triggered=%idology_rule_result.rules_not_triggered.clone().join(","),
        create_manual_review=%create_manual_review,
        "Decision Logic result"
    );

    let output = DecisionOutput {
        decision_status,
        onboarding_id,
        create_manual_review,
    };
    Ok(output)
}

struct DecisionFromRuleSet {
    pub can_action: bool,
    pub decision: DecisionStatus,
}
fn decision_from_ruleset_result(
    ruleset_result: &RuleSetResult,
    feature_flag_client: &impl FeatureFlagClient,
) -> DecisionFromRuleSet {
    // Check we can action via a feature flag, allows for shadow rollout of rule sets
    let can_action = feature_flag_client
        .bool_flag_by_rule_set_name("EnableRuleSetForDecision", &ruleset_result.ruleset_name)
        .unwrap_or(false);

    // User passes if they affirmatively are verified, without any negative rules getting fired
    let decision = if ruleset_result.failing_rules_triggered.is_empty()
        && !ruleset_result.passing_rules_triggered.is_empty()
    {
        DecisionStatus::Pass
    } else {
        DecisionStatus::Fail
    };

    DecisionFromRuleSet { can_action, decision }
}

fn write_risk_signals(
    conn: &mut TxnPgConnection,
    feature_vector: &FeatureVector,
    onboarding_decision_id: OnboardingDecisionId,
    feature_flag_client: &LaunchDarklyFeatureFlagClient,
    tenant_id: &TenantId,
) -> ApiResult<()> {
    let mut vendor_apis = vec![
        VendorAPI::IdologyExpectID,
        VendorAPI::IdologyScanVerifySubmission,
        VendorAPI::IdologyScanVerifyResults,
        VendorAPI::IdologyScanOnboarding,
        VendorAPI::TwilioLookupV2,
    ];

    // For now, our Socure contract only allows Footprint to view or use Socure data
    if feature_flag_client
        .bool_flag_by_tenant_id("TenantCanViewSocureRiskSignal", tenant_id)
        .unwrap_or(false)
    {
        vendor_apis.push(VendorAPI::SocureIDPlus);
    }

    let reason_codes = feature_vector.consolidated_reason_codes(vendor_apis);
    RiskSignal::bulk_create(conn, onboarding_decision_id, reason_codes)?;
    Ok(())
}

use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{risk_signal, risk_signal_group, scoped_vault};
use diesel::{prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DataLifetimeSeqno, FootprintReasonCode, FpId, OnboardingDecisionId, RiskSignalGroupId,
    RiskSignalGroupKind, RiskSignalId, ScopedVaultId, TenantId, VendorAPI, VerificationResultId,
};
use std::collections::HashMap;
#[cfg(test)]
use std::str::FromStr;

use super::{data_lifetime::DataLifetime, risk_signal_group::RiskSignalGroup};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = risk_signal)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>, // Currently unused!
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub verification_result_id: VerificationResultId,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
    pub risk_signal_group_id: RiskSignalGroupId,
    /// The seqno at which the risk signal was created.
    /// NOTE: this was backfilled using vreq.seqno on May 6th, 2024
    pub seqno: DataLifetimeSeqno,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = risk_signal)]
pub struct NewRiskSignal {
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub verification_result_id: VerificationResultId,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
    pub risk_signal_group_id: RiskSignalGroupId,
    pub seqno: DataLifetimeSeqno,
}

pub struct IncludeHidden(pub bool);

pub type NewRiskSignalInfo = (FootprintReasonCode, VendorAPI, VerificationResultId);

impl RiskSignal {
    #[tracing::instrument("RiskSignal::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        signals: Vec<NewRiskSignalInfo>,
        risk_group_kind: RiskSignalGroupKind,
        hidden: bool,
    ) -> DbResult<Vec<Self>> {
        let rsg = RiskSignalGroup::create(conn.conn(), scoped_vault_id, risk_group_kind)?;
        let duplicates = Self::generate_duplicate_frc_by_reason_code_and_vendor_api(signals.clone());
        if !duplicates.is_empty() {
            tracing::error!(reason_codes=format!("{:?}", duplicates), scoped_vault_id =%scoped_vault_id, "duplicate reason codes produced");
        }
        Self::bulk_add(conn, signals, hidden, rsg.id)
    }

    #[tracing::instrument("RiskSignal::bulk_add", skip_all)]
    /// Add the provided risk signals to an existing RiskSignalGroup
    pub fn bulk_add(
        conn: &mut TxnPgConn,
        signals: Vec<NewRiskSignalInfo>,
        hidden: bool,
        rsg_id: RiskSignalGroupId,
    ) -> DbResult<Vec<Self>> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_risk_signals: Vec<NewRiskSignal> = signals
            .into_iter()
            .unique()
            .map(|(reason_code, vendor_api, vres_id)| NewRiskSignal {
                onboarding_decision_id: None,
                reason_code,
                created_at: Utc::now(),
                verification_result_id: vres_id,
                hidden,
                vendor_api,
                risk_signal_group_id: rsg_id.clone(),
                seqno,
            })
            .collect();

        let result = diesel::insert_into(risk_signal::table)
            .values(new_risk_signals)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
    }

    fn generate_duplicate_frc_by_reason_code_and_vendor_api(
        signals: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
    ) -> Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)> {
        signals
            .into_iter()
            .fold(
                HashMap::new(),
                |mut acc: HashMap<_, _>, (reason_code, vendor_api, vres_id)| {
                    *acc.entry((reason_code, vendor_api, vres_id)).or_insert(0) += 1;
                    acc
                },
            )
            .into_iter()
            .filter(|(_, count)| *count > 1)
            .collect::<HashMap<(FootprintReasonCode, VendorAPI, VerificationResultId), i32>>()
            .keys()
            .cloned()
            .collect()
    }

    fn query<'a>(
        fp_id: &'a FpId,
        tenant_id: &'a TenantId,
        is_live: bool,
    ) -> risk_signal::BoxedQuery<'a, diesel::pg::Pg> {
        let risk_signal_group_ids = risk_signal_group::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .filter(scoped_vault::deactivated_at.is_null())
            .select(risk_signal_group::id);
        risk_signal::table
            .filter(risk_signal::risk_signal_group_id.eq_any(risk_signal_group_ids))
            .into_boxed()
    }

    #[tracing::instrument("RiskSignal::get_tenant_visible", skip_all)]
    pub fn get_tenant_visible(
        conn: &mut PgConn,
        id: &RiskSignalId,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Self> {
        let signal = Self::query(fp_id, tenant_id, is_live)
            .filter(risk_signal::id.eq(id))
            .filter(risk_signal::hidden.eq(false))
            .get_result::<Self>(conn)?;
        Ok(signal)
    }

    #[tracing::instrument("RiskSignal::latest_by_risk_signal_group_kind", skip_all)]
    pub fn latest_by_risk_signal_group_kind(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: RiskSignalGroupKind,
    ) -> DbResult<Vec<Self>> {
        let rsg = RiskSignalGroup::latest_by_kind(conn, scoped_vault_id, kind)?;
        if let Some(rsg) = rsg {
            // hmm, we need unhidden as well i guess here bc we are decisioning before we decide which ones to unhide
            let res = risk_signal::table
                .filter(risk_signal::risk_signal_group_id.eq(rsg.id))
                .get_results(conn)?;
            Ok(res)
        } else {
            Ok(vec![])
        }
    }

    #[tracing::instrument("RiskSignal::latest_by_risk_signal_group_kinds", skip_all)]
    pub fn latest_by_risk_signal_group_kinds(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        include_hidden: IncludeHidden,
    ) -> DbResult<Vec<(RiskSignalGroupKind, Self)>> {
        // TODO only select the RSGs that have risk signals active at the provided seqno
        let rsg: Vec<RiskSignalGroup> = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scoped_vault_id))
            .order((risk_signal_group::kind, risk_signal_group::created_at.desc()))
            .distinct_on(risk_signal_group::kind)
            .get_results(conn)?;
        let rsg_ids: Vec<RiskSignalGroupId> = rsg.iter().map(|r| r.id.clone()).collect();
        let rsg_map: HashMap<RiskSignalGroupId, RiskSignalGroupKind> =
            rsg.into_iter().map(|r| (r.id, r.kind)).collect();

        let mut query = risk_signal::table
            .filter(risk_signal::risk_signal_group_id.eq_any(rsg_ids))
            .into_boxed();
        if !include_hidden.0 {
            query = query.filter(risk_signal::hidden.eq(false));
        }
        let risk_signals: Vec<RiskSignal> = query.get_results(conn)?;

        // construct output
        let res = risk_signals
            .into_iter()
            .filter_map(|rs| {
                let rsg_kind = rsg_map.get(&rs.risk_signal_group_id).cloned();
                rsg_kind.map(|kind| (kind, rs))
            })
            .collect();

        Ok(res)
    }

    #[tracing::instrument("RiskSignal::unhide_risk_signals_for_risk_signal_group", skip_all)]
    pub fn unhide_risk_signals_for_risk_signal_group(
        conn: &mut TxnPgConn,
        rsg_id: &RiskSignalGroupId,
        vendor_api: VendorAPI,
    ) -> DbResult<usize> {
        let rows_updated = diesel::update(
            risk_signal::table
                .filter(risk_signal::risk_signal_group_id.eq(rsg_id))
                .filter(risk_signal::vendor_api.eq(vendor_api)),
        )
        .set(risk_signal::hidden.eq(false))
        .execute(conn.conn())?;

        Ok(rows_updated)
    }

    // Historically, we were writing RiskSignal's with onboarding_decision_id as a foreign key.
    // Now OBD_id is optional and soon new RiskSignal's will be created with onboarding_decision_id = None and instead have
    // verification_result_id set
    // This function currently preserves legacy behavior in that it will return RS's created within the context of a certain onboarding_decision_id.
    // Legacy RS's will be retrieved as usual through rs.obd_id, but new RS's are retrieved via the onboarding_decision_verification_result_junction table
    #[tracing::instrument("RiskSignal::list_tenant_visible_by_onboarding_decision_id", skip_all)]
    fn list_tenant_visible_by_onboarding_decision_id(
        conn: &mut PgConn,
        onboarding_decision_id: &OnboardingDecisionId,
    ) -> DbResult<Vec<Self>> {
        use db_schema::schema::onboarding_decision_verification_result_junction as obd_vres_junction;
        // Postgres wasn't happy about evaluation a where clause with an OR here, so we just evaluate
        // the two ways of getting risk signals separately and then fetch all rows together
        let ids = risk_signal::table
            .filter(risk_signal::onboarding_decision_id.eq(onboarding_decision_id))
            .filter(risk_signal::hidden.eq(false))
            .select(risk_signal::id)
            .get_results::<RiskSignalId>(conn)?;
        let ids2 = obd_vres_junction::table
            .inner_join(
                risk_signal::table
                    .on(risk_signal::verification_result_id.eq(obd_vres_junction::verification_result_id)),
            )
            .filter(obd_vres_junction::onboarding_decision_id.eq(onboarding_decision_id))
            .filter(risk_signal::hidden.eq(false))
            .select(risk_signal::id)
            .get_results(conn)?;
        let all_ids = ids.into_iter().chain(ids2.into_iter()).unique().collect_vec();
        let results = risk_signal::table
            .filter(risk_signal::id.eq_any(all_ids))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("RiskSignal::list_by_verification_result_id", skip_all)]
    pub fn list_by_verification_result_id(
        conn: &mut PgConn,
        vres_id: &VerificationResultId,
    ) -> DbResult<Vec<Self>> {
        let results = risk_signal::table
            .filter(risk_signal::verification_result_id.eq(vres_id))
            .get_results(conn)?;
        Ok(results)
    }

    #[cfg(test)]
    fn _bulk_create_for_test(conn: &mut PgConn, new: NewRiskSignals) -> DbResult<Vec<Self>> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_risk_signals: Vec<NewRiskSignal> = match new {
            NewRiskSignals::LegacyObd {
                onboarding_decision_id,
                signals,
            } => signals
                .into_iter()
                .map(|(reason_code, vendor_api)| NewRiskSignal {
                    onboarding_decision_id: Some(onboarding_decision_id.clone()),
                    reason_code,
                    created_at: Utc::now(),
                    verification_result_id: VerificationResultId::from_str("vres123").unwrap(),
                    hidden: false,
                    vendor_api,
                    risk_signal_group_id: RiskSignalGroupId::from_str("rsg123").unwrap(),
                    seqno,
                })
                .collect(),
            NewRiskSignals::NewVres { signals } => signals
                .into_iter()
                .map(|(reason_code, vendor_api, vres_id)| NewRiskSignal {
                    onboarding_decision_id: None,
                    reason_code,
                    created_at: Utc::now(),
                    verification_result_id: vres_id,
                    hidden: false,
                    vendor_api,
                    risk_signal_group_id: RiskSignalGroupId::from_str("rsg123").unwrap(),
                    seqno,
                })
                .collect(),
        };

        let result = diesel::insert_into(risk_signal::table)
            .values(new_risk_signals)
            .get_results::<Self>(conn)?;
        Ok(result)
    }
}

// temporary struct to differentiate our legacy way of writing all RS's from various Vres's at once when we create an OBD
// vs our new way which will
#[cfg(test)]
enum NewRiskSignals {
    LegacyObd {
        onboarding_decision_id: OnboardingDecisionId,
        signals: Vec<(FootprintReasonCode, VendorAPI)>,
    },
    NewVres {
        signals: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        models::{
            decision_intent::DecisionIntent,
            onboarding_decision::{NewDecisionArgs, OnboardingDecision},
            scoped_vault::ScopedVault,
            verification_request::VerificationRequest,
            verification_result::VerificationResult,
            workflow::{Workflow, WorkflowUpdate},
        },
        test_helpers::assert_have_same_elements,
        tests::{fixtures, prelude::*},
    };
    use itertools::Itertools;
    use macros::db_test_case;
    use newtypes::{
        DataLifetimeSeqno, DbActor, DecisionIntentId, DecisionIntentKind, DecisionStatus, ScopedVaultId,
    };
    use serde_json::json;

    fn setup(conn: &mut TestPgConn) -> (ScopedVault, DecisionIntent, Workflow) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let uv = fixtures::vault::create_person(conn, true).into_inner();
        let sv = fixtures::scoped_vault::create(conn, &uv.id, &obc.id);
        let wf = fixtures::workflow::create(conn, &sv.id, &obc.id, None);
        let di = crate::models::decision_intent::DecisionIntent::get_or_create_for_workflow(
            conn,
            &sv.id,
            &wf.id,
            DecisionIntentKind::OnboardingKyc,
        )
        .unwrap();

        (sv, di, wf)
    }

    fn create_vres(
        conn: &mut TestPgConn,
        sv_id: &ScopedVaultId,
        di_id: &DecisionIntentId,
        vendor_api: VendorAPI,
    ) -> VerificationResult {
        let vreq = VerificationRequest::create(conn, (sv_id, di_id, vendor_api).into()).unwrap();

        VerificationResult::create(
            conn,
            vreq.id,
            json!({"yo": "sup"}).into(),
            newtypes::SealedVaultBytes(
                newtypes::PiiJsonValue::from(json!({"yo": "sup"}))
                    .leak_to_vec()
                    .unwrap(),
            ),
            false,
        )
        .unwrap()
    }

    enum KeyType {
        Obd,
        Vres,
    }

    #[db_test_case(vec![
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Obd,
        )],
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Obd,
        )]], vec![(VendorAPI::IdologyExpectId, FootprintReasonCode::SubjectDeceased)]; "legacy OBD FK")]
    #[db_test_case(vec![
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Vres,
        )],
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Vres,
        )]], vec![(VendorAPI::IdologyExpectId, FootprintReasonCode::SubjectDeceased)]; "New Vres FK")]
    #[db_test_case(vec![
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Obd,
        )],
        vec![(
            VendorAPI::IdologyExpectId,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Vres,
        )]], vec![(VendorAPI::IdologyExpectId, FootprintReasonCode::SubjectDeceased)]; "legacy OBD FK and new Vres FK")]
    fn test_list_by_onboarding_id(
        conn: &mut TestPgConn,
        input_risk_signal_groups: Vec<Vec<(VendorAPI, Vec<FootprintReasonCode>, KeyType)>>,
        expected_risk_signals: Vec<(VendorAPI, FootprintReasonCode)>,
    ) {
        // Case 1: only RS with OBD (ie historical OBDs)
        // Case 2: only RS with Vres
        // Case 3: mix of RS with OBD and Vres

        let (sv, di, wf) = setup(conn);

        input_risk_signal_groups
            .into_iter()
            .for_each(|input_risk_signals| {
                let vres_with_rs = input_risk_signals
                    .iter()
                    .map(|(vendor_api, reason_codes, key_type)| {
                        (
                            create_vres(conn, &sv.id, &di.id, *vendor_api),
                            vendor_api,
                            reason_codes,
                            key_type,
                        )
                    })
                    .collect::<Vec<_>>();

                let new_decision = NewDecisionArgs {
                    vault_id: sv.vault_id.clone(),
                    logic_git_hash: "123".to_owned(),
                    status: DecisionStatus::Pass,
                    result_ids: vres_with_rs
                        .iter()
                        .map(|(vres, _, _, _)| vres.id.clone())
                        .collect(),
                    annotation_id: None,
                    actor: DbActor::Footprint,
                    seqno: DataLifetimeSeqno::from(0),
                    manual_reviews: vec![],
                    rule_set_result_id: None,
                };

                let wf = Workflow::lock(conn, &wf.id).unwrap();
                let update = WorkflowUpdate::set_decision(&wf, new_decision);
                let wf = Workflow::update(wf, conn, update).unwrap();
                let obd = OnboardingDecision::get_active(conn, &wf.id).unwrap().unwrap();

                for (vres, vendor_api, reason_codes, key_type) in vres_with_rs {
                    let new_risk_signals = match key_type {
                        KeyType::Obd => NewRiskSignals::LegacyObd {
                            onboarding_decision_id: obd.id.clone(),
                            signals: reason_codes
                                .iter()
                                .map(|rc| (rc.clone(), *vendor_api))
                                .collect_vec(),
                        },
                        KeyType::Vres => NewRiskSignals::NewVres {
                            signals: reason_codes
                                .iter()
                                .map(|rc| (rc.clone(), *vendor_api, vres.id.clone()))
                                .collect_vec(),
                        },
                    };

                    RiskSignal::_bulk_create_for_test(conn, new_risk_signals).unwrap();
                }
            });

        let latest_obd =
            OnboardingDecision::latest_footprint_actor_decision(conn, &sv.fp_id, &sv.tenant_id, sv.is_live)
                .unwrap()
                .unwrap();
        let rs = RiskSignal::list_tenant_visible_by_onboarding_decision_id(conn, &latest_obd.id).unwrap();
        assert_have_same_elements(
            expected_risk_signals,
            rs.into_iter().map(|rs| (rs.vendor_api, rs.reason_code)).collect(),
        );
    }

    fn vres_id(s: &str) -> VerificationResultId {
        VerificationResultId::from_str(s).unwrap()
    }
    #[db_test_case(vec![] => false)]
    #[db_test_case(vec![
        (FootprintReasonCode::SubjectDeceased, VendorAPI::IdologyExpectId, vres_id("vres1")),
        (FootprintReasonCode::SubjectDeceased, VendorAPI::ExperianPreciseId, vres_id("vres2")),
    ] => false)]
    #[db_test_case(vec![
        (FootprintReasonCode::SubjectDeceased, VendorAPI::IdologyExpectId, vres_id("vres1")),
        (FootprintReasonCode::SubjectDeceased, VendorAPI::IdologyExpectId, vres_id("vres2")),
    ] => false)]
    #[db_test_case(vec![
        (FootprintReasonCode::SubjectDeceased, VendorAPI::IdologyExpectId, vres_id("vres1")),
        (FootprintReasonCode::SubjectDeceased, VendorAPI::IdologyExpectId, vres_id("vres1")),
    ] => true)]
    fn test_generate_duplicate_frc_by_reason_code_and_vendor_api(
        _conn: &mut TestPgConn,
        signals: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
    ) -> bool {
        // duplicates exist if non-empty
        !RiskSignal::generate_duplicate_frc_by_reason_code_and_vendor_api(signals).is_empty()
    }
}

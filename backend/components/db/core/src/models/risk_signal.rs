use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::risk_signal;
use db_schema::schema::risk_signal_group;
use db_schema::schema::scoped_vault;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::RiskSignalGroupId;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::{FootprintReasonCode, FpId, OnboardingDecisionId, RiskSignalId, TenantId};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
#[cfg(test)]
use std::str::FromStr;

use super::risk_signal_group::RiskSignalGroup;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = risk_signal)]
pub struct NewRiskSignal {
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub verification_result_id: VerificationResultId,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
    pub risk_signal_group_id: RiskSignalGroupId,
}

pub struct IncludeHidden(pub bool);

impl RiskSignal {
    #[tracing::instrument("RiskSignal::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        signals: Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
        risk_group_kind: RiskSignalGroupKind,
        hidden: bool,
    ) -> DbResult<Vec<Self>> {
        let rsg = RiskSignalGroup::create(conn.conn(), scoped_vault_id, risk_group_kind)?;

        let new_risk_signals: Vec<NewRiskSignal> = signals
            .into_iter()
            .map(|(reason_code, vendor_api, vres_id)| NewRiskSignal {
                onboarding_decision_id: None,
                reason_code,
                created_at: Utc::now(),
                verification_result_id: vres_id,
                hidden,
                vendor_api,
                risk_signal_group_id: rsg.id.clone(),
            })
            .collect();

        let result = diesel::insert_into(risk_signal::table)
            .values(new_risk_signals)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
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
        // hmm, we need unhidden as well i guess here bc we are decisioning before we decide which ones to unhide
        let res = risk_signal::table
            .filter(risk_signal::risk_signal_group_id.eq(rsg.id))
            .get_results(conn)?;
        Ok(res)
    }

    #[tracing::instrument("RiskSignal::latest_by_risk_signal_group_kinds", skip_all)]
    pub fn latest_by_risk_signal_group_kinds(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        include_hidden: IncludeHidden,
    ) -> DbResult<Vec<(RiskSignalGroupKind, Self)>> {
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
                let rsg_id = rs.risk_signal_group_id.clone();
                let rsg_kind = rsg_map.get(&rsg_id).cloned();

                rsg_kind.map(|kind| (kind, rs))
            })
            .collect();

        Ok(res)
    }

    #[tracing::instrument("RiskSignal::unhide_risk_signals_for_risk_signal_group", skip_all)]
    pub fn unhide_risk_signals_for_risk_signal_group(
        conn: &mut TxnPgConn,
        rsg_id: &RiskSignalGroupId,
        vendor_apis: Vec<VendorAPI>,
    ) -> DbResult<usize> {
        let rows_updated = diesel::update(
            risk_signal::table
                .filter(risk_signal::risk_signal_group_id.eq(rsg_id))
                .filter(risk_signal::vendor_api.eq_any(vendor_apis)),
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
    pub fn list_tenant_visible_by_onboarding_decision_id(
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

    #[cfg(test)]
    fn _bulk_create_for_test(conn: &mut PgConn, new: NewRiskSignals) -> DbResult<Vec<Self>> {
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
    use crate::models::decision_intent::DecisionIntent;
    use crate::models::onboarding::Onboarding;
    use crate::models::onboarding_decision::OnboardingDecision;
    use crate::models::onboarding_decision::OnboardingDecisionCreateArgs;
    use crate::models::scoped_vault::ScopedVault;
    use crate::models::verification_request::VerificationRequest;
    use crate::models::verification_result::VerificationResult;
    use crate::models::workflow::Workflow;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use itertools::Itertools;
    use macros::db_test_case;
    use newtypes::DecisionIntentKind;
    use newtypes::Locked;
    use newtypes::{DbActor, DecisionIntentId, DecisionStatus, ScopedVaultId};
    use serde_json::json;

    fn setup(conn: &mut TestPgConn) -> (ScopedVault, DecisionIntent, Locked<Onboarding>, Workflow) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let uv = fixtures::vault::create_person(conn, true).into_inner();
        let sv = fixtures::scoped_vault::create(conn, &uv.id, &obc.id);
        let (ob, wf) = fixtures::onboarding::create(conn, sv.id.clone(), obc.id, None);
        let di = crate::models::decision_intent::DecisionIntent::get_or_create_for_workflow_and_kind(
            conn,
            &sv.id,
            &wf.id,
            DecisionIntentKind::OnboardingKyc,
        )
        .unwrap();
        let ob = Onboarding::lock(conn, &ob.id).unwrap();

        (sv, di, ob, wf)
    }

    fn create_vres(
        conn: &mut TestPgConn,
        sv_id: &ScopedVaultId,
        di_id: &DecisionIntentId,
        vendor_api: VendorAPI,
    ) -> VerificationResult {
        let vreq = VerificationRequest::create(conn, sv_id, di_id, vendor_api).unwrap();

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
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Obd,
        )],
        vec![(
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Obd,
        )]], vec![(VendorAPI::IdologyExpectID, FootprintReasonCode::SubjectDeceased)]; "legacy OBD FK")]
    #[db_test_case(vec![
        vec![(
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Vres,
        )],
        vec![(
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Vres,
        )]], vec![(VendorAPI::IdologyExpectID, FootprintReasonCode::SubjectDeceased)]; "New Vres FK")]
    #[db_test_case(vec![
        vec![(
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SsnInputTiedToMultipleNames],
            KeyType::Obd,
        )],
        vec![(
            VendorAPI::IdologyExpectID,
            vec![FootprintReasonCode::SubjectDeceased],
            KeyType::Vres,
        )]], vec![(VendorAPI::IdologyExpectID, FootprintReasonCode::SubjectDeceased)]; "legacy OBD FK and new Vres FK")]
    fn test_list_by_onboarding_id(
        conn: &mut TestPgConn,
        input_risk_signal_groups: Vec<Vec<(VendorAPI, Vec<FootprintReasonCode>, KeyType)>>,
        expected_risk_signals: Vec<(VendorAPI, FootprintReasonCode)>,
    ) {
        // Case 1: only RS with OBD (ie historical OBDs)
        // Case 2: only RS with Vres
        // Case 3: mix of RS with OBD and Vres

        let (sv, di, _, wf) = setup(conn);

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

                let obd = OnboardingDecision::create(
                    conn,
                    OnboardingDecisionCreateArgs {
                        vault_id: sv.vault_id.clone(),
                        scoped_vault_id: sv.id.clone(),
                        logic_git_hash: "123".to_owned(),
                        status: DecisionStatus::Pass,
                        result_ids: vres_with_rs
                            .iter()
                            .map(|(vres, _, _, _)| vres.id.clone())
                            .collect(),
                        annotation_id: None,
                        actor: DbActor::Footprint,
                        seqno: None,
                        workflow_id: wf.id.clone(),
                    },
                )
                .unwrap();

                let _all_created_risk_signals = vres_with_rs
                    .into_iter()
                    .map(|(vres, vendor_api, reason_codes, key_type)| {
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

                        RiskSignal::_bulk_create_for_test(conn, new_risk_signals).unwrap()
                    })
                    .collect::<Vec<_>>();
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
}

use super::data_lifetime::DataLifetime;
use super::risk_signal_group::RiskSignalGroup;
use super::risk_signal_group::RiskSignalGroupScope;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::risk_signal;
use db_schema::schema::risk_signal_group;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::FootprintReasonCode;
use newtypes::OnboardingDecisionId;
use newtypes::RiskSignalGroupId;
use newtypes::RiskSignalGroupKind;
use newtypes::RiskSignalId;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Eq, PartialEq)]
#[diesel(table_name = risk_signal)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>, // Currently unused!
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    // Option means a risk signal was generated outside of a vendor call context
    pub verification_result_id: Option<VerificationResultId>,
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
    pub verification_result_id: Option<VerificationResultId>,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
    pub risk_signal_group_id: RiskSignalGroupId,
    pub seqno: DataLifetimeSeqno,
}

pub type NewRiskSignalInfo = (FootprintReasonCode, VendorAPI, VerificationResultId);
pub type NewNonVendorRiskSignalInfo = (FootprintReasonCode, VendorAPI, Option<VerificationResultId>);

pub struct NewRiskSignalArgs {
    pub reason_code: FootprintReasonCode,
    pub verification_result_id: Option<VerificationResultId>,
    pub vendor_api: VendorAPI,
}

impl From<NewRiskSignalInfo> for NewRiskSignalArgs {
    fn from(val: NewRiskSignalInfo) -> NewRiskSignalArgs {
        let (reason_code, vendor_api, vres_id) = val;
        NewRiskSignalArgs {
            reason_code,
            verification_result_id: Some(vres_id),
            vendor_api,
        }
    }
}

impl From<NewNonVendorRiskSignalInfo> for NewRiskSignalArgs {
    fn from(val: NewNonVendorRiskSignalInfo) -> NewRiskSignalArgs {
        let (reason_code, vendor_api, vres_id) = val;
        NewRiskSignalArgs {
            reason_code,
            verification_result_id: vres_id,
            vendor_api,
        }
    }
}

pub enum RiskSignalFilter<'a> {
    AtSeqno(DataLifetimeSeqno),
    WorkflowId(&'a WorkflowId),
    LegacyLatest,
}

#[derive(derive_more::Deref)]
pub struct AtSeqno(pub Option<DataLifetimeSeqno>);

impl RiskSignal {
    #[tracing::instrument("RiskSignal::bulk_create", skip_all)]
    pub fn bulk_create<'a>(
        conn: &mut TxnPgConn,
        risk_group_scope: RiskSignalGroupScope<'a>,
        signals: Vec<NewRiskSignalInfo>,
        risk_group_kind: RiskSignalGroupKind,
        hidden: bool,
    ) -> FpResult<Vec<Self>> {
        let rsg = RiskSignalGroup::create(conn.conn(), risk_group_scope, risk_group_kind)?;
        Self::bulk_add(conn, signals, hidden, rsg.id)
    }

    #[tracing::instrument("RiskSignal::bulk_add", skip_all)]
    /// Add the provided risk signals to an existing RiskSignalGroup
    pub fn bulk_add<T>(
        conn: &mut TxnPgConn,
        signals: Vec<T>,
        hidden: bool,
        rsg_id: RiskSignalGroupId,
    ) -> FpResult<Vec<Self>>
    where
        T: Into<NewRiskSignalArgs> + Clone + Eq + PartialEq + std::hash::Hash,
    {
        let duplicates = Self::generate_duplicate_frc_by_reason_code_and_vendor_api(signals.clone());
        if !duplicates.is_empty() {
            tracing::info!(reason_codes=format!("{:?}", duplicates), rsg_id =%rsg_id, "duplicate_reason_codes");
        }

        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_risk_signals: Vec<NewRiskSignal> = signals
            .into_iter()
            .unique()
            .map(|info| {
                let args: NewRiskSignalArgs = info.into();
                NewRiskSignal {
                    onboarding_decision_id: None,
                    reason_code: args.reason_code,
                    created_at: Utc::now(),
                    verification_result_id: args.verification_result_id,
                    hidden,
                    vendor_api: args.vendor_api,
                    risk_signal_group_id: rsg_id.clone(),
                    seqno,
                }
            })
            .collect();

        let result = diesel::insert_into(risk_signal::table)
            .values(new_risk_signals)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
    }

    fn generate_duplicate_frc_by_reason_code_and_vendor_api<T>(
        signals: Vec<T>,
    ) -> Vec<(FootprintReasonCode, VendorAPI, Option<VerificationResultId>)>
    where
        T: Into<NewRiskSignalArgs> + Clone + Eq + PartialEq + std::hash::Hash,
    {
        let signals = signals
            .into_iter()
            .map(|s| {
                let args = s.into();
                (args.reason_code, args.vendor_api, args.verification_result_id)
            })
            .collect_vec();
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
            .collect::<HashMap<(FootprintReasonCode, VendorAPI, Option<VerificationResultId>), i32>>()
            .keys()
            .cloned()
            .collect()
    }

    #[tracing::instrument("RiskSignal::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &RiskSignalId, sv_id: &ScopedVaultId) -> FpResult<Self> {
        let signal = risk_signal::table
            .inner_join(risk_signal_group::table)
            .filter(risk_signal_group::scoped_vault_id.eq(sv_id))
            .filter(risk_signal::id.eq(id))
            .filter(risk_signal::hidden.eq(false))
            .select(risk_signal::all_columns)
            .get_result::<Self>(conn)?;
        Ok(signal)
    }

    #[tracing::instrument("RiskSignal::latest_by_risk_signal_group_kind", skip_all)]
    pub fn latest_by_risk_signal_group_kind(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: RiskSignalGroupKind,
    ) -> FpResult<Vec<Self>> {
        // TODO: For now we only pull risk signals by sv_id. Keep this interface as is for now
        let rsg = RiskSignalGroup::latest_by_kind(conn, scoped_vault_id, kind)?;
        if let Some(rsg) = rsg {
            // hmm, we need unhidden as well i guess here bc we are decisioning before we decide which ones to
            // unhide
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
        filters: RiskSignalFilter,
    ) -> FpResult<Vec<(RiskSignalGroupKind, Self)>> {
        // First, fetch the most recent RSGs per kind that has any visible RSes
        let mut query = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scoped_vault_id))
            .filter(risk_signal::hidden.eq(false))
            .inner_join(risk_signal::table)
            .order((risk_signal_group::kind, risk_signal_group::created_at.desc()))
            .distinct_on(risk_signal_group::kind)
            .select(risk_signal_group::all_columns)
            .into_boxed();

        match filters {
            RiskSignalFilter::AtSeqno(at_seqno) => {
                query = query.filter(risk_signal::seqno.le(at_seqno));
            }
            RiskSignalFilter::WorkflowId(workflow_id) => {
                query = query.filter(risk_signal_group::workflow_id.eq(workflow_id));
            }
            RiskSignalFilter::LegacyLatest => {}
        };

        let rsgs = query.get_results::<RiskSignalGroup>(conn)?;
        let rsg_kinds: HashMap<_, _> = rsgs.into_iter().map(|r| (r.id, r.kind)).collect();
        let rsg_ids = rsg_kinds.keys().cloned().collect_vec();

        // Then, fetch the visible RSes in each RSG
        let mut query = risk_signal::table
            .filter(risk_signal::risk_signal_group_id.eq_any(rsg_ids))
            .filter(risk_signal::hidden.eq(false))
            .into_boxed();

        if let RiskSignalFilter::AtSeqno(at_seqno) = filters {
            query = query.filter(risk_signal::seqno.le(at_seqno));
        }

        let risk_signals = query.get_results::<Self>(conn)?;

        // construct output
        let res = risk_signals
            .into_iter()
            .filter_map(|rs| rsg_kinds.get(&rs.risk_signal_group_id).map(|kind| (*kind, rs)))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("RiskSignal::unhide_risk_signals_for_risk_signal_group", skip_all)]
    pub fn unhide_risk_signals_for_risk_signal_group(
        conn: &mut TxnPgConn,
        rsg_id: &RiskSignalGroupId,
        vendor_api: VendorAPI,
    ) -> FpResult<usize> {
        let rows_updated = diesel::update(
            risk_signal::table
                .filter(risk_signal::risk_signal_group_id.eq(rsg_id))
                .filter(risk_signal::vendor_api.eq(vendor_api)),
        )
        .set(risk_signal::hidden.eq(false))
        .execute(conn.conn())?;

        Ok(rows_updated)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test_case;
    use std::str::FromStr;


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

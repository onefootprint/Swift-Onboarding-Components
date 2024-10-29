use super::KycComplete;
use super::KycDataCollection;
use super::KycDecisioning;
use super::KycDocCollection;
use super::KycState;
use super::KycVendorCalls;
use super::MakeDecision;
use super::MakeVendorCalls;
use crate::decision::features::risk_signals::fetch_latest_risk_signals_map;
use crate::decision::features::risk_signals::parse_reason_codes;
use crate::decision::features::risk_signals::parse_reason_codes_from_vendor_result;
use crate::decision::features::risk_signals::UserSubmittedInfoForFRC;
use crate::decision::features::{
    self,
};
use crate::decision::rule_engine::engine::EvaluateWorkflowDecisionArgs;
use crate::decision::rule_engine::engine::VaultDataForRules;
use crate::decision::rule_engine::{
    self,
};
use crate::decision::state::actions::Authorize;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::common::DecisionOutput;
use crate::decision::state::common::{
    self,
};
use crate::decision::state::DocCollected;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::decision::utils::get_final_rules_outcome;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::{
    self,
};
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::document_request::DocumentRequest;
use db::models::list_entry::ListEntry;
use db::models::list_entry::ListWithDecryptedEntries;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroup;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::rule_instance::RuleInstance;
use db::models::vault::Vault;
use db::models::workflow::Workflow as DbWorkflow;
use feature_flag::FeatureFlagClient;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::neuro_id::response::NeuroIdAnalyticsResponse;
use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::DocumentRequestKind;
use newtypes::EnhancedAmlOption;
use newtypes::KycConfig;
use newtypes::ListId;
use newtypes::Locked;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleSetResultKind;
use newtypes::VendorAPI;
use newtypes::VerificationCheckKind;
use newtypes::VerificationResultId;
use newtypes::WorkflowFixtureResult;
use std::collections::HashMap;
use std::sync::Arc;
use twilio::response::lookup::LookupV2Response;

/////////////////////
/// DataCollection
/// ////////////////
impl KycDataCollection {
    #[tracing::instrument("KycDataCollection::init", skip_all)]
    pub async fn init(
        state: &State,
        workflow: DbWorkflow,
        _: KycConfig,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDataCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
            seqno,
        })
    }
}

#[async_trait]
impl OnAction<Authorize, KycState> for KycDataCollection {
    type AsyncRes = ();

    #[tracing::instrument("OnAction<Authorize, KycState>::execute_async_idempotent_actions", skip_all)]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        _state: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<Authorize, KycState>::on_commit", skip_all)]
    fn on_commit(self, wf: Locked<DbWorkflow>, _: (), conn: &mut db::TxnPgConn) -> FpResult<KycState> {
        DbWorkflow::update_status_if_valid(wf, conn, OnboardingStatus::Pending)?;
        Ok(KycState::from(KycVendorCalls {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
            seqno: self.seqno,
        }))
    }
}

impl WorkflowState for KycDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DataCollection)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl KycVendorCalls {
    #[tracing::instrument("KycVendorCalls::init", skip_all)]
    pub async fn init(
        state: &State,
        workflow: DbWorkflow,
        _: KycConfig,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycVendorCalls {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
            seqno,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KycState> for KycVendorCalls {
    type AsyncRes = Box<(
        Option<Vec<NewRiskSignalInfo>>,
        Vec<NewRiskSignalInfo>,
        Option<VendorResult>,
        Option<(VerificationResultId, WatchlistResultResponse)>,
        Arc<dyn FeatureFlagClient>,
        Option<VendorResult>,
        Option<(NeuroIdAnalyticsResponse, VerificationResultId)>,
        Option<(LookupV2Response, VerificationResultId)>,
        Option<(ValidatedApplicationRiskResponse, VerificationResultId)>,
    )>;

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        action: MakeVendorCalls,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let wfid = self.wf_id.clone();
        let svid = self.sv_id.clone();
        let (vw, obc, wf) = state
            .db_query(move |conn| -> FpResult<_> {
                let (vw, obc) = common::get_vw_and_obc(conn, &svid, action.seqno, &wfid)?;
                let wf = DbWorkflow::get(conn, &wfid)?;

                Ok((vw, obc, wf))
            })
            .await?;

        // TODO: we should also skip if the UVW is non-US, but then we probably need to assert that doc was
        // collected. Also need to clairfy tenant's understanding of this
        let (kyc_vendor_result, user_input_reason_codes) = if !obc.verification_checks().skip_kyc() {
            let kyc_vendor_result = common::run_kyc_vendor_calls(state, &self.wf_id, &self.t_id).await?;
            let user_input_reason_codes = features::user_input::generate_user_input_risk_signals(
                &state.enclave_client,
                &vw,
                &obc,
                kyc_vendor_result.vendor_api(),
                &kyc_vendor_result.verification_result_id,
            )
            .await?;
            (Some(kyc_vendor_result), user_input_reason_codes)
        } else {
            (None, vec![])
        };

        //
        // Run Additional Checks
        //
        let curp_result = if obc
            .verification_checks()
            .is_enabled(VerificationCheckKind::CurpValidation)
        {
            // once this is stable, we should err.
            match common::run_curp_check(state, &self.wf_id).await {
                Ok(res) => res,
                Err(err) => {
                    tracing::error!(?err, wf_id=?self.wf_id, "error running curp validation");
                    None
                }
            }
        } else {
            None
        };

        let twilio_result = if obc
            .verification_checks()
            .get(VerificationCheckKind::Phone)
            .is_some()
        {
            match common::run_twilio_check(state, &self.wf_id, &obc).await {
                Ok(res) => res,
                Err(err) => {
                    tracing::error!(?err, wf_id=?self.wf_id, "error running twilio");
                    None
                }
            }
        } else {
            None
        };

        let is_neuro_enabled_obc = obc
            .verification_checks()
            .is_enabled(VerificationCheckKind::NeuroId);

        let is_neuro_enabled_for_workflow = wf.is_neuro_enabled;
        let neuro_result = if is_neuro_enabled_obc && is_neuro_enabled_for_workflow {
            match common::run_neuro_check(state, &self.wf_id, &self.t_id).await {
                Ok(res) => res,
                Err(err) => {
                    tracing::warn!(?err, wf_id=?self.wf_id, "error running NeuroID");
                    None
                }
            }
        } else {
            // if FF and workflow get out of sync, make some noise
            if is_neuro_enabled_obc != is_neuro_enabled_for_workflow {
                tracing::warn!(
                    ?is_neuro_enabled_obc,
                    ?is_neuro_enabled_for_workflow,
                    "Neuro wf and ff disagree, not running neuro API call"
                )
            }
            None
        };

        // TODO: Figure out the right way to represent in our product (e.g. VerificationChecks)
        //   FF is temporary to avoid serializing stuff in DB that we need to fix later
        // TODO: FP reason codes
        // TODO: models for storing score-specific reason codes?
        let sentilink_result = if obc
            .verification_checks()
            .is_enabled(VerificationCheckKind::Sentilink)
        {
            match common::run_application_risk(state, &self.wf_id, &self.t_id).await {
                Ok(res) => res,
                Err(err) => {
                    tracing::warn!(?err, wf_id=?self.wf_id, "error running sentilink");
                    None
                }
            }
        } else {
            None
        };


        let aml_vendor_result = match obc.verification_checks().enhanced_aml() {
            EnhancedAmlOption::No => None,
            EnhancedAmlOption::Yes { .. } => {
                Some(common::run_aml_call(state, &self.wf_id, &self.t_id).await?)
            }
        };

        let ocr_reason_codes = common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &vw).await?;

        Ok(Box::new((
            ocr_reason_codes,
            user_input_reason_codes,
            kyc_vendor_result,
            aml_vendor_result,
            state.ff_client.clone(),
            curp_result,
            neuro_result,
            twilio_result,
            sentilink_result,
        )))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<KycState> {
        let (
            ocr_reason_codes,
            user_input_risk_signals,
            kyc_vendor_result,
            aml_vendor_result,
            ff_client,
            curp_result,
            neuro_result,
            twilio_result,
            sentilink_result,
        ) = *async_res;
        let (vw, obc) = common::get_vw_and_obc(conn, &self.sv_id, self.seqno, &self.wf_id)?;
        let user_submitted_info = UserSubmittedInfoForFRC::new(&vw);
        // For all reason codes, we scope them to the onboarding/wf
        let risk_signal_group_scope = RiskSignalGroupScope::WorkflowId {
            id: &wf.id,
            sv_id: &wf.scoped_vault_id,
        };

        let curp_reason_codes = curp_result.map(|v| {
            let vendor_api: VendorAPI = (&v.response.response).into();
            let vres_id = v.verification_result_id.clone();
            parse_reason_codes(v, user_submitted_info)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect()
        });
        let new_doc_reason_codes: Vec<NewRiskSignalInfo> = vec![ocr_reason_codes, curp_reason_codes]
            .into_iter()
            .flatten()
            .flatten()
            .collect();

        // Save OCR risk signals for doc-first OBC if necessary
        if !new_doc_reason_codes.is_empty() {
            // We save under the same RSG created during the incode state machine if it ran so we
            // don't invalidate the old RSG

            let rsg = RiskSignalGroup::get_or_create(
                conn,
                risk_signal_group_scope.clone(),
                RiskSignalGroupKind::Doc,
            )?;
            RiskSignal::bulk_add(conn, new_doc_reason_codes, false, rsg.id)?;
        }

        if let Some((neuro_res, vres_id)) = neuro_result {
            let vendor_api: VendorAPI = VendorAPI::NeuroIdAnalytics;
            let neuro_frc = features::neuro_id::footprint_reason_codes(&neuro_res)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();

            let rsg = RiskSignalGroup::get_or_create(
                conn,
                risk_signal_group_scope.clone(),
                RiskSignalGroupKind::Behavior,
            )?;
            RiskSignal::bulk_add(conn, neuro_frc, false, rsg.id)?;
        }

        if let Some((sentilink_res, vres_id)) = sentilink_result {
            let vendor_api: VendorAPI = VendorAPI::SentilinkApplicationRisk;
            let sentilink_frc = features::sentilink::footprint_reason_codes(&sentilink_res)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();
            let rsg = RiskSignalGroup::create(
                conn,
                risk_signal_group_scope.clone(),
                RiskSignalGroupKind::Synthetic,
            )?;
            RiskSignal::bulk_add(conn, sentilink_frc, false, rsg.id)?;
        }

        if let Some((twilio_res, vres_id)) = twilio_result {
            // TODO: cleaning this up in separate stack
            // https://linear.app/footprint/issue/BE-365/remove-parsedresponse
            let vendor_api: VendorAPI = VendorAPI::TwilioLookupV2;
            let twilio_frc = features::twilio::footprint_reason_codes(&twilio_res)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();

            let rsg = RiskSignalGroup::get_or_create(
                conn,
                risk_signal_group_scope.clone(),
                RiskSignalGroupKind::Phone,
            )?;
            RiskSignal::bulk_add(conn, twilio_frc, false, rsg.id)?;
        }

        let fixture_result = decision::utils::get_fixture_result(ff_client, &vw.vault, &wf, &self.t_id)?;
        // Save KYC risk signals, if we made KYC calls
        if let Some(kyc_vendor_result) = &kyc_vendor_result {
            let kyc_risk_signals = if let Some(fd) = fixture_result {
                let reason_codes = decision::sandbox::get_fixture_kyc_reason_codes(fd, &obc);
                let vres_id = kyc_vendor_result.verification_result_id.clone();

                reason_codes
                    .into_iter()
                    .map(|r| (r.0, r.1, vres_id.clone()))
                    .collect()
            } else {
                parse_reason_codes_from_vendor_result(kyc_vendor_result.clone(), &vw)?.kyc
                // TODO: only call this once and re-use for aml portion below
            };

            let rses = kyc_risk_signals
                .into_iter()
                .chain(user_input_risk_signals)
                .collect();
            RiskSignal::bulk_create(
                conn,
                risk_signal_group_scope.clone(),
                rses,
                RiskSignalGroupKind::Kyc,
                false,
            )?;
        }

        // Save AML risk signals from Aml call or Kyc call (or save nothing if neither called)
        if let Some((watchlist_vres_id, watchlist_result_response)) = aml_vendor_result {
            let aml_risk_signals = if let Some(fixture_result) = fixture_result {
                let reason_codes = decision::sandbox::get_fixture_aml_reason_codes(&fixture_result, &obc);

                reason_codes
                    .into_iter()
                    .map(|r| (r.0, r.1, watchlist_vres_id.clone()))
                    .collect()
            } else {
                common::get_aml_risk_signals_from_aml_call(
                    &obc,
                    &watchlist_vres_id,
                    &watchlist_result_response,
                )
            };
            RiskSignal::bulk_create(
                conn,
                risk_signal_group_scope.clone(),
                aml_risk_signals,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        } else if let Some(kyc_vendor_result) = kyc_vendor_result {
            let aml_risk_signals = common::get_aml_risk_signals_from_kyc_call(&vw, kyc_vendor_result)?;
            RiskSignal::bulk_create(
                conn,
                risk_signal_group_scope,
                aml_risk_signals,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        };

        Ok(KycState::from(KycDecisioning::new(
            self.wf_id, self.sv_id, self.t_id, self.seqno,
        )))
    }
}

impl WorkflowState for KycVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::VendorCalls)
    }

    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl KycDecisioning {
    #[tracing::instrument("KycDecisioning::init", skip_all)]
    pub async fn init(
        state: &State,
        workflow: DbWorkflow,
        _: KycConfig,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDecisioning::new(
            workflow.id,
            workflow.scoped_vault_id.clone(),
            sv.tenant_id,
            seqno,
        ))
    }
}

#[async_trait]
impl OnAction<MakeDecision, KycState> for KycDecisioning {
    type AsyncRes = (
        Arc<dyn FeatureFlagClient>,
        VaultDataForRules,
        HashMap<ListId, ListWithDecryptedEntries>,
    );

    #[tracing::instrument(
        "OnAction<MakeDecision, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        action: MakeDecision,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let wfid = self.wf_id.clone();
        let rule_kind = self.include_rules;
        let (tenant, rules, vw, lists) = state
            .db_query(move |conn| -> FpResult<_> {
                let (obc, tenant) = ObConfiguration::get(conn, &wfid)?;
                let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, rule_kind)?;

                // TODO: should technically pass this seqno to RuleSetResult to store in pg instead of pulling
                // a new seqno inside the RSR write itself
                let vw = VaultWrapper::<Any>::build_for_tenant_version(conn, &svid, action.seqno)?;

                let lists = ListEntry::list_bulk(conn, &common::list_ids_from_rules(&rules))?;

                Ok((tenant, rules, vw, lists))
            })
            .await?;

        let rule_exprs = rules.iter().map(|r| &r.rule_expression).collect_vec();
        let vault_data_for_rules = VaultDataForRules::decrypt_for_rules(state, vw, &rule_exprs).await?;
        let lists_for_rules = common::saturate_list_entries(state, &tenant, lists).await?;

        Ok((state.ff_client.clone(), vault_data_for_rules, lists_for_rules))
    }

    #[tracing::instrument("OnAction<MakeDecision, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<KycState> {
        let (ff_client, vault_data_for_rules, lists_for_rules) = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        let fixture_result = decision::utils::get_fixture_result(ff_client.clone(), &v, &wf, &self.t_id)?;
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        let doc_collected = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some();
        let review_reasons = common::get_review_reasons(&risk_signals, doc_collected, &obc);

        // Always execute real Rules, even in sandbox. But below we just use the sandbox fixture decision
        // instead of the decision from these real Rules
        let args = EvaluateWorkflowDecisionArgs {
            sv_id: &wf.scoped_vault_id,
            obc_id: &obc.id,
            wf_id: &wf.id,
            kind: RuleSetResultKind::WorkflowDecision,
            risk_signals: risk_signals.risk_signals,
            vault_data: &vault_data_for_rules,
            lists: &lists_for_rules,
            is_fixture: fixture_result.is_some(),
            include_rules: self.include_rules,
        };
        let (decision, rsr_id) = rule_engine::engine::evaluate_workflow_decision(conn, args)?;

        let fixture_result = if fixture_result == Some(WorkflowFixtureResult::StepUp)
            && DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some()
        {
            // we'll hopefully support fixturing the post-stepup decision but for now we just always
            // fail with review if we already stepped up and provided the document
            Some(WorkflowFixtureResult::ManualReview)
        } else {
            fixture_result
        };

        let decision = get_final_rules_outcome(fixture_result, decision);

        let output = common::handle_rules_output(conn, wf, v.id, decision, rsr_id, review_reasons)?;
        match output {
            DecisionOutput::Terminal => Ok(KycState::from(KycComplete)),
            DecisionOutput::NonTerminal => Ok(KycState::from(KycDocCollection {
                wf_id: self.wf_id,
                sv_id: self.sv_id,
                t_id: self.t_id,
                seqno: self.seqno,
            })),
        }
    }
}

impl WorkflowState for KycDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Decisioning)
    }

    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision { seqno }))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl KycComplete {
    #[tracing::instrument("KycComplete::init", skip_all)]
    pub async fn init(
        _state: &State,
        _workflow: DbWorkflow,
        _config: KycConfig,
        _seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        Ok(KycComplete)
    }
}

impl WorkflowState for KycComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Complete)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl KycDocCollection {
    #[tracing::instrument("AlpacaKycDocCollection::init", skip_all)]
    pub async fn init(
        state: &State,
        workflow: DbWorkflow,
        _: KycConfig,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDocCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
            seqno,
        })
    }
}

#[async_trait]
impl OnAction<DocCollected, KycState> for KycDocCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "OnAction<DocCollected, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _state: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<DocCollected, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> FpResult<KycState> {
        Ok(KycState::from(KycDecisioning::new(
            self.wf_id, self.sv_id, self.t_id, self.seqno,
        )))
    }
}

impl WorkflowState for KycDocCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DocCollection)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None // have to wait for doc collection flow to finish
    }
}

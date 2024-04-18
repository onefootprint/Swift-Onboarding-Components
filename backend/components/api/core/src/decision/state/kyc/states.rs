use std::{collections::HashMap, sync::Arc};

use async_trait::async_trait;
use db::models::{
    data_lifetime::DataLifetime,
    document_request::{DocumentRequest, NewDocumentRequestArgs},
    list_entry::{ListEntry, ListWithDecryptedEntries},
    ob_configuration::ObConfiguration,
    risk_signal::{NewRiskSignalInfo, RiskSignal},
    risk_signal_group::RiskSignalGroup,
    rule_instance::RuleInstance,
    user_timeline::UserTimeline,
    vault::Vault,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate},
};

use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::incode::watchlist::response::WatchlistResultResponse;
use newtypes::{
    DecisionStatus, DocumentRequestConfig, DocumentRequestKind, EnhancedAmlOption, KycConfig, ListId, Locked,
    OnboardingStatus, RiskSignalGroupKind, RuleAction, RuleSetResultKind, StepUpInfo, VendorAPI,
    VerificationResultId,
};

use super::{
    KycComplete, KycDataCollection, KycDecisioning, KycDocCollection, KycState, KycVendorCalls, MakeDecision,
    MakeVendorCalls,
};
use crate::{
    decision::{
        self,
        features::{
            self,
            risk_signals::{
                fetch_latest_risk_signals_map, parse_reason_codes, parse_reason_codes_from_vendor_result,
                risk_signal_group_struct::{Aml, Kyc},
                save_risk_signals, RiskSignalGroupStruct,
            },
        },
        rule_engine::engine::VaultDataForRules,
        state::{
            actions::{Authorize, WorkflowActions},
            common, DocCollected, OnAction, WorkflowState,
        },
        utils::should_execute_rules_for_document_only,
        vendor::vendor_result::VendorResult,
    },
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    State,
};

// TODO: how do we want to model sandbox here 🤔? Could (1) do entirely seperatly from workflow, (2) special case it within workflow, (3) model it as an immediate transition from DataCollection -> Complete
// (2) is probs the best, I can imagine someone like Follow wanting to test the full workflow in sandbox

/////////////////////
/// DataCollection
/// ////////////////
impl KycDataCollection {
    #[tracing::instrument("KycDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDataCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
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
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<Authorize, KycState>::on_commit", skip_all)]
    fn on_commit(self, wf: Locked<DbWorkflow>, _: (), conn: &mut db::TxnPgConn) -> ApiResult<KycState> {
        DbWorkflow::update(wf, conn, WorkflowUpdate::set_status(OnboardingStatus::Pending))?;

        Ok(KycState::from(KycVendorCalls {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DataCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl KycVendorCalls {
    #[tracing::instrument("KycVendorCalls::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycVendorCalls {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
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
        Option<VendorResult>,
    )>;

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let wfid = self.wf_id.clone();
        let svid = self.sv_id.clone();
        let (vw, obc, wf) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (vw, obc) = common::get_vw_and_obc(conn, &svid, &wfid)?;
                let wf = DbWorkflow::get(conn, &wfid)?;

                Ok((vw, obc, wf))
            })
            .await?;

        // TODO: we should also skip if the UVW is non-US, but then we probably need to assert that doc was collected. Also need to clairfy tenant's understanding of this
        let (kyc_vendor_result, user_input_reason_codes) = if !obc.skip_kyc {
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
        let curp_result = if obc.curp_validation_enabled {
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

        let is_neuro_enabled_ff = state
            .feature_flag_client
            .flag(BoolFlag::IsNeuroEnabledForObc(&obc.key));
        let is_neuro_enabled_for_workflow = wf.is_neuro_enabled;
        let neuro_result = if is_neuro_enabled_ff && is_neuro_enabled_for_workflow {
            match common::run_neuro_check(state, &self.wf_id, &self.t_id).await {
                Ok(res) => res,
                Err(err) => {
                    tracing::warn!(?err, wf_id=?self.wf_id, "error running NeuroID");
                    None
                }
            }
        } else {
            // if FF and workflow get out of sync, make some noise
            if is_neuro_enabled_ff != is_neuro_enabled_for_workflow {
                tracing::warn!(
                    ?is_neuro_enabled_ff,
                    ?is_neuro_enabled_for_workflow,
                    "Neuro wf and ff disagree, not running neuro API call"
                )
            }
            None
        };

        let aml_vendor_result = match obc.enhanced_aml {
            EnhancedAmlOption::No => None,
            EnhancedAmlOption::Yes { .. } => {
                Some(common::run_aml_call(state, &self.wf_id, &self.t_id).await?)
            }
        };

        let ocr_reason_codes =
            common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &self.sv_id, &vw).await?;

        Ok(Box::new((
            ocr_reason_codes,
            user_input_reason_codes,
            kyc_vendor_result,
            aml_vendor_result,
            state.feature_flag_client.clone(),
            curp_result,
            neuro_result,
        )))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        let (
            ocr_reason_codes,
            user_input_risk_signals,
            kyc_vendor_result,
            aml_vendor_result,
            ff_client,
            curp_result,
            neuro_result,
        ) = *async_res;
        let (vw, obc) = common::get_vw_and_obc(conn, &self.sv_id, &self.wf_id)?;

        let curp_reason_codes = curp_result.map(|v| {
            let vendor_api: VendorAPI = (&v.response.response).into();
            let vres_id = v.verification_result_id.clone();
            parse_reason_codes(v, false, false)
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
            let rsg = RiskSignalGroup::get_or_create(conn, &self.sv_id, RiskSignalGroupKind::Doc)?;
            RiskSignal::bulk_add(conn, new_doc_reason_codes, false, rsg.id)?;
        }

        if let Some(neuro_res) = neuro_result {
            let vendor_api: VendorAPI = (&neuro_res.response.response).into();
            let vres_id = neuro_res.verification_result_id.clone();
            let neuro_frc = parse_reason_codes(neuro_res, false, false)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();

            let rsg = RiskSignalGroup::get_or_create(conn, &self.sv_id, RiskSignalGroupKind::Behavior)?;
            RiskSignal::bulk_add(conn, neuro_frc, true, rsg.id)?;
        }

        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client, &vw.vault, &wf, &self.t_id)?;
        // Save KYC risk signals, if we made KYC calls
        if let Some(kyc_vendor_result) = &kyc_vendor_result {
            let kyc_risk_signals = if let Some(fd) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_kyc_reason_codes(fd, &obc);
                let vres_id = kyc_vendor_result.verification_result_id.clone();

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: Kyc,
                }
            } else {
                parse_reason_codes_from_vendor_result(kyc_vendor_result.clone(), &vw)?.kyc
                // TODO: only call this once and re-use for aml portion below
            };

            let kyc_risk_signals = kyc_risk_signals
                .footprint_reason_codes
                .into_iter()
                .chain(user_input_risk_signals)
                .collect();
            save_risk_signals(
                conn,
                &self.sv_id,
                kyc_risk_signals,
                RiskSignalGroupKind::Kyc,
                false,
            )?;
        }

        // Save AML risk signals from Aml call or Kyc call (or save nothing if neither called)
        if let Some((watchlist_vres_id, watchlist_result_response)) = aml_vendor_result {
            let aml_risk_signals = if let Some(fixture_decision) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_aml_reason_codes(&fixture_decision, &obc);

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, watchlist_vres_id.clone()))
                        .collect(),
                    group: Aml,
                }
            } else {
                common::get_aml_risk_signals_from_aml_call(
                    &obc,
                    &watchlist_vres_id,
                    &watchlist_result_response,
                )
            };
            save_risk_signals(
                conn,
                &self.sv_id,
                aml_risk_signals.footprint_reason_codes,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        } else if let Some(kyc_vendor_result) = kyc_vendor_result {
            let aml_risk_signals = common::get_aml_risk_signals_from_kyc_call(&vw, kyc_vendor_result)?;
            save_risk_signals(
                conn,
                &self.sv_id,
                aml_risk_signals.footprint_reason_codes,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        };

        Ok(KycState::from(KycDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::VendorCalls)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls))
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl KycDecisioning {
    #[tracing::instrument("KycDecisioning::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDecisioning {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
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
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let wfid = self.wf_id.clone();
        let (tenant, rules, vw, lists) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (obc, tenant) = ObConfiguration::get(conn, &wfid)?;
                let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id)?;

                let seqno = DataLifetime::get_current_seqno(conn)?; // TODO: should technically pass this seqno to RuleSetResult to store in pg instead of pulling a new seqno inside the RSR write itself
                let vw = VaultWrapper::<Any>::build(conn, VwArgs::Historical(&svid, seqno))?;

                let lists = ListEntry::list_bulk(conn, &common::list_ids_from_rules(&rules))?;

                Ok((tenant, rules, vw, lists))
            })
            .await?;
        let vault_data_for_rules =
            VaultDataForRules::decrypt_for_rules(&state.enclave_client, vw, &rules).await?;
        let lists_for_rules = common::saturate_list_entries(state, &tenant, lists).await?;

        Ok((
            state.feature_flag_client.clone(),
            vault_data_for_rules,
            lists_for_rules,
        ))
    }

    #[tracing::instrument("OnAction<MakeDecision, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        let (ff_client, vault_data_for_rules, lists_for_rules) = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;
        let execute_rules_for_real_document_decision_only = should_execute_rules_for_document_only(&v, &wf)?;
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        let doc_collected = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some();
        let review_reasons = common::get_review_reasons(&risk_signals, doc_collected, &obc);
        let vres_ids = risk_signals.verification_result_ids();

        // Always execute real Rules, even in sandbox. But below we just use the sandbox fixture decision instead of the decision from these real Rules
        let (rule_set_result, decision) = common::evaluate_rules(
            conn,
            risk_signals,
            &vault_data_for_rules,
            &lists_for_rules,
            &wf,
            fixture_decision.is_some(),
            RuleSetResultKind::WorkflowDecision,
        )?;
        // If Sandbox and not doing real decisioning using doc, then replace decision with the fixture decision
        let decision = if let Some(fixture_decision) = fixture_decision {
            if execute_rules_for_real_document_decision_only || obc.skip_kyc {
                decision
            } else {
                let doc_collected =
                    DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some();
                // we'll hopefully support fixturing the post-stepup decision but for now we just always fail with review if we stepped up
                let fixture_decision =
                    if matches!(fixture_decision.0, DecisionStatus::StepUp) && doc_collected {
                        (DecisionStatus::Fail, true)
                    } else {
                        fixture_decision
                    };
                common::kyc_decision_from_fixture(fixture_decision)?
            }
        } else {
            decision
        };

        match decision.decision_status {
            DecisionStatus::Fail | DecisionStatus::Pass => {
                common::save_kyc_decision(
                    conn,
                    &self.sv_id,
                    &wf,
                    vres_ids,
                    decision,
                    Some(&rule_set_result.id),
                    review_reasons,
                )?;
                Ok(KycState::from(KycComplete))
            }
            DecisionStatus::StepUp => {
                let doc_reqs = if let Some(RuleAction::StepUp(kind)) = decision.action {
                    kind.to_doc_kinds()
                        .into_iter()
                        .filter_map(|kind| match kind {
                            DocumentRequestKind::Identity => Some(DocumentRequestConfig::Identity {
                                collect_selfie: true, // TODO: should come from config
                            }),
                            DocumentRequestKind::ProofOfAddress => {
                                Some(DocumentRequestConfig::ProofOfAddress {})
                            }
                            DocumentRequestKind::ProofOfSsn => Some(DocumentRequestConfig::ProofOfSsn {}),
                            // TODO handle custom doc step-ups
                            DocumentRequestKind::Custom => None,
                        })
                        .map(|config| NewDocumentRequestArgs {
                            scoped_vault_id: self.sv_id.clone(),
                            workflow_id: self.wf_id.clone(),
                            rule_set_result_id: Some(rule_set_result.id.clone()),
                            config,
                        })
                        .collect()
                } else {
                    vec![]
                };
                let doc_reqs = DocumentRequest::bulk_create(conn, doc_reqs)?;
                let stepup_info = StepUpInfo {
                    document_request_ids: doc_reqs.into_iter().map(|dr| dr.id).collect(),
                };
                UserTimeline::create(conn, stepup_info, v.id.clone(), self.sv_id.clone())?;

                let update = WorkflowUpdate::set_status(OnboardingStatus::Incomplete);
                DbWorkflow::update(wf, conn, update)?;

                Ok(KycState::from(KycDocCollection {
                    wf_id: self.wf_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
        }
    }
}

impl WorkflowState for KycDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Decisioning)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl KycComplete {
    #[tracing::instrument("KycComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: KycConfig) -> ApiResult<Self> {
        Ok(KycComplete)
    }
}

impl WorkflowState for KycComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Complete)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl KycDocCollection {
    #[tracing::instrument("AlpacaKycDocCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDocCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
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
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<DocCollected, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        Ok(KycState::from(KycDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycDocCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DocCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // have to wait for doc collection flow to finish
    }
}

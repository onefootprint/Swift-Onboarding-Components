use crate::utils::db2api::DbToApi;
use api_wire_types::DocumentRequest;
use api_wire_types::WorkflowStartedEventKind;
use db::models::scoped_vault_label::ScopedVaultLabel;
use db::models::user_timeline::SaturatedDataCollectedEvent;
use db::models::user_timeline::SaturatedTimelineEvent;
use db::models::user_timeline::SaturatedWorkflowTriggeredEvent;
use db::models::user_timeline::UserTimeline;
use db::models::user_timeline::UserTimelineInfo;
use itertools::Itertools;
use newtypes::AuthMethodUpdatedInfo;
use newtypes::ExternalIntegrationInfo;
use newtypes::OnboardingTimelineInfo;
use newtypes::WfrDocumentConfig;
use newtypes::WfrOnboardConfig;
use newtypes::WorkflowConfig;
use newtypes::WorkflowRequestConfig;

impl DbToApi<UserTimelineInfo> for api_wire_types::UserTimeline {
    fn from_db(target: UserTimelineInfo) -> Self {
        let UserTimelineInfo(ut, saturated_event) = target;
        let UserTimeline { timestamp, seqno, .. } = ut;
        let event = api_wire_types::UserTimelineEvent::from_db(saturated_event);
        Self {
            timestamp,
            seqno,
            event,
        }
    }
}

impl DbToApi<SaturatedTimelineEvent> for api_wire_types::UserTimelineEvent {
    fn from_db(target: SaturatedTimelineEvent) -> Self {
        match target {
            SaturatedTimelineEvent::DataCollected(SaturatedDataCollectedEvent {
                attributes,
                targets,
                actor,
                is_prefill,
            }) => Self::DataCollected(api_wire_types::user_timeline::DataCollectedInfo {
                attributes,
                targets,
                actor: actor.map(api_wire_types::Actor::from_db),
                is_prefill,
            }),
            SaturatedTimelineEvent::Liveness(l, i) => {
                Self::Liveness(api_wire_types::LivenessEvent::from_db((l, Some(i))))
            }
            SaturatedTimelineEvent::DocumentUploaded((id_doc, doc_req)) => Self::DocumentUploaded(
                api_wire_types::DocumentUploadedTimelineEvent::from_db((id_doc, doc_req)),
            ), // TODO
            SaturatedTimelineEvent::OnboardingDecision(obd_info, annotation) => Self::OnboardingDecision {
                workflow_source: obd_info.1.source,
                decision: api_wire_types::TimelineOnboardingDecision::from_db(obd_info),
                annotation: annotation.map(api_wire_types::Annotation::from_db),
            },
            SaturatedTimelineEvent::Annotation(annotation_info) => {
                Self::Annotation(api_wire_types::Annotation::from_db(annotation_info))
            }
            SaturatedTimelineEvent::WatchlistCheck(wc) => {
                Self::WatchlistCheck(api_wire_types::WatchlistCheck::from_db(wc))
            }
            SaturatedTimelineEvent::VaultCreated(actor) => Self::VaultCreated(api_wire_types::VaultCreated {
                actor: api_wire_types::Actor::from_db(actor),
            }),
            SaturatedTimelineEvent::WorkflowTriggered(event) => {
                let SaturatedWorkflowTriggeredEvent(workflow, playbook_id, actor, wfr) = event;
                let (wfr, su) = wfr.unzip();
                let note = wfr.as_ref().and_then(|wfr| wfr.note.clone());
                // Some weird logic for backcompat to determine the trigger type
                let config = if let Some(wfr) = wfr.as_ref() {
                    // This is the most modern format - WFR is created when the trigger is made
                    wfr.config.clone()
                } else if let Some(wf) = workflow.as_ref() {
                    // Some legacy triggers created a Workflow inline
                    match wf.config {
                        WorkflowConfig::Kyc(_) | WorkflowConfig::AlpacaKyc(_) | WorkflowConfig::Kyb(_) => {
                            let cfg = WfrOnboardConfig {
                                playbook_id: wf.ob_configuration_id.clone(),
                                recollect_attributes: vec![],
                                reuse_existing_bo_kyc: false,
                            };
                            WorkflowRequestConfig::Onboard(cfg)
                        }
                        WorkflowConfig::Document(ref c) => {
                            let cfg = WfrDocumentConfig {
                                configs: c.configs.clone(),
                                business_configs: c.business_configs.clone(),
                            };
                            WorkflowRequestConfig::Document(cfg)
                        }
                    }
                } else {
                    // And even more legacy triggers didn't have a workflow associated with them
                    let cfg = WfrOnboardConfig {
                        playbook_id,
                        recollect_attributes: vec![],
                        reuse_existing_bo_kyc: false,
                    };
                    WorkflowRequestConfig::Onboard(cfg)
                };
                let request_is_active = wfr.as_ref().is_some_and(|wfr| wfr.deactivated_at.is_none());
                let fp_id = su.map(|su| su.fp_id);

                Self::WorkflowTriggered(api_wire_types::WorkflowTriggered {
                    request_is_active,
                    config,
                    actor: api_wire_types::Actor::from_db(actor),
                    note,
                    fp_id,
                })
            }
            SaturatedTimelineEvent::WorkflowStarted((wf, pb)) => {
                let kind = match wf.config {
                    WorkflowConfig::Kyc(_) | WorkflowConfig::Kyb(_) | WorkflowConfig::AlpacaKyc(_) => {
                        WorkflowStartedEventKind::Playbook
                    }
                    WorkflowConfig::Document(_) => WorkflowStartedEventKind::Document,
                };
                Self::WorkflowStarted(api_wire_types::WorkflowStarted {
                    kind,
                    // Even though document workflows don't really use them, they are associated with
                    // playbooks
                    playbook: api_wire_types::TimelinePlaybook::from_db(pb),
                    workflow_source: wf.source,
                })
            }
            SaturatedTimelineEvent::AuthMethodUpdated((e, _, insight_event)) => {
                let AuthMethodUpdatedInfo {
                    kind,
                    action,
                    auth_event_id: _,
                } = e;
                Self::AuthMethodUpdated(api_wire_types::AuthMethodUpdated {
                    kind,
                    action,
                    insight_event: api_wire_types::InsightEvent::from_db(insight_event),
                })
            }
            SaturatedTimelineEvent::LabelAdded(label) => {
                let ScopedVaultLabel { kind, .. } = label;
                Self::LabelAdded(api_wire_types::LabelAdded { kind })
            }
            SaturatedTimelineEvent::ExternalIntegrationCalled(e) => {
                let ExternalIntegrationInfo {
                    integration,
                    successful,
                    external_id,
                } = e;
                Self::ExternalIntegrationCalled(api_wire_types::ExternalIntegrationCalled {
                    integration,
                    successful,
                    external_id,
                })
            }
            SaturatedTimelineEvent::StepUp(e) => Self::StepUp(
                e.into_iter()
                    .sorted_by_key(|dr| dr.kind)
                    .map(|dr| DocumentRequest {
                        kind: dr.kind,
                        rule_set_result_id: dr.rule_set_result_id,
                    })
                    .collect(),
            ),
            SaturatedTimelineEvent::OnboardingTimeline(e) => {
                let OnboardingTimelineInfo { event, session_id } = e;
                Self::OnboardingTimeline(api_wire_types::OnboardingTimelineInfo { event, session_id })
            }
            SaturatedTimelineEvent::BusinessOwnerCompletedKyc(obd_info) => {
                let fp_id = obd_info.2.fp_id.clone();
                let decision = api_wire_types::TimelineOnboardingDecision::from_db(obd_info);
                Self::BusinessOwnerCompletedKyc { fp_id, decision }
            }
        }
    }
}

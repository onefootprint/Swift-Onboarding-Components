use db::models::user_timeline::{SaturatedTimelineEvent, UserTimeline, UserTimelineInfo};

use crate::utils::db2api::DbToApi;

impl DbToApi<UserTimelineInfo> for api_wire_types::UserTimeline {
    fn from_db(target: UserTimelineInfo) -> Self {
        let UserTimelineInfo(ut, is_from_other_org, saturated_event) = target;
        let UserTimeline { timestamp, .. } = ut;
        let event = api_wire_types::UserTimelineEvent::from_db(saturated_event);
        Self {
            timestamp,
            event,
            is_from_other_org,
        }
    }
}

impl DbToApi<SaturatedTimelineEvent> for api_wire_types::UserTimelineEvent {
    fn from_db(target: SaturatedTimelineEvent) -> Self {
        match target {
            SaturatedTimelineEvent::DataCollected(e) => {
                Self::DataCollected(api_wire_types::user_timeline::DataCollectedInfo {
                    attributes: e.attributes,
                })
            }
            SaturatedTimelineEvent::Liveness(l, i) => {
                Self::Liveness(api_wire_types::LivenessEvent::from_db((l, Some(i))))
            }
            SaturatedTimelineEvent::IdentityDocumentUploaded((id_doc, doc_req)) => {
                Self::IdentityDocumentUploaded(api_wire_types::IdentityDocumentTimelineEvent::from_db((
                    id_doc, doc_req,
                )))
            } // TODO
            SaturatedTimelineEvent::OnboardingDecision(
                (decision, ob_config, vrs, tenant_user, mr),
                annotation,
            ) => Self::OnboardingDecision {
                decision: api_wire_types::OnboardingDecision::from_db((
                    decision,
                    Some(ob_config),
                    Some(vrs),
                    tenant_user,
                    mr,
                )),
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
            SaturatedTimelineEvent::WorkflowTriggered((workflow, actor)) => {
                Self::WorkflowTriggered(api_wire_types::WorkflowTriggered {
                    workflow: api_wire_types::Workflow::from_db(workflow),
                    actor: api_wire_types::Actor::from_db(actor),
                })
            }
        }
    }
}

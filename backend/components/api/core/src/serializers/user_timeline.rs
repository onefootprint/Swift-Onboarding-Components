use db::models::user_timeline::{SaturatedTimelineEvent, UserTimeline, UserTimelineInfo};
use itertools::Itertools;
use newtypes::TriggerKind;

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
            SaturatedTimelineEvent::DataCollected(attributes, targets, actor) => {
                // Get the extra attributes that aren't encompassed by the attributes
                let dangling_attributes = targets.into_iter().filter(|di| {
                    !attributes
                        .iter()
                        .any(|cdo| cdo.data_identifiers().unwrap_or_default().contains(di))
                });
                // And use these to compute some additional CDOs that we'll add to the list in case
                // only a part of the CDO was updated.
                // This allows the dashboard to display the name was updated, even if only
                // id.first_name is edited
                let edited_cdos = dangling_attributes
                    .into_iter()
                    .filter_map(|di| di.parent())
                    .unique()
                    // Choose the "largest" CDO for the edited CDs
                    // This is arbitrary, but there aren't many CDs with multiple options
                    .filter_map(|cd| cd.options().into_iter().last())
                    .collect_vec();
                let cdos = attributes.into_iter().chain(edited_cdos).unique().collect_vec();
                Self::DataCollected(api_wire_types::user_timeline::DataCollectedInfo {
                    attributes: cdos,
                    actor: actor.map(api_wire_types::Actor::from_db),
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
                (decision, ob_config, tenant_user, mr),
                annotation,
            ) => Self::OnboardingDecision {
                decision: api_wire_types::OnboardingDecision::from_db((
                    decision,
                    Some(ob_config),
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
                // Some weird logic for backcompat to determine the trigger type
                let workflow = if let Some(wf) = workflow {
                    api_wire_types::Workflow::from_db(wf)
                } else {
                    let kind = TriggerKind::RedoKyc;
                    api_wire_types::Workflow { kind }
                };
                Self::WorkflowTriggered(api_wire_types::WorkflowTriggered {
                    workflow,
                    actor: api_wire_types::Actor::from_db(actor),
                })
            }
        }
    }
}

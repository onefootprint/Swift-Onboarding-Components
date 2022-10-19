use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::State;

use api_wire_types::DecisionEvent;
use api_wire_types::OnboardingEvent;
use api_wire_types::RequirementFulfilledEvent;
use api_wire_types::TimelineEvent;
use api_wire_types::TimelineEventKind;
use chrono::Utc;

use newtypes::FootprintUserId;
use newtypes::OnboardingDecisionId;
use newtypes::OnboardingId;
use newtypes::RequirementId;
use newtypes::TenantPermission;
use newtypes::Uuid;
use newtypes::Vendor;
use paperclip::actix::{api_v2_operation, get, web};

type TimelineEventsResponse = Vec<TimelineEvent>;

#[api_v2_operation(
    description = "Gets the timeline for a user verification trail.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/timeline")]
pub async fn get(
    _state: web::Data<State>,
    _request: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<TimelineEventsResponse> {
    let _auth = auth.check_permissions(vec![TenantPermission::Users])?;
    // let tenant_id = auth.tenant().id.clone();
    // let is_live = auth.is_live()?;
    // let footprint_user_id = request.into_inner();

    //TODO: stub render real data
    let timeline_events = vec![
        TimelineEvent {
            event: TimelineEventKind::RequirementFulfilled(RequirementFulfilledEvent {
                requirement_id: RequirementId::test_data("r1".into()),
                vendors: vec![Vendor::Idology],
                attributes: Default::default(),
            }),
            timestamp: Utc::now(),
        },
        TimelineEvent {
            event: TimelineEventKind::Decision(DecisionEvent {
                decision_id: OnboardingDecisionId::test_data("d1".into()),
            }),
            timestamp: Utc::now(),
        },
        TimelineEvent {
            event: TimelineEventKind::Onboard(OnboardingEvent {
                onboarding_id: OnboardingId::test_data(Uuid::new_v4()),
            }),
            timestamp: Utc::now(),
        },
    ];

    ResponseData::ok(timeline_events).json()
}

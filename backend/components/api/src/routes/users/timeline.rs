use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::State;

use api_wire_types::user_timeline::DataCollectedInfo;
use db::models::user_timeline::SaturatedTimelineEvent;
use db::models::user_timeline::UserTimeline;
use db::models::user_timeline::UserTimelineInfo;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web};

type TimelineEventsResponse = Vec<api_wire_types::UserTimeline>;

#[api_v2_operation(
    description = "Gets the timeline for a user verification trail.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<TimelineEventsResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = request.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| UserTimeline::list(conn, footprint_user_id, tenant_id, is_live))
        .await??;
    let events = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    ResponseData::ok(events).json()
}

impl DbToApi<UserTimelineInfo> for api_wire_types::UserTimeline {
    fn from_db(target: UserTimelineInfo) -> Self {
        let UserTimelineInfo(ut, saturated_event) = target;
        let UserTimeline { timestamp, .. } = ut;
        let event = api_wire_types::UserTimelineEvent::from_db(saturated_event);
        Self { timestamp, event }
    }
}

impl DbToApi<SaturatedTimelineEvent> for api_wire_types::UserTimelineEvent {
    fn from_db(target: SaturatedTimelineEvent) -> Self {
        match target {
            SaturatedTimelineEvent::DataCollected(e) => Self::DataCollected(DataCollectedInfo {
                attributes: e.attributes,
            }),
            SaturatedTimelineEvent::BiometricRegistered(e) => {
                Self::BiometricRegistered(api_wire_types::LivenessEvent::from_db(e))
            }
            SaturatedTimelineEvent::DocumentUploaded(_) => Self::DocumentUploaded(), // TODO
            SaturatedTimelineEvent::OnboardingDecision(e) => {
                Self::OnboardingDecision(api_wire_types::OnboardingDecision::from_db(e))
            }
        }
    }
}

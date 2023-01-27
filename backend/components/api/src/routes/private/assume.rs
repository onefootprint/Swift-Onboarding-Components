use crate::auth::session::AuthSessionData;
use crate::auth::tenant::{FirmEmployeeSession, TenantRbAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use db::models::tenant::Tenant;
use newtypes::TenantId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct AssumeRequest {
    pub tenant_id: TenantId,
}

#[api_v2_operation(
    description = "Private endpoint to assume the read-only role a given tenant.",
    tags(Private)
)]
#[post("/private/assume")]
async fn post(
    state: web::Data<State>,
    auth: TenantRbAuthContext,
    request: Json<AssumeRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let firm_employee_id = auth.firm_employee_id()?;
    let session_sealing_key = state.session_sealing_key.clone();
    let tenant_id = request.into_inner().tenant_id;
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Verify the tenant_id is real
            Tenant::get(conn, &tenant_id)?;

            let session = FirmEmployeeSession {
                tenant_user_id: firm_employee_id,
                tenant_id,
            };
            auth.update_session(conn, &session_sealing_key, AuthSessionData::FirmEmployee(session))?;
            Ok(())
        })
        .await??;

    EmptyResponse::ok().json()
}

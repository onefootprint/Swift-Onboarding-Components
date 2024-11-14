use crate::types::ApiResponse;
use crate::State;
use api_core::auth::ob_config::BoSessionAuth;
use api_core::errors::business::BusinessError;
use api_core::utils::vault_wrapper::BusinessOwnerInfo;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_errors::BadRequest;
use api_errors::BadRequestWithCode;
use api_errors::FpDbOptionalExtension;
use api_errors::FpErrorCode;
use api_wire_types::hosted::business::HostedBusinessDetail;
use api_wire_types::hosted::business::Inviter;
use db::models::business_workflow_link::BusinessWorkflowLink;
use db::models::workflow::Workflow;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Get information about the business for which we started a KYC of a beneficial owner",
    tags(Businesses, Hosted)
)]
#[actix::get("/hosted/business")]
pub async fn get(state: web::Data<State>, bo_auth: BoSessionAuth) -> ApiResponse<HostedBusinessDetail> {
    let biz_wf_id = bo_auth.data.data.biz_wf_id.clone();
    let bo_id = bo_auth.bo.id.clone();
    let (bvw, user_wfl) = state
        .db_query(move |conn| {
            let (_, sb) = Workflow::get_all(conn, &biz_wf_id)?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb.id)?;
            let user_wfl = BusinessWorkflowLink::get_bo_workflow(conn, &bo_id, &biz_wf_id).optional()?;
            Ok((bvw, user_wfl))
        })
        .await?;

    if user_wfl.is_some_and(|(_, wf)| wf.completed_at.is_some()) {
        return BadRequestWithCode(
            "This link has already been used to collect a beneficial owner's information.",
            FpErrorCode::LinkAlreadyUsed,
        )
        .into();
    }

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let primary_bo = dbos
        .iter()
        .find(|bo| bo.bo.kind == BusinessOwnerKind::Primary)
        .ok_or(BusinessError::PrimaryBoNotFound)?
        .clone();
    let invited_bo = dbos
        .into_iter()
        .find(|b| b.bo.link_id == bo_auth.bo.link_id)
        .ok_or(BusinessError::LinkedBoNotFound)?;

    let (first_name, last_name) = primary_bo.name().ok_or(BadRequest("No name"))?;
    let inviter = Inviter {
        first_name,
        last_name,
    };

    // One day, we may support more sensitive data for secondary BOs, so filter down to only what we
    // need to bootstrap the identify flow
    // If we start to have, for ex, ssn here, we should bootstrap the data into the newly created vault
    // via the backend
    let invited_data = (invited_bo.data)
        .into_iter()
        .filter(|(di, _)| BusinessOwnerInfo::USER_DIS.contains(di))
        .collect();

    let business_name = bvw
        .get_p_data(&BDK::Name.into())
        .ok_or(BadRequest("No business name"))?;
    let result = HostedBusinessDetail {
        name: business_name.clone(),
        inviter,
        invited_data,
    };
    Ok(result)
}

use crate::errors::ApiResult;
use crate::types::ModernApiResult;
use crate::State;
use api_core::auth::ob_config::BoSessionAuth;
use api_core::errors::business::BusinessError;
use api_core::errors::ValidationError;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::hosted::business::HostedBusiness;
use api_wire_types::hosted::business::Invited;
use api_wire_types::hosted::business::Inviter;
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
pub async fn get(state: web::Data<State>, bo_auth: BoSessionAuth) -> ModernApiResult<HostedBusiness> {
    let bv_id = bo_auth.bo.business_vault_id.clone();
    let ob_config_id = bo_auth.ob_config.id.clone();
    let (bvw, sb) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (_, sb) = Workflow::get_all(conn, (&bv_id, &ob_config_id))?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb.id)?;
            Ok((bvw, sb))
        })
        .await?;

    let dbos = bvw.decrypt_business_owners(&state, &sb.tenant_id).await?;
    let primary_bo = dbos
        .iter()
        .find(|bo| bo.kind == BusinessOwnerKind::Primary)
        .ok_or(BusinessError::PrimaryBoNotFound)?
        .clone();
    let invited_bo = dbos
        .into_iter()
        .find(|b| {
            b.linked_bo
                .as_ref()
                .is_some_and(|b| b.link_id == bo_auth.bo.link_id)
        })
        .ok_or(BusinessError::LinkedBoNotFound)?;

    let inviter = Inviter {
        first_name: primary_bo.first_name.ok_or(ValidationError("No phone"))?,
        last_name: primary_bo.last_name.ok_or(ValidationError("No email"))?,
    };
    let invited = Invited {
        email: invited_bo
            .email
            .ok_or(ValidationError("Invited no email"))?
            .into(),
        phone_number: invited_bo
            .phone_number
            .ok_or(ValidationError("Invited no phone"))?
            .e164(),
    };

    let business_name = bvw
        .get_p_data(&BDK::Name.into())
        .ok_or(ValidationError("No business name"))?;
    let result = HostedBusiness {
        name: business_name.clone(),
        inviter,
        invited,
    };
    Ok(result)
}

use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::ob_config::BoSessionAuth;
use api_core::errors::business::BusinessError;
use api_core::types::ResponseData;
use api_core::utils::kyb_utils::{
    decrypt_basic_business_info,
    BasicBusinessInfo,
};
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::hosted::business::{
    HostedBusiness,
    Invited,
    Inviter,
};
use db::models::workflow::Workflow;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Get information about the business for which we started a KYC of a beneficial owner",
    tags(Businesses, Hosted)
)]
#[actix::get("/hosted/business")]
pub async fn get(state: web::Data<State>, business_auth: BoSessionAuth) -> JsonApiResponse<HostedBusiness> {
    let bv_id = business_auth.bo.business_vault_id.clone();
    let ob_config_id = business_auth.ob_config.id.clone();
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (_, sb) = Workflow::get_all(conn, (&bv_id, &ob_config_id))?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb.id)?;
            Ok(bvw)
        })
        .await?;

    let BasicBusinessInfo {
        business_name,
        primary_bo,
        mut secondary_bos,
    } = decrypt_basic_business_info(&state, &bvw).await?;

    let invited_bo = secondary_bos
        .remove(&business_auth.bo.link_id)
        .ok_or(BusinessError::NoBos)?;

    let inviter = Inviter {
        first_name: primary_bo.first_name,
        last_name: primary_bo.last_name,
    };
    let invited = Invited {
        email: invited_bo.email.into(),
        phone_number: invited_bo.phone_number.e164(),
    };

    let result = HostedBusiness {
        name: business_name,
        inviter,
        invited,
    };
    ResponseData::ok(result).json()
}

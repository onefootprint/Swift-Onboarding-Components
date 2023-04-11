use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::ob_config::BoSessionAuth;
use api_core::errors::business::BusinessError;
use api_core::types::ResponseData;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::hosted::business::{HostedBusiness, Invited, Inviter};
use db::models::onboarding::Onboarding;
use newtypes::{BusinessDataKind as BDK, KycedBusinessOwnerData};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Get information about the business for which we started a KYC of a beneficial owner",
    tags(Hosted, Businesses)
)]
#[actix::get("/hosted/business")]
pub async fn get(state: web::Data<State>, business_auth: BoSessionAuth) -> JsonApiResponse<HostedBusiness> {
    let bv_id = business_auth.data.bo.business_vault_id;
    let ob_config_id = business_auth.data.ob_config.id;
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (_, sb, _, _) = Onboarding::get(conn, (&bv_id, &ob_config_id))?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb.id)?;
            Ok(bvw)
        })
        .await??;

    let mut bvw_data = bvw
        .decrypt_unchecked(
            &state.enclave_client,
            &[BDK::Name.into(), BDK::KycedBeneficialOwners.into()],
        )
        .await?;
    let business_name = bvw_data.remove(&BDK::Name.into()).ok_or(BusinessError::NoName)?;
    let bos: Vec<KycedBusinessOwnerData> = bvw_data
        .remove(&BDK::KycedBeneficialOwners.into())
        .ok_or(BusinessError::NoBos)?
        .deserialize()?;
    // TODO: could this differ from the actual primary BO's first name + last name?
    // I don't think so by the client, but maybe on the backend we should compare and enforce
    let primary_bo = bos.get(0).ok_or(BusinessError::NoBos)?;
    let invited_bo = bos
        .iter()
        .find(|bo| bo.link_id == business_auth.data.bo.link_id)
        .ok_or(BusinessError::NoBos)?;
    let inviter = Inviter {
        first_name: primary_bo.first_name.clone(),
        last_name: primary_bo.last_name.clone(),
    };
    let invited = Invited {
        email: invited_bo.email.clone().into(),
        phone_number: invited_bo.phone_number.e164_with_suffix(),
    };

    let result = HostedBusiness {
        name: business_name,
        inviter,
        invited,
    };
    ResponseData::ok(result).json()
}

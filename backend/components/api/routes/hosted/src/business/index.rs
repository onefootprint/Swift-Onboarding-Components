use std::collections::HashMap;

use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::errors::business::BusinessError;
use api_core::types::ResponseData;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::{auth::ob_config::BoSessionAuth, utils::vault_wrapper::TenantUvw};
use api_wire_types::hosted::business::{HostedBusiness, Invited, Inviter};
use db::models::onboarding::Onboarding;
use newtypes::{BoLinkId, BusinessDataKind as BDK, KycedBusinessOwnerData, PiiString};
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

    let BasicBusinessInfo {
        business_name,
        primary_bo,
        mut secondary_bos,
    } = decrypt_basic_business_info(&state, &bvw).await?;

    let invited_bo = secondary_bos
        .remove(&business_auth.data.bo.link_id)
        .ok_or(BusinessError::NoBos)?;

    let inviter = Inviter {
        first_name: primary_bo.first_name,
        last_name: primary_bo.last_name,
    };
    let invited = Invited {
        email: invited_bo.email.into(),
        phone_number: invited_bo.phone_number.e164_with_suffix(),
    };

    let result = HostedBusiness {
        name: business_name,
        inviter,
        invited,
    };
    ResponseData::ok(result).json()
}

pub struct BasicBusinessInfo {
    pub business_name: PiiString,
    pub primary_bo: KycedBusinessOwnerData,
    pub secondary_bos: HashMap<BoLinkId, KycedBusinessOwnerData>,
}

pub async fn decrypt_basic_business_info(state: &State, bvw: &TenantUvw) -> ApiResult<BasicBusinessInfo> {
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
    let primary_bo = bos.get(0).ok_or(BusinessError::NoBos)?.clone();
    let secondary_bos = bos
        .into_iter()
        .skip(1)
        .map(|bo| (bo.link_id.clone(), bo))
        .collect();
    let info = BasicBusinessInfo {
        business_name,
        primary_bo,
        secondary_bos,
    };
    Ok(info)
}

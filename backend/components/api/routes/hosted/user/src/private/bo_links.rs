use crate::auth::user::ItUserAuthContext;
use api_core::decision::biz_risk::KybBoFeatures;
use api_core::errors::ValidationError;
use api_core::types::ApiListResponse;
use api_core::utils::kyb_utils::generate_secondary_bo_links;
use api_core::web;
use api_core::State;
use db::models::workflow::Workflow;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use paperclip::actix::api_v2_operation;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};

#[derive(serde::Serialize, Apiv2Schema, macros::JsonResponder)]
pub struct BoToken {
    token: SessionAuthToken,
    first_name: Option<PiiString>,
    last_name: Option<PiiString>,
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Generate links for all secondary BOs to complete onboarding onto a KYB playbook that requires KYC of all BOs."
)]
#[actix::post("/hosted/user/private/bo_links")]
pub async fn post(state: web::Data<State>, user_auth: ItUserAuthContext) -> ApiListResponse<BoToken> {
    let user_auth = user_auth.into_inner();
    let su = user_auth.scoped_user.as_ref();
    let biz_wf_id = (user_auth.data.biz_wf_id.clone())
        .ok_or(ValidationError("No business associated with the session"))?;
    let biz_wf = state
        .db_query(move |conn| Workflow::get(conn, &biz_wf_id))
        .await?;

    let kyb_features = KybBoFeatures::build(&state, &biz_wf.id).await?;
    let tokens = generate_secondary_bo_links(&state, su, &biz_wf, &kyb_features.bos).await?;

    let results = tokens
        .into_iter()
        .map(|(bo, token)| {
            let (first_name, last_name) = (*bo).clone().name().unzip();
            BoToken {
                token,
                first_name,
                last_name,
            }
        })
        .collect();
    Ok(results)
}

use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::protected_custodian::ProtectedCustodianAuthContext,
    types::{EmptyResponse, ResponseData},
};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a summary of partnered companies for a compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/compliance/companies")]
pub async fn get(
    _state: web::Data<State>,
    // TODO: switch to partner tenant auth
    _auth: ProtectedCustodianAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    ResponseData::ok(EmptyResponse {}).json()
}

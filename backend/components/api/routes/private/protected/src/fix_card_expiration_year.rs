use crate::{ProtectedAuth, State};
use actix_web::{post, web, web::Json};
use api_core::{
    migrations::m050624_fix_card_expiration_year::{
        fix_card_expiration_year, FixCardExpirationYearRequest, FixCardExpirationYearResult,
    },
    types::{JsonApiResponse, ResponseData},
};


#[post("/private/protected/fix_card_expiration_year")]
pub async fn post(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<FixCardExpirationYearRequest>,
) -> JsonApiResponse<FixCardExpirationYearResult> {
    let result = fix_card_expiration_year(&state, request.into_inner()).await?;
    ResponseData::ok(result).json()
}

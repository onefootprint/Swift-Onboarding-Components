mod risk;

use paperclip::actix::{
    api_v2_operation, get,
    web::{self},
};

use crate::auth::protected_custodian::ProtectedCustodianAuthContext;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(risk::make_vendor_calls)
        .service(risk::make_decision);
}

#[api_v2_operation(tags(Private, Protected))]
#[get("/private/protected/check")]
fn check(_: ProtectedCustodianAuthContext) -> &'static str {
    "ok"
}

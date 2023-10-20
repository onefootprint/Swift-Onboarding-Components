//! Routes for internal APIs - my1fp, bifrost

use paperclip::actix::web;

mod check_session;
use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    api_route_hosted_user::routes(config);
    api_route_hosted_identify::routes(config);
    api_route_hosted_onboarding::routes(config);
    api_route_hosted_business::routes(config);
    api_route_hosted_d2p::routes(config);
    config.service(check_session::get);
}

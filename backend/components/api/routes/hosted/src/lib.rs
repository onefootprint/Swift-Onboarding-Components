//! Routes for internal APIs - my1fp, bifrost

use paperclip::actix::web;

mod business;
mod check_session;
mod identify;
pub mod onboarding;
mod user;
use api_core::*;
pub use user::documents::process::handle_incode_request;

pub fn routes(config: &mut web::ServiceConfig) {
    user::routes(config);
    identify::routes(config);
    onboarding::routes(config);
    business::routes(config);
    config.service(check_session::get);
}

//! Routes for internal APIs - my1fp, bifrost

use paperclip::actix::web;

mod business;
pub mod identify;
pub mod onboarding;
pub mod user;

pub fn routes(config: &mut web::ServiceConfig) {
    user::routes(config);
    identify::routes(config);
    onboarding::routes(config);
    business::routes(config);
}

pub mod hosted;
pub mod index;
pub mod onboarding;
pub mod org;
pub mod private;
pub mod proxy;
pub mod users;

use paperclip::actix::web;

pub fn routes(config: &mut web::ServiceConfig) {
    index::routes(config);
    private::routes(config);
    org::routes(config);
    onboarding::routes(config);
    users::routes(config);
    hosted::routes(config);
    proxy::routes(config);
}

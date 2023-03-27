mod entities;
pub mod hosted;
mod index;
mod onboarding;
mod org;
mod private;
mod proxy;
mod users;

use paperclip::actix::web;

pub fn routes(config: &mut web::ServiceConfig) {
    index::routes(config);
    private::routes(config);
    org::routes(config);
    onboarding::routes(config);
    users::routes(config);
    hosted::routes(config);
    proxy::routes(config);
    entities::routes(config);
}

use paperclip::actix::web;

// TODO: eventually all of these will be moved!
use api_core::routes::*;

use api_route_org as org;

pub fn configure(config: &mut web::ServiceConfig) {
    index::routes(config);
    private::routes(config);
    org::routes(config);
    onboarding::routes(config);
    users::routes(config);
    hosted::routes(config);
    proxy::routes(config);
    entities::routes(config);
}

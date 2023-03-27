use paperclip::actix::web;

// TODO: eventually all of these will be moved!
use api_core::routes::*;

use api_route_org as org;
use api_route_index as index;
use api_route_private as private;
use api_route_proxy as proxy;
use api_route_onboarding as onboarding;
use api_route_users as users;

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

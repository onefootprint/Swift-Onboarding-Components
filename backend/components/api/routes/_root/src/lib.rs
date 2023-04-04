use paperclip::actix::web;

use api_route_businesses as businesses;
use api_route_entities as entities;
use api_route_hosted as hosted;
use api_route_index as index;
use api_route_onboarding as onboarding;
use api_route_org as org;
use api_route_private as private;
use api_route_proxy as proxy;
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
    businesses::routes(config);
}

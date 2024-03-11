use paperclip::actix::web;

use api_route_businesses as businesses;
use api_route_compliance as compliance;
use api_route_entities as entities;
use api_route_hosted as hosted;
use api_route_index as index;
use api_route_integrations as integrations;
use api_route_onboarding as onboarding;
use api_route_org as org;
use api_route_users as users;
use api_route_vault_proxy as vault_proxy;
use api_route_webhooks as webhooks;

pub fn configure(config: &mut web::ServiceConfig) {
    index::routes(config);
    org::routes(config);
    onboarding::routes(config);
    users::routes(config);
    hosted::routes(config);
    vault_proxy::routes(config);
    entities::routes(config);
    businesses::routes(config);
    compliance::routes(config);
    webhooks::routes(config);
    integrations::routes(config);
    integrations::routes(config);
}

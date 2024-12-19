mod api_keys;
mod app_meta;
mod audit_events;
mod authn;
mod client_security_config;
mod frequent_notes;
mod index;
mod lists;
mod logo;
mod member;
mod members;
// Weird module name, but there's a metrics module inside api_core too...
mod in_progress_onboardings;
mod invoice_preview;
mod metrics_api;
mod onboarding_configs;
mod partners;
mod playbooks;
mod proxy_configs;
mod risk_signals;
mod roles;
mod rules;
mod sdk_args;
mod sdk_telemetry;
mod tenant_metrics;
mod tenant_tag;
mod vault_dr;
mod webhook_portal;
use api_core::web::ServiceConfig;

pub fn routes(config: &mut ServiceConfig) {
    config
        .service(index::get)
        .service(index::patch)
        .service(invoice_preview::get)
        .service(members::get)
        .service(members::post)
        .service(members::patch)
        .service(members::deactivate)
        .service(member::get)
        .service(member::patch)
        .service(roles::get)
        .service(roles::post)
        .service(roles::patch)
        .service(roles::deactivate)
        .service(risk_signals::get)
        .service(audit_events::get)
        .service(logo::put)
        .service(metrics_api::get)
        .service(webhook_portal::get)
        .service(sdk_args::post)
        .service(sdk_args::get)
        .service(sdk_telemetry::post)
        .service(in_progress_onboardings::get)
        .service(client_security_config::get)
        .service(client_security_config::patch)
        .service(frequent_notes::get)
        .service(frequent_notes::post)
        .service(frequent_notes::delete)
        .service(tenant_tag::get)
        .service(tenant_tag::post)
        .service(tenant_metrics::get)
        .service(tenant_tag::delete);

    playbooks::routes(config);
    onboarding_configs::routes(config);
    authn::routes(config);
    api_keys::routes(config);
    app_meta::routes(config);
    partners::routes(config);
    proxy_configs::routes(config);
    rules::routes(config);
    lists::routes(config);
    vault_dr::routes(config);
}

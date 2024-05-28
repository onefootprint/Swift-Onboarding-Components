mod assume;
mod cleanup;
mod compliance_partnership;
mod entities;
mod invoice;
mod long;
mod panic;
mod partner_demo;
mod tenants;
mod test_partner_tenant;
mod test_tenant;

pub use api_core::{auth::protected_auth::ProtectedAuth, State};

pub fn configure(config: &mut actix_web::web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(entities::get)
        .service(test_tenant::post)
        .service(test_partner_tenant::post)
        .service(panic::get)
        .service(long::get)
        .service(invoice::post)
        .service(invoice::post_all)
        .service(compliance_partnership::post)
        .service(partner_demo::post);

    tenants::configure(config);
}

mod assume;
mod cleanup;
mod entities;
mod invoice;
mod panic;
mod tenants;
mod test_tenant;

pub use api_core::auth::protected_auth::ProtectedAuth;
pub use api_core::State;

pub fn configure(config: &mut actix_web::web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(entities::get)
        .service(tenants::get)
        .service(test_tenant::post)
        .service(panic::get)
        .service(invoice::post)
        .service(invoice::post_all);
}

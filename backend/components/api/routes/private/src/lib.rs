mod assume;
mod auth;
mod cleanup;
mod entities;
mod invoice;
mod protected;
mod test_tenant;

pub use self::auth::ProtectedAuth;
pub use api_core::State;

pub fn configure(config: &mut actix_web::web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(entities::get)
        .service(test_tenant::post)
        .service(invoice::post)
        .service(invoice::post_all);

    protected::routes(config);
}

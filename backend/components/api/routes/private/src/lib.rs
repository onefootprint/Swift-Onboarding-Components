use actix_web::web;

mod assume;
mod cleanup;
mod invoice;
mod protected;
mod test_tenant;

pub use api_core::*;

mod auth;
pub(crate) use auth::*;

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(test_tenant::post)
        .service(invoice::post)
        .service(invoice::post_all);

    protected::routes(config);
}

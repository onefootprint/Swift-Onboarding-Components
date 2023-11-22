use paperclip::actix::web::ServiceConfig;

mod health;
#[allow(clippy::module_inception)]
mod index;

pub use api_core::*;

pub fn routes(config: &mut ServiceConfig) {
    config
        .service(index::root)
        .service(index::headers)
        .service(health::handler)
        .service(health::status)
        .service(health::status2)
        .service(health::enclave)
        .service(health::enclave_decrypt)
        .service(health::fail_handler);
}

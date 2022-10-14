use paperclip::actix::web::ServiceConfig;

mod health;
#[allow(clippy::module_inception)]
mod index;

pub fn routes(config: &mut ServiceConfig) {
    config
        .service(index::root)
        .service(index::headers)
        .service(health::handler)
        .service(health::enclave)
        .service(health::enclave_decrypt)
        .service(health::panic_handler)
        .service(health::fail_handler);
}

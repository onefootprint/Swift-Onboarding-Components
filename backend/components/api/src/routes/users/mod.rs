use paperclip::actix::web;

pub mod audit_trail;
pub mod index;
pub mod liveness;
pub mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::post)
        .service(audit_trail::get)
        .service(liveness::get);

    vault::routes(config);
}

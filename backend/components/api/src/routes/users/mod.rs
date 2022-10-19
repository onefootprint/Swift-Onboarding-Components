use paperclip::actix::web;

pub mod audit_trail;
pub mod index;
pub mod liveness;
pub mod risk_signals;
pub mod timeline;
pub mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::get_detail)
        .service(index::post)
        .service(audit_trail::get)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get);

    vault::routes(config);
}

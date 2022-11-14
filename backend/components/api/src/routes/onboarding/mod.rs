use paperclip::actix::web;

pub mod decisions;
pub mod session;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(session::post)
        .service(session::validate::post)
        .service(decisions::post);
}

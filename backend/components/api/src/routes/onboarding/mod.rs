use paperclip::actix::web;

pub mod session;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(session::post).service(session::validate::post);
}

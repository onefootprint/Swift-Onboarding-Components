use paperclip::actix::web;

pub mod generate;
pub mod sms;
pub mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(generate::handler)
        .service(status::get)
        .service(status::post)
        .service(sms::handler);
}

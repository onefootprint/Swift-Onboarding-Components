use paperclip::actix::web;

pub mod generate;
pub mod sms;
pub mod status;

pub fn routes() -> web::Scope {
    web::scope("/d2p")
        .service(generate::handler)
        .service(status::get)
        .service(status::post)
        .service(sms::handler)
}

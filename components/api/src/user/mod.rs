use paperclip::actix::web;

pub mod access_events;
pub mod data;
pub mod detail;
pub mod email_verify;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(data::handler)
        .service(email_verify::handler)
        .service(access_events::handler)
}

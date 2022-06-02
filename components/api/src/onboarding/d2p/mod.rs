use paperclip::actix::web;

pub mod generate;
pub mod status;

pub fn routes() -> web::Scope {
    web::scope("/d2p")
        .service(generate::handler)
        .service(status::handler)
}

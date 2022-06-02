use paperclip::actix::web;

pub mod generate;

pub fn routes() -> web::Scope {
    web::scope("/d2p").service(generate::handler)
}

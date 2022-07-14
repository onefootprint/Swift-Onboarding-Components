use paperclip::actix::web;

pub mod cleanup;
pub mod client;

pub fn routes() -> web::Scope {
    web::scope("/private")
        .service(cleanup::post)
        .service(client::post)
}

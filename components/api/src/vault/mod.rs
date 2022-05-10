pub mod decrypt;
use paperclip::actix::web;

pub fn routes() -> web::Scope {
    web::scope("/vault").service(decrypt::handler)
}

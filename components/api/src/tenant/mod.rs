pub mod access_events;
pub mod decrypt;
pub mod types;
use paperclip::actix::web;

pub fn routes() -> web::Scope {
    web::scope("/tenant")
        .service(decrypt::handler)
        .service(access_events::handler)
}

use paperclip::actix::web;

pub mod access_events;
pub mod decrypt;
pub mod onboardings;
pub mod types;

pub fn routes() -> web::Scope {
    web::scope("/tenant")
        .service(access_events::handler)
        .service(decrypt::handler)
        .service(onboardings::handler)
}

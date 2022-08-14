use paperclip::actix::web;

pub mod access_events;
pub mod audit_trail;
pub mod decrypt;
pub mod index;
pub mod liveness;
pub mod update;
pub mod validate;

pub fn routes() -> web::Scope {
    web::scope("/users")
        .service(
            web::resource("")
                .route(web::get().to(index::get))
                .route(web::post().to(index::post)),
        )
        .service(access_events::get)
        .service(audit_trail::get)
        .service(decrypt::post)
        .service(decrypt::post2)
        .service(update::post)
        .service(liveness::get)
        .service(validate::validate)
}

use paperclip::actix::web;

pub mod access_events;
pub mod audit_trail;
pub mod custom;
pub mod decrypt;
pub mod identity;
pub mod index;
pub mod liveness;
pub mod unified;
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
        .service(liveness::get)
        .service(validate::validate)
        .service(
            web::scope("/{footprint_user_id}")
                // unified
                .service(web::resource("")
                    .route(web::put().to(unified::put))
                    .route(web::get().to(unified::get))
                )
                .service(
                    web::resource("/decrypt")
                    .route(web::post().to(unified::post_decrypt))

                )
                .service(
                    web::scope("/identity")
                        .service(
                            web::resource("")
                                .route(web::put().to(identity::put))
                                .route(web::get().to(identity::get)),
                        )
                        .service(
                            web::resource("/decrypt")
                            .route(web::post().to(identity::post_decrypt))
                        ),
                )
                .service(
                    web::scope("/custom")
                        .service(
                            web::resource("")
                                .route(web::put().to(custom::put))
                                .route(web::get().to(custom::get)),
                        )
                        .service(
                            web::resource("/decrypt")
                            .route(web::post().to(custom::post_decrypt))
                        ),
                ),
        )
}

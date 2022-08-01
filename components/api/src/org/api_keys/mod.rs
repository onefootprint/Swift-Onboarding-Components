use paperclip::actix::web;

mod index;
mod reveal;

pub fn routes() -> web::Scope {
    web::scope("/api_keys")
        .service(
            web::resource("")
                .route(web::post().to(index::post))
                .route(web::get().to(index::get)),
        )
        .service(web::resource("").route(web::get().to(index::get)))
        .service(reveal::get)
}

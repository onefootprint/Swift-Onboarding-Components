use paperclip::actix::web;

pub mod custom;
pub mod identity;

pub fn routes() -> web::Scope {
    web::scope("/{footprint_user_id}")
        .service(
            web::scope("/data/identity").service(
                web::resource("")
                    .route(web::put().to(identity::put))
                    .route(web::get().to(identity::get)),
            ),
        )
        .service(identity::post_decrypt)
        .service(
            web::scope("/data/custom").service(
                web::resource("")
                    .route(web::put().to(custom::put))
                    .route(web::get().to(custom::get)),
            ),
        )
        .service(custom::post_decrypt)
}

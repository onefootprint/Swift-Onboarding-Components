use paperclip::actix::web;

pub mod challenge;
pub mod index;
pub mod verify;

pub fn routes() -> web::Scope {
    web::scope("/email")
        .service(web::resource("").route(web::post().to(index::post)))
        .service(verify::post)
        .service(challenge::post)
}

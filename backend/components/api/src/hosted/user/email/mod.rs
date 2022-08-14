use paperclip::actix::web;

pub mod challenge;
pub mod verify;

pub fn routes() -> web::Scope {
    web::scope("/email")
        .service(verify::post)
        .service(challenge::post)
}

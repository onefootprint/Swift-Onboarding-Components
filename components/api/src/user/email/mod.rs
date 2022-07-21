use paperclip::actix::web;

pub mod verify;

pub fn routes() -> web::Scope {
    web::scope("/email").service(verify::post)
}

use paperclip::actix::web;

pub mod list;
pub mod verify;

pub fn routes() -> web::Scope {
    web::scope("/email")
        .service(web::resource("").route(web::get().to(list::get)))
        .service(verify::post)
}

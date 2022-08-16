use paperclip::actix::web;

pub mod addresses;

pub fn routes() -> web::Scope {
    web::scope("/{fp_user_id}")
        .service(addresses::get)
        .service(addresses::decrypt)
}

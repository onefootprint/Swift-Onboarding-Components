use paperclip::actix::web;

pub mod identity;

pub fn routes() -> web::Scope {
    web::scope("/{footprint_user_id}/data")
        .service(identity::post)
}

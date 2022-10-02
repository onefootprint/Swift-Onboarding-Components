use paperclip::actix::web;

pub mod cleanup;
pub mod tenant;

pub fn routes() -> web::Scope {
    web::scope("/private")
        .service(cleanup::post)
        .service(tenant::post)
}

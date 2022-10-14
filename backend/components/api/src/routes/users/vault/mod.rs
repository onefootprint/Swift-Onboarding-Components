use paperclip::actix::web;

pub mod custom;
pub mod identity;
pub mod unified;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(unified::put)
        .service(unified::get)
        .service(unified::post_decrypt)
        .service(identity::put)
        .service(identity::get)
        .service(identity::post_decrypt)
        .service(custom::put)
        .service(custom::get)
        .service(custom::post_decrypt);
}

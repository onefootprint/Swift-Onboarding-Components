mod kyb;
mod list;
mod post;
mod risk_signals;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(list::get)
        .service(risk_signals::get)
        .service(kyb::post);
}

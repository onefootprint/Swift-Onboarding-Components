mod detail;
mod kyb;
mod list;
mod owners;
mod patch;
mod post;
mod risk_signals;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    owners::routes(config);
    config
        .service(post::post)
        .service(patch::patch)
        .service(list::get)
        .service(risk_signals::get)
        .service(kyb::post)
        .service(detail::get);
}

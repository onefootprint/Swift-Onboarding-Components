use api_core::*;
use paperclip::actix::web;

mod auth_events;
mod decisions;
mod delete;
mod detail;
mod documents;
mod kyc;
mod label;
mod list;
mod liveness;
mod match_signals;
mod onboardings;
mod post;
mod risk_signals;
mod tags;
mod token;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(list::get)
        .service(list::post_search)
        .service(delete::delete)
        .service(documents::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(liveness::get)
        .service(token::post)
        .service(auth_events::get)
        .service(decisions::post)
        .service(detail::detail)
        .service(kyc::post)
        .service(label::get)
        .service(label::post)
        .service(onboardings::get)
        .service(tags::get)
        .service(tags::post)
        .service(tags::delete);

    delete::configure_delete_aliases(config);
}

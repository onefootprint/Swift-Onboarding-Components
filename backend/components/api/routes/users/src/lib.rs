use api_core::*;
use paperclip::actix::web;

mod auth_events;
mod decisions;
mod delete;
mod detail;
mod documents;
mod duplicates;
mod kyc;
mod liveness;
mod match_signals;
mod onboardings;
mod patch;
mod post;
mod risk_signals;
mod search;
mod token;

pub fn routes(config: &mut web::ServiceConfig) {
    onboardings::configure_get_aliases(config);
    decisions::routes(config);
    config
        .service(post::post)
        .service(patch::patch)
        .service(search::get)
        .service(search::post_search)
        .service(delete::delete)
        .service(documents::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(liveness::get)
        .service(token::post)
        .service(auth_events::get)
        .service(detail::detail)
        .service(kyc::post)
        .service(onboardings::get)
        .service(duplicates::get);

    delete::configure_delete_aliases(config);
}

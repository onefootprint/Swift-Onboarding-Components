use paperclip::actix::web;

mod assignments;
mod doc_events;
mod doc_templates;
mod documents;
mod members;
mod partners;
mod requests;
mod reupload;
mod reviews;
mod roles;
mod submissions;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(assignments::post);
    config.service(doc_events::get);
    config.service(doc_templates::delete);
    config.service(doc_templates::get);
    config.service(doc_templates::post);
    config.service(doc_templates::put);
    config.service(documents::get);
    config.service(documents::post);
    config.service(members::get);
    config.service(members::post);
    config.service(members::patch);
    config.service(members::deactivate);
    config.service(partners::get);
    config.service(requests::delete);
    config.service(reupload::post);
    config.service(reviews::post);
    config.service(roles::get);
    config.service(roles::post);
    config.service(roles::patch);
    config.service(roles::deactivate);

    config.service(submissions::get);
}

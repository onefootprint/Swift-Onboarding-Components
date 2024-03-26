use paperclip::actix::web;

mod doc_templates;
mod documents;
mod members;
mod partners;
mod request;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(documents::get);
    config.service(documents::post);
    config.service(partners::get);
    config.service(doc_templates::get);
    config.service(doc_templates::post);
    config.service(doc_templates::put);
    config.service(doc_templates::delete);
    config.service(request::delete);
    config.service(members::post);
}

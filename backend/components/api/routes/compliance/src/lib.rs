use paperclip::actix::web;

mod doc_events;
mod doc_templates;
mod documents;
mod members;
mod partner_tenant_assignment;
mod partners;
mod requests;
mod reupload;
mod reviews;
mod submissions;
mod tenant_assignment;
mod upload;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(doc_events::get);
    config.service(doc_templates::delete);
    config.service(doc_templates::get);
    config.service(doc_templates::post);
    config.service(doc_templates::put);
    config.service(documents::get);
    config.service(documents::post);
    config.service(members::get);
    config.service(members::post);
    config.service(partner_tenant_assignment::post);
    config.service(partners::get);
    config.service(requests::delete);
    config.service(reupload::post);
    config.service(reviews::post);
    config.service(submissions::post);
    config.service(tenant_assignment::post);
    config.service(upload::post);
}

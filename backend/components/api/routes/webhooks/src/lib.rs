use paperclip::actix::web;

mod middesk;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(middesk::handle_webhook);
}

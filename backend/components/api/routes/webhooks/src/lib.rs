use paperclip::actix::web;

mod middesk;
mod samba;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(samba::handle_webhook);
    config.service(middesk::handle_webhook);
}

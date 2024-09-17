use paperclip::actix::web;

mod middesk;
mod samba;
mod twilio_status_callback;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(samba::handle_webhook);
    config.service(middesk::handle_webhook);
    config.service(twilio_status_callback::handle_webhook);
}

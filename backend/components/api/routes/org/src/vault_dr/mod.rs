use paperclip::actix::web;

mod aws_pre_enroll;
mod enroll;
mod reveal_wrapped_record_keys;
mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(status::get);
    config.service(aws_pre_enroll::get);
    config.service(aws_pre_enroll::post);
    config.service(enroll::post);
    config.service(reveal_wrapped_record_keys::post);
}

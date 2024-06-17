use paperclip::actix::web;

mod aws_pre_enroll;
mod enroll;
mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(status::get);
    config.service(aws_pre_enroll::get);
    config.service(aws_pre_enroll::post);
    config.service(enroll::post);
}

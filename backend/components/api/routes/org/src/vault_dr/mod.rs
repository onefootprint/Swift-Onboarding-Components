use paperclip::actix::web;

mod aws_pre_enroll;
mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(status::get);
    config.service(aws_pre_enroll::post);
}

use paperclip::actix::web;
mod assignments;
mod submissions;
mod upload;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(assignments::post);
    config.service(submissions::post);
    config.service(upload::post);
}

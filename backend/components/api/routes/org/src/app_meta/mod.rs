use paperclip::actix::web;
mod android;
mod ios;

pub fn routes(config: &mut web::ServiceConfig) {
    ios::routes(config);
    android::routes(config);
}

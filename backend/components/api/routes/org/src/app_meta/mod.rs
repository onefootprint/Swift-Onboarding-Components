use paperclip::actix::web;
mod ios;
mod android;

pub fn routes(config: &mut web::ServiceConfig) {
    ios::routes(config);
    android::routes(config);
}

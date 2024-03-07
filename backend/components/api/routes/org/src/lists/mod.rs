use paperclip::actix::web;
mod create;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(create::create_list);
}

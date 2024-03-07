use paperclip::actix::web;
mod create;
mod list;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(create::create_list)
        .service(list::list_for_tenant);
}

use api_core::web;

mod list;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(list::get);
}

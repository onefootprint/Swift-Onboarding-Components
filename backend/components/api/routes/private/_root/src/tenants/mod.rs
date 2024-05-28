mod detail;
mod list;

pub fn configure(config: &mut actix_web::web::ServiceConfig) {
    config.service(list::get).service(detail::get);
}

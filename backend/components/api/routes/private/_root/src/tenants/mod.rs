mod detail;
mod list;
mod patch;

pub fn configure(config: &mut actix_web::web::ServiceConfig) {
    config
        .service(list::get)
        .service(detail::get)
        .service(patch::patch);
}

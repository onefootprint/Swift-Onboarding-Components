use actix_web::web;

mod create;
mod list;
mod patch;

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(create::create_access_request)
        .service(list::list_access_requests)
        .service(patch::patch_access_request);
}

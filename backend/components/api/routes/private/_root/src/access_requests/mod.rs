use paperclip::actix::web::ServiceConfig;

mod create;
mod list;
mod patch;

pub fn configure(config: &mut ServiceConfig) {
    config
        .service(create::create_access_request)
        .service(list::list_access_requests)
        .service(patch::patch_access_request);
}

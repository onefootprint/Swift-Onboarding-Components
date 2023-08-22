use paperclip::actix::web;

mod get;
mod patch;
mod post;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get_list)
        .service(get::get_detail)
        .service(patch::patch)
        .service(post::post);
}

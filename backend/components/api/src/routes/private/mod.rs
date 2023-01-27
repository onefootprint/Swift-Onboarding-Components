use paperclip::actix::web;

mod assume;
mod cleanup;
mod test;
mod test_tenant;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(test_tenant::post)
        .service(test::post);
}

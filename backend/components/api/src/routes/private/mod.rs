use paperclip::actix::web;

pub mod cleanup;
pub mod test;
pub mod test_tenant;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(test_tenant::post)
        .service(test::post);
}

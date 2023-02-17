use paperclip::actix::web;

mod assume;
mod cleanup;
mod test;
mod test_tenant;
mod invoice;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(test_tenant::post)
        .service(invoice::post)
        .service(test::post);
}

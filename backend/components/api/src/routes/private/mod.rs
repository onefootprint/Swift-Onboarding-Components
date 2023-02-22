use paperclip::actix::web;

mod assume;
mod cleanup;
mod invoice;
mod protected;
mod test_tenant;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(cleanup::post)
        .service(assume::post)
        .service(test_tenant::post)
        .service(invoice::post);

    protected::routes(config);
}

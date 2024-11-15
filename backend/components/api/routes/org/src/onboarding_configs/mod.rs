use paperclip::actix::web;

mod copy;
mod get;
mod patch;
pub(crate) mod validation;

#[cfg(test)]
mod tests;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get_detail)
        .service(patch::patch)
        .service(copy::post);
}

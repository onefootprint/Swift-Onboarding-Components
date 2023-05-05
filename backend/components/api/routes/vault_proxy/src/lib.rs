use paperclip::actix::web::ServiceConfig;
mod index;
pub use api_core::*;

pub fn routes(config: &mut ServiceConfig) {
    config.service(index::just_in_time);
    config.service(index::id);
}

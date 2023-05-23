mod alpaca_cip;

pub use api_core::*;
use paperclip::actix::web::ServiceConfig;

pub fn routes(config: &mut ServiceConfig) {
    config.service(alpaca_cip::post);
}

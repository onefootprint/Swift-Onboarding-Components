mod alpaca_cip;

use paperclip::actix::web::ServiceConfig;
pub use api_core::*;

pub fn routes(config: &mut ServiceConfig) {
    config.service(alpaca_cip::post);
}

mod alpaca;

pub use api_core::*;
use paperclip::actix::web::ServiceConfig;

pub fn routes(config: &mut ServiceConfig) {
    alpaca::routes(config)
}

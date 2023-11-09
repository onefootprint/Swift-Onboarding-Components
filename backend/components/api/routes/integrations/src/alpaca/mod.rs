mod account;
pub(crate) mod cip;

use paperclip::actix::web::{self};

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(cip::post)
        .service(cip::post_old)
        .service(account::post)
        .service(account::post_old);
}

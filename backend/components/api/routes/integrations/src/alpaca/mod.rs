mod account;
mod cip;

use paperclip::actix::web::{self};

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(cip::post).service(account::post);
}

mod cip_report;

use paperclip::actix::web::{
    self,
};

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(cip_report::post).service(cip_report::post_old);
}

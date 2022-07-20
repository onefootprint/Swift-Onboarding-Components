mod get;
mod update;
use paperclip::actix::web;

pub fn routes() -> web::Scope {
    web::scope("/settings")
        .service(update::handler)
        .service(get::handler)
}

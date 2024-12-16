use paperclip::actix::web;

mod challenge;
mod challenge_verify;
mod index;
mod requirements;
mod session_verify;
mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(requirements::get)
        .service(challenge::post)
        .service(challenge_verify::post)
        .service(session_verify::post)
        .service(vault::patch);
}

pub mod challenge;
pub mod commit;
pub mod init;
pub mod update;

use paperclip::actix::web;
pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(update::handler)
        .service(commit::handler)
        .service(
            web::scope("/challenge")
                .service(web::resource("").route(web::post().to(challenge::initiate::handler)))
                .service(challenge::verify::handler),
        )
}

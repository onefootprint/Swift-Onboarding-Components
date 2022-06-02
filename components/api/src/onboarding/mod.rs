use paperclip::actix::web;

pub mod commit;
pub mod d2p;
pub mod init;

pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(commit::handler)
        .service(commit::handler)
        .service(d2p::routes())
}

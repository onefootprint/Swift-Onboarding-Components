pub mod challenge;
pub mod commit;
pub mod identify;
pub mod init;
pub mod update;

use crate::errors::ApiError;
use crypto::sha256;
use db::models::user_vaults::UserVault;

fn seal(val: String, user_vault: &UserVault) -> Result<Vec<u8>, ApiError> {
    let val = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        &user_vault.public_key,
        val.as_str().as_bytes().to_vec(),
    )?
    .to_vec()?;
    Ok(val)
}

fn hash(val: String) -> Vec<u8> {
    // TODO hmac
    sha256(val.as_bytes()).to_vec()
}

use paperclip::actix::web;
pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(identify::handler)
        .service(update::handler)
        .service(commit::handler)
        .service(
            web::scope("/challenge")
                .service(web::resource("").route(web::post().to(challenge::initiate::handler)))
                .service(challenge::verify::handler),
        )
}

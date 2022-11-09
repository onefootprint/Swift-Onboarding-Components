use std::sync::Arc;

use crypto::aead::ScopedSealingKey;
use db::DbPool;
use idv::idology::client::IdologyClient;
use workos::{ApiKey, WorkOs};

use crate::{
    config::Config,
    enclave_client::EnclaveClient,
    errors::ApiError,
    s3,
    signed_hash::SignedHashClient,
    utils::{email::SendgridClient, twilio::TwilioClient},
};

#[derive(Clone)]
pub struct State {
    pub(crate) config: Config,
    pub(crate) hmac_client: SignedHashClient,
    pub(crate) workos_client: Arc<WorkOs>,
    pub(crate) twilio_client: TwilioClient,
    pub(crate) sendgrid_client: SendgridClient,
    pub(crate) db_pool: DbPool,
    pub(crate) enclave_client: EnclaveClient,
    pub(crate) challenge_sealing_key: ScopedSealingKey,
    pub(crate) session_sealing_key: ScopedSealingKey,
    pub(crate) idology_client: IdologyClient,
    #[allow(unused)]
    pub(crate) s3_client: s3::S3Client,
}

impl State {
    pub async fn init_or_die(mut config: Config) -> Self {
        let enclave_client = EnclaveClient::new(config.clone()).await;

        let shared_config = aws_config::from_env().load().await;
        let s3_client = s3::S3Client {
            client: aws_sdk_s3::Client::new(&shared_config),
        };
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = SignedHashClient {
            client: kms_client,
            key_id: config.signing_root_key_id.clone(),
        };

        let workos_client = WorkOs::new(&ApiKey::from(config.workos_api_key.as_str()));

        let twilio_client = TwilioClient::new(
            config.twilio_acount_sid.clone(),
            config.twilio_api_key.clone(),
            config.twilio_api_key_secret.clone(),
            config.twilio_phone_number.clone(),
            config.time_s_between_sms_challenges,
            config.rp_id.clone(),
        );

        let sendgrid_client = SendgridClient::new(
            config.sendgrid_api_key.clone(),
            config.sendgrid_from_email.clone(),
            config.sendgrid_challenge_template_id.clone(),
            config.sendgrid_magic_link_template_id.clone(),
        );

        let idology_client = IdologyClient::new(
            config.idology_config.username.clone().into(),
            config.idology_config.password.clone().into(),
        )
        .unwrap();

        // let out = hmac_client
        //     .signed_hash(&vec![0xde, 0xad, 0xbe, 0xef])
        //     .await
        //     .unwrap();
        // dbg!(crypto::hex::encode(&out));

        // run migrations
        db::run_migrations(&config.database_url).unwrap();

        // then create the pool
        let db_pool = db::init(&config.database_url).map_err(ApiError::from).unwrap();

        // our session key
        let (challenge_sealing_key, session_sealing_key) = {
            // take here removes it from the config
            let key = if let Some(hex_key) = config.cookie_session_key_hex.take() {
                crypto::hex::decode(hex_key).expect("invalid session cookie key")
            } else {
                log::error!("WARNING GENERATING RANDOM SESSION KEY");
                crypto::random::random_cookie_session_key_bytes()
            };
            (
                ScopedSealingKey::new(key.clone(), "CHALLENGE_SEALING").expect("invalid master session key"),
                ScopedSealingKey::new(key, "SESSION_SEALING").expect("invalid master session key"),
            )
        };

        State {
            config,
            enclave_client,
            hmac_client,
            workos_client: Arc::new(workos_client),
            twilio_client,
            sendgrid_client,
            db_pool,
            challenge_sealing_key,
            session_sealing_key,
            idology_client,
            s3_client,
        }
    }
}

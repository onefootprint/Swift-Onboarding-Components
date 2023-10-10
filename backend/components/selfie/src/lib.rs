use aws_sdk_rekognition::client::Client;
use aws_types::SdkConfig;

#[derive(Clone)]
pub struct SelfieClient {
    #[allow(unused)]
    client: Client,
}

impl SelfieClient {
    pub fn new(config: &SdkConfig) -> Self {
        Self {
            client: Client::new(config),
        }
    }
}

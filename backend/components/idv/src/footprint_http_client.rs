#[derive(Clone)]
pub struct FootprintVendorHttpClient {
    pub client: reqwest::Client,
}
impl FootprintVendorHttpClient {
    pub fn new() -> Result<Self, reqwest::Error> {
        let client = reqwest::Client::builder().build()?;

        Ok(Self { client })
    }
}

pub use stripe::Client as StripeClient;

pub fn init_client(secret_key: String) -> StripeClient {
    StripeClient::new(secret_key)
}

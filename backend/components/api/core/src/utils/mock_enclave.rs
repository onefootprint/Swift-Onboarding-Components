use crate::State;
use actix_web::dev::ServerHandle;
use envconfig::Envconfig;
use once_cell::sync::Lazy;
use std::{collections::HashMap, sync::Mutex, time::Duration};
use tokio::task::JoinHandle;

#[allow(unused)]
pub struct MockEnclave {
    h1: JoinHandle<()>,
    h2: JoinHandle<()>,
    server: ServerHandle,
    pub port: u16,
}

impl Drop for MockEnclave {
    fn drop(&mut self) {
        #[allow(clippy::let_underscore_future)]
        let _ = self.server.stop(false);
        self.h1.abort();
        self.h2.abort();
    }
}

static PP_LOCK: Lazy<Mutex<()>> = Lazy::new(Mutex::default);

impl MockEnclave {
    fn unused_ports() -> (u16, u16) {
        let _g = PP_LOCK.lock().unwrap_or_else(|e| e.into_inner());
        (
            portpicker::pick_unused_port().expect("no free ports"),
            portpicker::pick_unused_port().expect("no free ports"),
        )
    }

    /// initializes a new enclave proxy on random port
    pub async fn init() -> MockEnclave {
        let (enclave_port, port) = Self::unused_ports();
        let h1 = tokio::spawn(async move {
            let enclave_config = enclave::Config {
                port: enclave_port,
                use_local: None,
            };
            enclave::run(enclave_config).await.expect("enclave crashed");
        });

        let mut config = enclave_proxy::Config::init_from_hashmap(&HashMap::new()).unwrap();
        config.port = port;
        config.enclave_port = enclave_port;

        let server = enclave_proxy::http_proxy::server::build_server(config)
            .await
            .expect("failed to build enclave proxy server");
        let handle = server.handle();

        let h2 = tokio::spawn(async move {
            server.await.expect("enclave proxy crashed");
        });

        tokio::time::sleep(Duration::from_secs(2)).await;

        MockEnclave {
            port,
            h1,
            h2,
            server: handle,
        }
    }
}

/// Note: we create several of these to test
/// that our TestState above can handle several concurrent tests
/// using our mock enclave
#[cfg(test)]
mod tests {
    use super::*;

    async fn run_test() {
        let state = &State::test_state().await;
        log::info!("got state");
        let resp = state.enclave_client.pong().await.expect("failed to ping");
        assert_eq!(resp, "test".to_string());
    }

    #[tokio::test]
    async fn test_ping_pong() {
        run_test().await
    }

    #[tokio::test]
    async fn test_ping_pong_2() {
        run_test().await
    }

    #[tokio::test]
    async fn test_ping_pong_3() {
        run_test().await
    }

    #[tokio::test]
    async fn test_ping_pong_4() {
        run_test().await
    }
}

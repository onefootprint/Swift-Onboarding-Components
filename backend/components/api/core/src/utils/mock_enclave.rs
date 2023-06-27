use crate::State;
use actix_web::dev::ServerHandle;
use envconfig::Envconfig;
use std::{collections::HashMap, time::Duration};
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

impl MockEnclave {
    /// initializes a new enclave proxy on random port
    pub async fn init() -> MockEnclave {
        let enclave_config = enclave::Config {
            port: 0, // let OS assign unused port
        };
        let enclave = enclave::Enclave::bind(enclave_config)
            .await
            .expect("enclave crashed");
        let enclave_port = enclave.port;
        let h1 = tokio::spawn(async move { enclave.run().await.expect("enclave crashed") });

        let mut config = enclave_proxy::Config::init_from_hashmap(&HashMap::new()).unwrap();
        config.port = 0; // let OS assign unused port
        config.enclave_port = enclave_port;

        let (server, server_port) = enclave_proxy::http_proxy::server::build_server(config)
            .await
            .expect("failed to build enclave proxy server");
        let handle = server.handle();

        let h2 = tokio::spawn(async move {
            server.await.expect("enclave proxy crashed");
        });

        tokio::time::sleep(Duration::from_secs(2)).await;

        MockEnclave {
            port: server_port,
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

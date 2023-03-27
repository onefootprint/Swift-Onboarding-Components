use actix_web::dev::ServerHandle;
use envconfig::Envconfig;
use std::{collections::HashMap, time::Duration};
use tokio::task::JoinHandle;

use crate::State;

#[allow(unused)]
pub struct StateWithMockEnclave {
    h1: JoinHandle<()>,
    h2: JoinHandle<()>,
    server: ServerHandle,
    pub state: State,
}

impl Drop for StateWithMockEnclave {
    fn drop(&mut self) {
        #[allow(clippy::let_underscore_future)]
        let _ = self.server.stop(false);
        self.h1.abort();
        self.h2.abort();
    }
}

impl StateWithMockEnclave {
    /// initializes a new enclave proxy on random port
    pub async fn init() -> StateWithMockEnclave {
        let enclave_port = portpicker::pick_unused_port().expect("no free ports");

        let h1 = tokio::spawn(async move {
            let enclave_config = enclave::Config {
                port: enclave_port,
                use_local: None,
            };
            enclave::run(enclave_config).await.expect("enclave crashed");
        });

        let port = portpicker::pick_unused_port().expect("no free ports");
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

        let state = State::test_state(port).await;
        let _ = state.enclave_client.pong().await.expect("failed to ping");
        log::info!("setup state");

        StateWithMockEnclave {
            state,
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
        let s = StateWithMockEnclave::init().await;
        log::info!("got state");
        let resp = s.state.enclave_client.pong().await.expect("failed to ping");
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

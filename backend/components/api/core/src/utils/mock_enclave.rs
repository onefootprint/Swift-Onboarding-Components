use crate::enclave_client::EnclaveClientProxy;
use crate::errors::enclave::EnclaveError;
use async_trait::async_trait;
use enclave::EnclavePayload;
use enclave::RpcRequest;

#[derive(Debug, Clone)]
pub struct MockEnclave;

#[cfg(test)]
#[async_trait]
impl EnclaveClientProxy for MockEnclave {
    async fn send_rpc_request(&self, request: RpcRequest) -> Result<EnclavePayload, EnclaveError> {
        enclave::handle_request(request.payload)
            .await
            .map_err(|e| EnclaveError::TestError(format!("{:?}", e)))
    }
}

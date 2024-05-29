use async_trait::async_trait;
use bb8::{
    self,
    ManageConnection,
    PooledConnection,
};
use tokio::io::{
    AsyncRead,
    AsyncWrite,
};
use tokio::net::TcpStream;

pub trait Stream: AsyncRead + AsyncWrite + Unpin + Send {}

#[cfg(feature = "vsock")]
impl Stream for tokio_vsock::VsockStream {}

impl Stream for TcpStream {}

#[async_trait]
pub trait StreamConnection {
    async fn new_stream(&self) -> Result<Box<dyn Stream>, crate::Error>;
    async fn ping(&self, stream: &mut Box<dyn Stream>) -> Result<(), crate::Error>;
}

pub struct StreamManager<T>(pub T);

#[async_trait]
impl<T> ManageConnection for StreamManager<T>
where
    T: StreamConnection + Sized + Send + Sync + 'static,
{
    type Connection = Box<dyn Stream>;
    type Error = crate::Error;

    async fn connect(&self) -> Result<Self::Connection, Self::Error> {
        let stream = self.0.new_stream().await?;
        Ok(stream)
    }

    async fn is_valid(&self, conn: &mut PooledConnection<'_, Self>) -> Result<(), Self::Error> {
        self.0.ping(conn).await?;
        Ok(())
    }

    fn has_broken(&self, _: &mut Self::Connection) -> bool {
        false
    }
}

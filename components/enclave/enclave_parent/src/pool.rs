use async_trait::async_trait;
use bb8::{self, ManageConnection, PooledConnection};
use tokio::{
    io::{AsyncRead, AsyncWrite},
    net::UnixStream,
};
use tokio_vsock::VsockStream;

pub trait Stream: AsyncRead + AsyncWrite + Unpin + Send {}
impl Stream for VsockStream {}
impl Stream for UnixStream {}

#[async_trait]
pub trait StreamConnection {
    async fn new_stream(&self) -> Result<Box<dyn Stream>, tokio::io::Error>;
}

pub struct StreamManager<T>(pub T);

#[async_trait]
impl<T> ManageConnection for StreamManager<T>
where
    T: StreamConnection + Sized + Send + Sync + 'static,
{
    type Connection = Box<dyn Stream>;
    type Error = tokio::io::Error;

    async fn connect(&self) -> Result<Self::Connection, Self::Error> {
        let stream = self.0.new_stream().await?;
        Ok(stream)
    }

    async fn is_valid(&self, conn: &mut PooledConnection<'_, Self>) -> Result<(), Self::Error> {
        Ok(())
    }

    fn has_broken(&self, _: &mut Self::Connection) -> bool {
        false
    }
}

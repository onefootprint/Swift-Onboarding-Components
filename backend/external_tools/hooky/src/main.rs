use dashmap::DashMap;
use futures::StreamExt;
use hyper::body::Sender as BodySender;
use hyper::http::Method;
use hyper::server::conn::AddrIncoming;
use hyper::service::{
    make_service_fn,
    service_fn,
};
use hyper::{
    Body,
    HeaderMap,
    Request,
    Response,
    Server,
};
use log::{
    error,
    info,
};
use sha2::{
    Digest,
    Sha256,
};
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;
use tokio::sync::mpsc::error::SendError;
use tokio::sync::mpsc::{
    channel,
    Receiver,
    Sender,
};

#[derive(Error, Debug)]
pub enum Error {
    #[error("Hyper Error")]
    HyperError(#[from] hyper::Error),

    #[error("HTTP Error")]
    HttpError(#[from] hyper::http::Error),

    #[error("Channel send error")]
    SendHeadersError(#[from] SendError<HeaderMap>),

    #[error("unknown error")]
    Unknown,
}

type HeaderSender = Sender<HeaderMap>;
type HeaderReceiver = Receiver<HeaderMap>;

type TxChannels = Arc<DashMap<String, (BodySender, HeaderSender)>>;
type RxChannels = Arc<DashMap<String, (Body, HeaderReceiver)>>;

#[tokio::main]
pub async fn main() -> Result<(), Error> {
    pretty_env_logger::init();

    let tx_channels: TxChannels = Arc::new(Default::default());
    let rx_channels: RxChannels = Arc::new(Default::default());

    let make_svc = make_service_fn(|_conn| {
        let tx_channels_clone = tx_channels.clone();
        let rx_channels_clone = rx_channels.clone();

        async {
            Ok::<_, Error>(service_fn(move |r| {
                process(r, tx_channels_clone.clone(), rx_channels_clone.clone())
            }))
        }
    });

    let port = std::env::var("PORT").unwrap_or_else(|_| "5003".to_string());
    let addr = format!("0.0.0.0:{}", port).parse().unwrap();

    let builder = Server::builder(AddrIncoming::bind(&addr)?)
        .http1_keepalive(true)
        .http2_keep_alive_interval(Duration::from_secs(10))
        .http2_keep_alive_timeout(Duration::from_secs(120));
    let server = builder.serve(make_svc);

    info!("Listening on http://{}", addr);
    server.await?;
    Ok(())
}

async fn process(
    mut request: Request<Body>,
    tx_channels: TxChannels,
    rx_channels: RxChannels,
) -> Result<Response<Body>, Error> {
    if request.uri().path() == "/health_check" && request.method() == Method::GET {
        return Ok(success());
    }

    let path = request.uri().path();
    let channel_id = channel_id(path);

    info!("[{}] on channel {}", request.method(), &channel_id);

    match *request.method() {
        Method::GET => {
            let (body_rx, mut header_rx) = {
                match rx_channels.remove(&channel_id) {
                    Some((_, rx)) => rx,
                    None => {
                        let body_chan = Body::channel();
                        let header_chan = channel(1);
                        tx_channels.insert(channel_id, (body_chan.0, header_chan.0));
                        (body_chan.1, header_chan.1)
                    }
                }
            };

            let mut builder = Response::builder().status(200);

            // wait for headers and forward
            if let Some(headers) = header_rx.recv().await {
                for (n, v) in headers.into_iter().filter_map(|(on, v)| on.map(|n| (n, v))) {
                    builder = builder.header(n, v)
                }
            }

            Ok(builder.body(body_rx)?)
        }
        Method::POST => {
            let (mut body_tx, header_tx) = {
                match tx_channels.remove(&channel_id) {
                    Some((_, tx)) => tx,
                    None => {
                        let body_chan = Body::channel();
                        let header_chan = channel(1);
                        rx_channels.insert(channel_id, (body_chan.1, header_chan.1));
                        (body_chan.0, header_chan.0)
                    }
                }
            };

            // send the headers
            header_tx.send(request.headers().clone()).await?;

            // send the body
            let body = request.body_mut();
            while let Some(result_chunk) = body.next().await {
                body_tx.send_data(result_chunk?).await?;
            }

            Ok(success())
        }
        _ => error("invalid method"),
    }
}

fn channel_id(path: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(path.as_bytes());
    let result = hasher.finalize();
    base64::encode(result)
}

fn success() -> Response<Body> {
    Response::new(Body::from("ok"))
}
fn error(message: &str) -> Result<Response<Body>, Error> {
    Ok(Response::builder()
        .status(400)
        .body(Body::from(message.to_owned()))?)
}

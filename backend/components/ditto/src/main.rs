use std::net::SocketAddr;

use bytes::Bytes;
use http_body_util::{combinators::BoxBody, BodyExt, Empty, Full};
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use tokio::net::TcpListener;

async fn ditto(
    req: Request<hyper::body::Incoming>,
) -> Result<Response<BoxBody<Bytes, hyper::Error>>, hyper::Error> {
    match (req.method(), req.uri().path()) {
        // Serve some instructions at /
        (&Method::GET, "/") => Ok(Response::new(full(
            "Welcome to Footprint Ditto. Try POSTing data to /",
        ))),

        // Simply echo the body back to the client.
        (&Method::POST, "/") => {
            let (req_parts, body) = req.into_parts();
            // echo the body
            let (mut resp_parts, body) = Response::new(body.boxed()).into_parts();
            // echo the headers

            resp_parts.headers = req_parts
                .headers
                .into_iter()
                .filter_map(|(name, val)| {
                    let Some(name) = name else {
                        return None;
                    };

                    if name.as_str().starts_with("fly-") {
                        return None;
                    }

                    Some((name, val))
                })
                .collect();

            Ok(Response::from_parts(resp_parts, body))
        }

        // Return the 404 Not Found for other routes.
        _ => {
            let mut not_found = Response::new(empty());
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
    }
}

fn empty() -> BoxBody<Bytes, hyper::Error> {
    Empty::<Bytes>::new().map_err(|never| match never {}).boxed()
}

fn full<T: Into<Bytes>>(chunk: T) -> BoxBody<Bytes, hyper::Error> {
    Full::new(chunk.into()).map_err(|never| match never {}).boxed()
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let port = std::env::var("PORT")
        .ok()
        .and_then(|r| r.parse::<u16>().ok())
        .unwrap_or(5000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    let listener = TcpListener::bind(addr).await?;
    eprintln!("Listening on http://{}", addr);

    loop {
        let (stream, _) = listener.accept().await?;

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(stream, service_fn(ditto))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}

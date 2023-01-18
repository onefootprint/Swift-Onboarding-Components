use std::net::SocketAddr;

use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};

pub async fn ditto(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    match (req.method(), req.uri().path()) {
        // Serve some instructions at /
        (&Method::GET, "/") => Ok(Response::new(Body::from(
            "Welcome to Footprint Ditto. Try POSTing data to /",
        ))),

        // Simply echo the body back to the client.
        (&Method::POST, "/") => {
            
            let (req_parts, body) = req.into_parts();
            // echo the body
            let (mut resp_parts, body) = Response::new(body).into_parts();

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
            let mut not_found = Response::default();
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
    }
}

pub async fn serve(port: u16) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let service = make_service_fn(|_| async { Ok::<_, hyper::Error>(service_fn(ditto)) });
    let server = Server::bind(&addr).serve(service);
    eprintln!("[basic] Starting to serve on http://{}", addr);
    server.await?;
    Ok(())
}

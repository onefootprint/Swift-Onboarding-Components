use core::task::Context;
use core::task::Poll;
use futures_util::ready;
use hyper::server::accept::Accept;
use hyper::server::conn::AddrIncoming;
use hyper::server::conn::AddrStream;
use hyper::service::make_service_fn;
use hyper::service::service_fn;
use hyper::Body;
use hyper::Method;
use hyper::Request;
use hyper::Response;
use hyper::Server;
use hyper::StatusCode;
use std::future::Future;
use std::io;
use std::io::Cursor;
use std::net::SocketAddr;
use std::pin::Pin;
use std::sync;
use std::sync::Arc;
use std::sync::Mutex;
use std::vec::Vec;
use tokio::io::AsyncRead;
use tokio::io::AsyncWrite;
use tokio::io::ReadBuf;
use tokio_rustls::rustls::ServerConfig;
use webpki::TrustAnchor;

pub async fn serve(port: u16) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    let tls_cfg = {
        let certs = load_certs(include_bytes!("dummy_cert/server.crt"))?;
        let key = load_private_key(include_bytes!("dummy_cert/server.key"))?;

        // Do not use client certificate authentication.
        let mut cfg = rustls::ServerConfig::builder()
            .with_safe_defaults()
            .with_client_cert_verifier(Arc::new(AllowAllClientCerts))
            .with_single_cert(certs, key)
            .map_err(|e| error(format!("{}", e)))?;

        // Configure ALPN to accept HTTP/2, HTTP/1.1 in that order.
        cfg.alpn_protocols = vec![b"h2".to_vec(), b"http/1.1".to_vec()];

        sync::Arc::new(cfg)
    };

    // Create a TCP listener via tokio.
    let incoming = AddrIncoming::bind(&addr)?;
    let service = make_service_fn(|s: &TlsStream| {
        let cert = s.peer_cert.clone();

        async move {
            let cert2 = cert.clone();
            Ok::<_, io::Error>(service_fn(move |req| {
                let cert3 = cert2.clone();
                async move { ditto(req, cert3).await }
            }))
        }
    });
    let server = Server::builder(TlsAcceptor::new(tls_cfg, incoming)).serve(service);

    // Run the future, keep going until an error occurs.
    eprintln!("[mtls] Starting to serve on https://{}", addr);
    server.await?;
    Ok(())
}

async fn ditto(
    req: Request<Body>,
    cert: Arc<Mutex<Option<rustls::Certificate>>>,
) -> Result<Response<Body>, hyper::Error> {
    match (req.method(), req.uri().path()) {
        // Serve some instructions at /
        (&Method::GET, "/") => Ok(Response::new(Body::from(
            "Welcome to Footprint Ditto (TLS). Try POSTing data to /",
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
                    let name = name?;

                    if name.as_str().starts_with("fly-") {
                        return None;
                    }

                    Some((name, val))
                })
                .collect();

            let cert = cert.lock().unwrap();
            if let Some(subj) = cert.as_ref().and_then(|c| {
                eprintln!("got cert: {:?}", c);

                x509_parser::parse_x509_certificate(c.as_ref())
                    .map(|cert| cert.1.tbs_certificate.serial.to_string())
                    .ok()
            }) {
                resp_parts
                    .headers
                    .append("x-ditto-client-cert-serial", subj.parse().unwrap());
            }

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

struct AllowAllClientCerts;
impl rustls::server::ClientCertVerifier for AllowAllClientCerts {
    fn client_auth_root_subjects(&self) -> Option<rustls::DistinguishedNames> {
        Some(vec![])
    }

    fn client_auth_mandatory(&self) -> Option<bool> {
        Some(false)
    }

    fn verify_client_cert(
        &self,
        end_entity: &rustls::Certificate,
        intermediates: &[rustls::Certificate],
        now: std::time::SystemTime,
    ) -> Result<rustls::server::ClientCertVerified, rustls::Error> {
        let cert = webpki::EndEntityCert::try_from(end_entity.0.as_ref()).map_err(pki_error)?;

        let intermediates: Vec<&[u8]> = intermediates.iter().map(|cert| cert.0.as_ref()).collect();

        // grab the root cert as our trust anchor
        let roots = intermediates
            .last()
            .and_then(|c| TrustAnchor::try_from_cert_der(c).ok())
            .map(|c| vec![c])
            .unwrap_or_default();

        let now = webpki::Time::try_from(now).map_err(|_| rustls::Error::FailedToGetCurrentTime)?;
        let res = cert.verify_is_valid_tls_client_cert(
            &[
                &webpki::ECDSA_P256_SHA256,
                &webpki::ECDSA_P256_SHA384,
                &webpki::ECDSA_P384_SHA256,
                &webpki::ECDSA_P384_SHA384,
                &webpki::ED25519,
                &webpki::RSA_PSS_2048_8192_SHA256_LEGACY_KEY,
                &webpki::RSA_PSS_2048_8192_SHA384_LEGACY_KEY,
                &webpki::RSA_PSS_2048_8192_SHA512_LEGACY_KEY,
                &webpki::RSA_PKCS1_2048_8192_SHA256,
                &webpki::RSA_PKCS1_2048_8192_SHA384,
                &webpki::RSA_PKCS1_2048_8192_SHA512,
                &webpki::RSA_PKCS1_3072_8192_SHA384,
            ],
            &webpki::TlsClientTrustAnchors(&roots),
            &intermediates,
            now,
        );

        match res {
            Err(webpki::Error::UnknownIssuer) | Ok(_) => Ok(rustls::server::ClientCertVerified::assertion()),
            Err(e) => Err(pki_error(e)),
        }
    }
}

fn pki_error(error: webpki::Error) -> rustls::Error {
    use webpki::Error::*;
    match error {
        BadDer | BadDerTime => rustls::Error::InvalidCertificateEncoding,
        InvalidSignatureForPublicKey => rustls::Error::InvalidCertificateSignature,
        UnsupportedSignatureAlgorithm | UnsupportedSignatureAlgorithmForPublicKey => {
            rustls::Error::InvalidCertificateSignatureType
        }
        e => rustls::Error::InvalidCertificateData(format!("invalid peer certificate: {}", e)),
    }
}

fn error(err: String) -> io::Error {
    io::Error::new(io::ErrorKind::Other, err)
}

enum State {
    Handshaking(tokio_rustls::Accept<AddrStream>),
    Streaming(tokio_rustls::server::TlsStream<AddrStream>),
}

// tokio_rustls::server::TlsStream doesn't expose constructor methods,
// so we have to TlsAcceptor::accept and handshake to have access to it
// TlsStream implements AsyncRead/AsyncWrite handshaking tokio_rustls::Accept first
pub struct TlsStream {
    state: State,
    peer_cert: Arc<Mutex<Option<rustls::Certificate>>>,
}

impl TlsStream {
    fn new(stream: AddrStream, config: Arc<ServerConfig>) -> TlsStream {
        let accept = tokio_rustls::TlsAcceptor::from(config).accept(stream);
        TlsStream {
            state: State::Handshaking(accept),
            peer_cert: Arc::new(Mutex::new(None)),
        }
    }
}

impl AsyncRead for TlsStream {
    fn poll_read(self: Pin<&mut Self>, cx: &mut Context, buf: &mut ReadBuf) -> Poll<io::Result<()>> {
        let pin = self.get_mut();
        match pin.state {
            State::Handshaking(ref mut accept) => match ready!(Pin::new(accept).poll(cx)) {
                Ok(mut stream) => {
                    let result = Pin::new(&mut stream).poll_read(cx, buf);
                    pin.state = State::Streaming(stream);
                    result
                }
                Err(err) => Poll::Ready(Err(err)),
            },
            State::Streaming(ref mut stream) => Pin::new(stream).poll_read(cx, buf),
        }
    }
}

impl AsyncWrite for TlsStream {
    fn poll_write(self: Pin<&mut Self>, cx: &mut Context<'_>, buf: &[u8]) -> Poll<io::Result<usize>> {
        let pin = self.get_mut();

        match pin.state {
            State::Handshaking(ref mut accept) => match ready!(Pin::new(accept).poll(cx)) {
                Ok(mut stream) => {
                    let result = Pin::new(&mut stream).poll_write(cx, buf);
                    pin.state = State::Streaming(stream);
                    result
                }
                Err(err) => Poll::Ready(Err(err)),
            },
            State::Streaming(ref mut stream) => {
                let (_, session) = stream.get_ref();

                if let Some(cert) = session.peer_certificates().unwrap_or_default().last() {
                    let _ = pin.peer_cert.lock().unwrap().replace(cert.clone());
                }

                Pin::new(stream).poll_write(cx, buf)
            }
        }
    }

    fn poll_flush(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        match self.state {
            State::Handshaking(_) => Poll::Ready(Ok(())),
            State::Streaming(ref mut stream) => Pin::new(stream).poll_flush(cx),
        }
    }

    fn poll_shutdown(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        match self.state {
            State::Handshaking(_) => Poll::Ready(Ok(())),
            State::Streaming(ref mut stream) => Pin::new(stream).poll_shutdown(cx),
        }
    }
}

pub struct TlsAcceptor {
    config: Arc<ServerConfig>,
    incoming: AddrIncoming,
}

impl TlsAcceptor {
    pub fn new(config: Arc<ServerConfig>, incoming: AddrIncoming) -> TlsAcceptor {
        TlsAcceptor { config, incoming }
    }
}

impl Accept for TlsAcceptor {
    type Conn = TlsStream;
    type Error = io::Error;

    fn poll_accept(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Self::Conn, Self::Error>>> {
        let pin = self.get_mut();
        match ready!(Pin::new(&mut pin.incoming).poll_accept(cx)) {
            Some(Ok(sock)) => Poll::Ready(Some(Ok(TlsStream::new(sock, pin.config.clone())))),
            Some(Err(e)) => Poll::Ready(Some(Err(e))),
            None => Poll::Ready(None),
        }
    }
}

// Load public certificate from file.
fn load_certs(certs: &[u8]) -> io::Result<Vec<rustls::Certificate>> {
    let mut cursor = Cursor::new(certs);

    // Load and return certificate.
    let certs = rustls_pemfile::certs(&mut cursor).map_err(|_| error("failed to load certificate".into()))?;
    Ok(certs.into_iter().map(rustls::Certificate).collect())
}

// Load private key from file.
fn load_private_key(key: &[u8]) -> io::Result<rustls::PrivateKey> {
    let mut cursor = Cursor::new(key);

    // Load and return a single private key.
    let key =
        rustls_pemfile::read_one(&mut cursor).map_err(|_| error("failed to load private key".into()))?;

    let key = match key {
        Some(rustls_pemfile::Item::ECKey(key)) => key,
        Some(rustls_pemfile::Item::PKCS8Key(key)) => key,
        _ => return Err(error("invalid key type".into())),
    };

    Ok(rustls::PrivateKey(key))
}

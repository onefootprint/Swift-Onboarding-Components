use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiResult;
use futures_util::future::FutureExt;
use hyper::client::connect::dns::GaiResolver as HyperGaiResolver;
use hyper::client::connect::dns::Name;
use hyper::service::Service;
use reqwest::dns::Addrs;
use reqwest::dns::Resolve;
use reqwest::dns::Resolving;
use std::error::Error;
use std::net::IpAddr;
use std::net::Ipv4Addr;
use std::net::Ipv6Addr;
use std::net::SocketAddr;

pub fn validate_safe_url(url: &url::Url) -> ApiResult<()> {
    if url.as_str() == "https://ditto.footprint.dev:8443/" {
        // Non-standard port used in integration tests.
        return Ok(());
    }

    match url.scheme() {
        "http" | "https" => (),
        _ => {
            return Err(VaultProxyError::InvalidDestinationUrl.into());
        }
    }

    match url.domain() {
        None | Some("localhost") => {
            return Err(VaultProxyError::InvalidDestinationUrl.into());
        }
        Some(domain) if domain.to_lowercase().ends_with("onefootprint.com") => {
            return Err(VaultProxyError::InvalidFootprintDestinationUrl.into());
        }
        _ => {}
    }

    match url.port() {
        None | Some(80) | Some(443) => {}
        _ => {
            return Err(VaultProxyError::InvalidDestinationUrl.into());
        }
    }

    if url.username() != "" {
        return Err(VaultProxyError::InvalidDestinationUrl.into());
    }

    if url.password().is_some() {
        return Err(VaultProxyError::InvalidDestinationUrl.into());
    }

    Ok(())
}

pub struct PublicIpDNSResolver(HyperGaiResolver);

impl PublicIpDNSResolver {
    pub fn new() -> Self {
        Self(HyperGaiResolver::new())
    }
}

impl Default for PublicIpDNSResolver {
    fn default() -> Self {
        PublicIpDNSResolver::new()
    }
}

type BoxError = Box<dyn Error + Send + Sync>;

impl Resolve for PublicIpDNSResolver {
    fn resolve(&self, name: Name) -> Resolving {
        let this = &mut self.0.clone();
        Box::pin(Service::<Name>::call(this, name).map(|result| {
            result
                .map(|addrs| -> Result<Addrs, BoxError> {
                    let mut ret = vec![];
                    for addr in addrs {
                        if is_public_addr(&addr) {
                            ret.push(addr)
                        } else {
                            return Err(Box::new(VaultProxyError::InvalidDestinationUrl));
                        }
                    }

                    Ok(Box::new(ret.into_iter()))
                })
                .map_err(|err| -> BoxError { Box::new(err) })?
        }))
    }
}

// Ported from https://www.agwa.name/blog/post/preventing_server_side_request_forgery_in_golang/media/ipaddress.go
// TODO: use more stdlib after stable: https://github.com/rust-lang/rust/issues/27709
fn is_public_addr(addr: &SocketAddr) -> bool {
    match to_canonical_ip(addr.ip()) {
        IpAddr::V4(addr) => ipv4_is_global(&addr),
        IpAddr::V6(addr) => ipv6_is_global(&addr),
    }
}

fn to_canonical_ip(addr: IpAddr) -> IpAddr {
    match addr {
        IpAddr::V4(addr) => IpAddr::V4(addr),
        IpAddr::V6(addr) => {
            if let Some(mapped) = addr.to_ipv4_mapped() {
                IpAddr::V4(mapped)
            } else {
                IpAddr::V6(addr)
            }
        }
    }
}

// A combination of the following:
// - https://www.agwa.name/blog/post/preventing_server_side_request_forgery_in_golang/media/ipaddress.go
// - https://github.com/rust-lang/rust/blob/ef324565d071c6d7e2477a195648549e33d6a465/library/core/src/net/ip_addr.rs#L767-L783
fn ipv4_is_global(addr: &Ipv4Addr) -> bool {
    !(
        // "This network"
        addr.octets()[0] == 0
        || addr.is_private()
        || is_shared_ip(addr)
        || addr.is_loopback()
        || addr.is_link_local()
            || (
                addr.octets()[0] == 192 && addr.octets()[1] == 0 && addr.octets()[2] == 0
                && addr.octets()[3] != 9 && addr.octets()[3] != 10
            )
        || addr.is_documentation()
        || is_benchmarking_ip(addr)
        || is_reserved_ip(addr)
        || addr.is_broadcast()
        // The following aren't in the unstable stdlib is_global()
        || addr.is_multicast()
        // IPv6 to IPv4 relay
        || matches!(addr.octets(), [192, 88, 99, _])
    )
}

fn is_shared_ip(addr: &Ipv4Addr) -> bool {
    // RFC6598
    // 100.64.0.0/10
    addr.octets()[0] == 100 && (addr.octets()[1] & 0b1100_0000 == 0b0100_0000)
}

fn is_benchmarking_ip(addr: &Ipv4Addr) -> bool {
    // 198.18.0.0/15
    addr.octets()[0] == 198 && (addr.octets()[1] & 0xfe) == 18
}

fn is_reserved_ip(addr: &Ipv4Addr) -> bool {
    // 240.0.0.0/4, excluding broadcast
    addr.octets()[0] & 0xf0 == 240 && !addr.is_broadcast()
}

// From https://github.com/rust-lang/rust/blob/ef324565d071c6d7e2477a195648549e33d6a465/library/core/src/net/ip_addr.rs#L1501-L1531
fn ipv6_is_global(addr: &Ipv6Addr) -> bool {
    !(addr.is_unspecified()
            || addr.is_loopback()
            // IPv4-mapped Address (`::ffff:0:0/96`)
            || matches!(addr.segments(), [0, 0, 0, 0, 0, 0xffff, _, _])
            // IPv4-IPv6 Translat. (`64:ff9b:1::/48`)
            || matches!(addr.segments(), [0x64, 0xff9b, 1, _, _, _, _, _])
            // Discard-Only Address Block (`100::/64`)
            || matches!(addr.segments(), [0x100, 0, 0, 0, _, _, _, _])
            // IETF Protocol Assignments (`2001::/23`)
            || (matches!(addr.segments(), [0x2001, b, _, _, _, _, _, _] if b < 0x200)
                && !(
                    // Port Control Protocol Anycast (`2001:1::1`)
                    u128::from_be_bytes(addr.octets()) == 0x2001_0001_0000_0000_0000_0000_0000_0001
                    // Traversal Using Relays around NAT Anycast (`2001:1::2`)
                    || u128::from_be_bytes(addr.octets()) == 0x2001_0001_0000_0000_0000_0000_0000_0002
                    // AMT (`2001:3::/32`)
                    || matches!(addr.segments(), [0x2001, 3, _, _, _, _, _, _])
                    // AS112-v6 (`2001:4:112::/48`)
                    || matches!(addr.segments(), [0x2001, 4, 0x112, _, _, _, _, _])
                    // ORCHIDv2 (`2001:20::/28`)
                    // Drone Remote ID Protocol Entity Tags (DETs) Prefix (`2001:30::/28`)`
                    || matches!(addr.segments(), [0x2001, b, _, _, _, _, _, _] if (0x20..=0x3F).contains(&b))
                ))
            // 6to4 (`2002::/16`) – it's not explicitly documented as globally reachable,
            // IANA says N/A.
            || matches!(addr.segments(), [0x2002, _, _, _, _, _, _, _])
            || is_documentation_ip(addr)
            || is_unique_local_ip(addr)
            || is_unicast_link_local_ip(addr))
}

fn is_documentation_ip(addr: &Ipv6Addr) -> bool {
    (addr.segments()[0] == 0x2001) && (addr.segments()[1] == 0xdb8)
}

fn is_unique_local_ip(addr: &Ipv6Addr) -> bool {
    (addr.segments()[0] & 0xfe00) == 0xfc00
}

fn is_unicast_link_local_ip(addr: &Ipv6Addr) -> bool {
    (addr.segments()[0] & 0xffc0) == 0xfe80
}

#[cfg(test)]
#[allow(clippy::bool_assert_comparison)]
mod test {
    use super::*;
    use test_case::test_case;

    #[test_case("http://flerp.derp.com/hayes_valley" => true)]
    #[test_case("https://ditto.footprint.dev/" => true)]
    #[test_case("https://ditto.footprint.dev:8443/" => true)]
    #[test_case("http://user@flerp.derp.com/hayes_valley" => false)]
    #[test_case("https://api.onefootprint.com/vault_proxy/jit" => false)]
    #[test_case("http://onefootprint.com" => false)]
    #[test_case("http://localhost" => false)]
    #[test_case("http://127.0.0.1" => false)]
    #[test_case("http://1.1.1.1" => false)]
    #[test_case("http://169.254.170.2/v2/metadata" => false)]
    #[test_case("http://169.254.169.254/latest/meta-data/local-hostname" => false)]
    #[test_case("ftp://myserver.com" => false)]
    #[test_case("ftp://rms@example.com" => false)]
    #[test_case("http://myserver.com" => true)]
    #[test_case("http://:password@myserver.com" => false)]
    #[test_case("http://username@myserver.com" => false)]
    #[test_case("http://username:password@myserver.com" => false)]
    // These would resolve to an internal IP but the custom DNS resolver filters these out.
    #[test_case("https://db-dev.cluster-ro-cy0tm0qev8uk.us-east-1.rds.amazonaws.com" => true)]
    #[test_case("https://ip-10-1-196-210.ec2.internal" => true)]
    fn test_validate_safe_url(url: &str) -> bool {
        let url = url::Url::parse(url).unwrap();
        validate_safe_url(&url).is_ok()
    }

    #[test]
    fn test_is_public_addr() {
        for addr in [
            &SocketAddr::new(Ipv4Addr::new(204, 10, 78, 152).into(), 443),
            &SocketAddr::new(Ipv4Addr::new(172, 253, 63, 113).into(), 443),
            &SocketAddr::new(Ipv6Addr::new(1, 1, 1, 1, 1, 1, 1, 1).into(), 443),
        ]
        .iter()
        {
            assert_eq!(is_public_addr(addr), true);
        }

        for addr in [
            &SocketAddr::new(Ipv4Addr::new(127, 0, 0, 1).into(), 443),
            &SocketAddr::new(Ipv4Addr::new(192, 168, 1, 1).into(), 443),
            &SocketAddr::new(Ipv4Addr::new(169, 254, 170, 2).into(), 443),
            &SocketAddr::new(Ipv4Addr::new(169, 254, 169, 254).into(), 443),
            &SocketAddr::new(Ipv6Addr::new(0, 0, 0, 0, 0, 0, 0, 1).into(), 443),
        ]
        .iter()
        {
            assert_eq!(is_public_addr(addr), false);
        }
    }

    #[test]
    fn test_is_shared_ip() {
        assert_eq!(is_shared_ip(&Ipv4Addr::new(100, 64, 0, 0)), true);
        assert_eq!(is_shared_ip(&Ipv4Addr::new(100, 127, 255, 255)), true);
        assert_eq!(is_shared_ip(&Ipv4Addr::new(100, 128, 0, 0)), false);
    }

    #[test]
    fn test_is_benchmarking_ip() {
        assert_eq!(is_benchmarking_ip(&Ipv4Addr::new(198, 17, 255, 255)), false);
        assert_eq!(is_benchmarking_ip(&Ipv4Addr::new(198, 18, 0, 0)), true);
        assert_eq!(is_benchmarking_ip(&Ipv4Addr::new(198, 19, 255, 255)), true);
        assert_eq!(is_benchmarking_ip(&Ipv4Addr::new(198, 20, 0, 0)), false);
    }

    #[test]
    fn test_is_reserved_ip() {
        assert_eq!(is_reserved_ip(&Ipv4Addr::new(240, 0, 0, 0)), true);
        assert_eq!(is_reserved_ip(&Ipv4Addr::new(255, 255, 255, 254)), true);
        assert_eq!(is_reserved_ip(&Ipv4Addr::new(239, 255, 255, 255)), false);
        // The broadcast address is not considered as reserved for future use by this implementation
        assert_eq!(is_reserved_ip(&Ipv4Addr::new(255, 255, 255, 255)), false);
    }

    #[test]
    fn test_is_documentation_ip() {
        assert_eq!(
            is_documentation_ip(&Ipv6Addr::new(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)),
            false
        );
        assert_eq!(
            is_documentation_ip(&Ipv6Addr::new(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)),
            true
        );
    }

    #[test]
    fn test_is_unique_local_ip() {
        assert_eq!(
            is_unique_local_ip(&Ipv6Addr::new(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)),
            false
        );
        assert_eq!(
            is_unique_local_ip(&Ipv6Addr::new(0xfc02, 0, 0, 0, 0, 0, 0, 0)),
            true
        );
    }

    #[test]
    fn test_is_unicast_link_local_ip() {
        // The loopback address (`::1`) does not actually have link-local scope.
        assert_eq!(is_unicast_link_local_ip(&Ipv6Addr::LOCALHOST), false);

        // Only addresses in `fe80::/10` have link-local scope.
        assert_eq!(
            is_unicast_link_local_ip(&Ipv6Addr::new(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)),
            false
        );
        assert_eq!(
            is_unicast_link_local_ip(&Ipv6Addr::new(0xfe80, 0, 0, 0, 0, 0, 0, 0)),
            true
        );

        // Addresses outside the stricter `fe80::/64` also have link-local scope.
        assert_eq!(
            is_unicast_link_local_ip(&Ipv6Addr::new(0xfe80, 0, 0, 1, 0, 0, 0, 0)),
            true
        );
        assert_eq!(
            is_unicast_link_local_ip(&Ipv6Addr::new(0xfe81, 0, 0, 0, 0, 0, 0, 0)),
            true
        );
    }
}

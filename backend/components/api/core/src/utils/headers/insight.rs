use super::{
    get_header,
    TelemetryHeaders,
};
use actix_web::FromRequest;
use chrono::{
    DateTime,
    Utc,
};
use db::models::insight_event::CreateInsightEvent;
use futures_util::Future;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use std::net::SocketAddr;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Schema, Serialize, Deserialize)]
pub struct InsightHeaders {
    pub ip_address: Option<String>,
    pub city: Option<String>,
    pub country: Option<String>,
    pub region: Option<String>,
    pub region_name: Option<String>,
    pub latitude: Option<String>,
    pub longitude: Option<String>,
    pub metro_code: Option<String>,
    pub postal_code: Option<String>,
    pub time_zone: Option<String>,
    pub user_agent: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub is_android_user: Option<String>,
    pub is_desktop_viewer: Option<String>,
    pub is_ios_viewer: Option<String>,
    pub is_mobile_viewer: Option<String>,
    pub is_smarttv_viewer: Option<String>,
    pub is_tablet_viewer: Option<String>,
    pub asn: Option<String>,
    pub country_code: Option<String>,
    pub forwarded_proto: Option<String>,
    pub http_version: Option<String>,
    pub tls: Option<String>,
    pub origin: Option<String>,
    pub session_id: Option<String>,
}

impl FromRequest for InsightHeaders {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let cloudfront = InsightHeaders::parse_from_request(req);
        Box::pin(async move { Ok(cloudfront) })
    }
}

impl InsightHeaders {
    /// parse cloudfront headers
    pub fn parse_from_request(req: &actix_web::HttpRequest) -> Self {
        let headers = req.headers();

        let ip_address = if let Some(h) = get_header("cloudfront-viewer-address", headers) {
            h.parse::<SocketAddr>().map(|s| s.ip().to_string()).ok()
        } else {
            // Fall back on peer address if we're not behind the CloudFront proxy.
            // Useful for local testing.
            req.peer_addr().map(|s| s.ip().to_string())
        };

        let session_id = get_header(TelemetryHeaders::SESSION_HEADER_NAME, headers);

        let headers = InsightHeaders {
            ip_address,
            timestamp: chrono::Utc::now(),
            city: get_header("cloudfront-viewer-city", headers),
            country: get_header("cloudfront-viewer-country-name", headers),
            region: get_header("cloudfront-viewer-country-region", headers),
            region_name: get_header("cloudfront-viewer-country-region-name", headers),
            latitude: get_header("cloudfront-viewer-latitude", headers),
            longitude: get_header("cloudfront-viewer-longitude", headers),
            metro_code: get_header("cloudfront-viewer-metro-code", headers),
            postal_code: get_header("cloudfront-viewer-postal-code", headers),
            time_zone: get_header("cloudfront-viewer-time-zone", headers),
            user_agent: get_header(actix_web::http::header::USER_AGENT.as_str(), headers),
            is_android_user: get_header("cloudfront-is-android-viewer", headers),
            is_desktop_viewer: get_header("cloudfront-is-desktop-viewer", headers),
            is_ios_viewer: get_header("cloudfront-is-ios-viewer", headers),
            is_mobile_viewer: get_header("cloudfront-is-mobile-viewer", headers),
            is_smarttv_viewer: get_header("cloudfront-is-smarttv-viewer", headers),
            is_tablet_viewer: get_header("cloudfront-is-tablet-viewer", headers),
            asn: get_header("cloudfront-viewer-asn", headers),
            country_code: get_header("cloudfront-viewer-country", headers),
            forwarded_proto: get_header("cloudfront-forwarded-proto", headers),
            http_version: get_header("cloudfront-viewer-http-version", headers),
            tls: get_header("cloudfront-viewer-tls", headers),
            origin: get_header("origin", headers),
            session_id,
        };
        headers.log();
        headers
    }
}

impl InsightHeaders {
    pub fn location(&self) -> Option<String> {
        match (self.city.as_deref(), self.region.as_deref()) {
            (Some(city), Some(region)) => Some(format!("{}, {}", city, region)),
            (Some(x), None) | (None, Some(x)) => Some(x.to_owned()),
            (None, None) => None,
        }
    }

    /// Log all extracted header values
    fn log(&self) {
        let Self {
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            timestamp,
            is_android_user,
            is_desktop_viewer,
            is_ios_viewer,
            is_mobile_viewer,
            is_smarttv_viewer,
            is_tablet_viewer,
            asn,
            country_code,
            forwarded_proto,
            http_version,
            tls,
            origin,
            session_id,
            // Add new fields to the tracing::info! call below
        } = self;
        tracing::info!(
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            timestamp=%timestamp,
            is_android_user,
            is_desktop_viewer,
            is_ios_viewer,
            is_mobile_viewer,
            is_smarttv_viewer,
            is_tablet_viewer,
            asn,
            country_code,
            forwarded_proto,
            http_version,
            tls,
            origin,
            // fp_session_id is used in telemetry to avoid conflicting with session_id, which is reserved for Datadog RUM.
            fp_session_id = session_id,
            "Extracted InsightHeaders"
        );
    }
}

impl From<InsightHeaders> for CreateInsightEvent {
    fn from(i: InsightHeaders) -> CreateInsightEvent {
        let InsightHeaders {
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            timestamp,
            is_android_user,
            is_desktop_viewer,
            is_ios_viewer,
            is_mobile_viewer,
            is_smarttv_viewer,
            is_tablet_viewer,
            asn,
            country_code,
            forwarded_proto,
            http_version,
            tls,
            session_id,
            origin,
        } = i;

        let latitude = latitude.and_then(|lat| lat.parse().ok());
        let longitude = longitude.and_then(|lon| lon.parse().ok());
        let is_android_user = is_android_user.and_then(|b| b.parse().ok());

        let is_desktop_viewer = is_desktop_viewer.and_then(|b| b.parse().ok());
        let is_ios_viewer = is_ios_viewer.and_then(|b| b.parse().ok());
        let is_mobile_viewer = is_mobile_viewer.and_then(|b| b.parse().ok());
        let is_smarttv_viewer = is_smarttv_viewer.and_then(|b| b.parse().ok());
        let is_tablet_viewer = is_tablet_viewer.and_then(|b| b.parse().ok());

        CreateInsightEvent {
            timestamp,
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            is_android_user,
            is_desktop_viewer,
            is_ios_viewer,
            is_mobile_viewer,
            is_smarttv_viewer,
            is_tablet_viewer,
            asn,
            country_code,
            forwarded_proto,
            http_version,
            tls,
            session_id,
            origin,
        }
    }
}

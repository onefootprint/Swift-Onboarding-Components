use std::{net::SocketAddr, pin::Pin};

use actix_web::{FromRequest, HttpRequest};
use chrono::NaiveDateTime;
use db::models::insight_event::CreateInsightEvent;
use futures_util::Future;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema)]
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
    pub timestamp: NaiveDateTime,
}

impl FromRequest for InsightHeaders {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let ip_address = get_header("cloudfront-viewer-address", req)
            .and_then(|s| s.parse::<SocketAddr>().map(|s| s.ip().to_string()).ok());

        let cloudfront = InsightHeaders {
            ip_address,
            city: get_header("cloudfront-viewer-city", req),
            country: get_header("cloudfront-viewer-country", req),
            region: get_header("cloudfront-viewer-country-region", req),
            region_name: get_header("cloudfront-viewer-country-region-name", req),
            latitude: get_header("cloudfront-viewer-latitude", req),
            longitude: get_header("cloudfront-viewer-longitude", req),
            metro_code: get_header("cloudfront-viewer-metro-code", req),
            postal_code: get_header("cloudfront-viewer-postal-code", req),
            time_zone: get_header("cloudfront-viewer-time-zone", req),
            user_agent: get_header(actix_web::http::header::USER_AGENT.as_str(), req),
            timestamp: chrono::Utc::now().naive_utc(),
        };

        Box::pin(async move { Ok(cloudfront) })
    }
}

fn get_header(name: &str, req: &HttpRequest) -> Option<String> {
    req.headers()
        .get(name)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
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
        } = i;

        let latitude = latitude.and_then(|lat| lat.parse().ok());
        let longitude = longitude.and_then(|lon| lon.parse().ok());

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
        }
    }
}

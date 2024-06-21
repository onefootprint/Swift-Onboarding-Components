use reqwest::header::HeaderMap;
use reqwest::Method;
use serde::Serialize;
use std::fmt::Display;
use std::time::Duration;
use std::time::Instant;

#[derive(Debug, Clone)]
pub struct ApiClient {
    base: String,
    client: reqwest::Client,
}

impl ApiClient {
    pub fn new(api_key: String, base_url: String) -> anyhow::Result<Self> {
        let mut headers = HeaderMap::new();
        headers.insert("x-footprint-secret-key", api_key.parse().unwrap());
        let client = reqwest::Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            base: base_url,
        })
    }

    pub async fn call<S: ToString + Display, D: Serialize>(
        &self,
        path: S,
        method: Method,
        body: Option<D>,
        headers: Vec<(&str, String)>,
    ) -> anyhow::Result<reqwest::Response> {
        let _start = Instant::now();
        let url = format!("{}/{}", &self.base, path);
        let request = self.client.request(method.clone(), url);
        let mut request = if let Some(body) = body {
            request.json(&body)
        } else {
            request
        };
        for (key, value) in headers.into_iter() {
            request = request.header(key, value);
        }
        let res = request.send().await?;
        // println!("{} {} <=> {:?}", method, path, _start.elapsed().as_millis());
        Ok(res)
    }
}

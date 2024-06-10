use paperclip::actix::web;
use {
    api_route_businesses as businesses,
    api_route_entities as entities,
    api_route_hosted as hosted,
    api_route_index as index,
    api_route_integrations as integrations,
    api_route_onboarding as onboarding,
    api_route_org as org,
    api_route_partner as partner,
    api_route_users as users,
    api_route_vault_proxy as vault_proxy,
    api_route_webhooks as webhooks,
};

pub fn configure(config: &mut web::ServiceConfig) {
    index::routes(config);
    org::routes(config);
    partner::routes(config);
    onboarding::routes(config);
    businesses::routes(config);
    users::routes(config);
    hosted::routes(config);
    vault_proxy::routes(config);
    entities::routes(config);
    webhooks::routes(config);
    integrations::routes(config);
    integrations::routes(config);
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::dev::Service;
    use actix_web::{
        body,
        test,
        App,
    };
    use org::OpenApiExt;
    use rand::distributions::Alphanumeric;
    use rand::Rng;
    use regex::Regex;
    use std::sync::{
        Arc,
        Mutex,
    };

    /// Actix route ordering is important because it's possible to shadow specific route patterns
    /// with more general ones. For example, /widgets/{id} would shadow /widgets/action.
    ///
    /// This test that the routes are ordered correctly by generating example URIs for each route
    /// pattern and checking that the pattern matched for that URI is the same as the pattern used
    /// to generate it.
    ///
    /// Integration tests should theoretically avoid major problems, if the routes are covered by
    /// tests, but incorrect route ordering can also lead to incorrect telemetry, which relies on
    /// the .match_pattern() method. The symptom of this incorrect telemetry is that http.route
    /// doesn't match http.target.
    ///
    /// See https://github.com/actix/actix-web/issues/3346
    ///
    /// Because the Actix route matcher is unaware of Guards, including HTTP method guards, this
    /// has a side effect of enforcing that routes with the same URL structure but different
    /// methods have identical patterns.
    #[actix_rt::test]
    async fn test_route_ordering() {
        // We'll insert the test cases here, one per route.
        let uri_to_pattern = Arc::new(Mutex::new(Vec::<(String, String)>::new()));

        let app = test::init_service(
            App::new()
                .wrap_api()
                .configure(configure)
                .with_json_spec_v3_at("api-spec-v3")
                .wrap_fn({
                    // We can only access the resource map that contains the route resolver with
                    // access to a request, so our tests go in the test server's middleware.
                    let uri_to_pattern = uri_to_pattern.clone();
                    move |req, srv| {
                        for (uri, expected_pattern) in uri_to_pattern.lock().unwrap().iter() {
                            let matched_pattern = req
                                .resource_map()
                                .match_pattern(uri)
                                .unwrap_or_else(|| panic!("No pattern found for URI {}", uri));
                            let matched_pattern_name = req
                                .resource_map()
                                .match_name(uri)
                                .unwrap_or_else(|| panic!("No pattern found for URI {}", uri));

                            if *expected_pattern != matched_pattern {
                                panic!(
                                    "Unexpected matching pattern for URI {}\nExpected: {}\nGot: {} (name: {}).\nEnsure specific route patterns are ordered before general ones. If there are APIs with two or more HTTP methods supported for the same URI structure, ensure the slug patterns match.",
                                    uri, expected_pattern, matched_pattern, matched_pattern_name
                                );
                            }
                        }
                        srv.call(req)
                    }
                })
                .build(),
        )
        .await;

        // Fetch the API spec to build the test cases, one per route.
        let req = test::TestRequest::get().uri("/api-spec-v3").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let spec_json = body::to_bytes(resp.into_body()).await.unwrap().to_vec();
        let spec: openapiv3::OpenAPI = serde_json::from_slice(&spec_json).unwrap();

        // Generate example URIs for each route pattern.
        let slug_pattern = Regex::new(r"\{[^}:]+(:(?<slug_regex>[^}]+))?\}").unwrap();
        for path in spec.paths {
            let path_pattern = path.0;

            let mut replacements = vec![];
            for capture in slug_pattern.captures_iter(&path_pattern) {
                let example_slug = if let Some(slug_regex) = capture.name("slug_regex") {
                    let gen = rand_regex::Regex::compile(slug_regex.as_str(), 32).unwrap();
                    rand::thread_rng().sample::<String, _>(&gen)
                } else {
                    rand::thread_rng()
                        .sample_iter(&Alphanumeric)
                        .take(8)
                        .map(char::from)
                        .collect()
                };

                let match_range = capture.get(0).unwrap().range();
                replacements.push((match_range, example_slug));
            }

            let mut example_path = path_pattern.clone();
            for (range, replacement) in replacements.into_iter().rev() {
                example_path.replace_range(range, &replacement);
            }

            uri_to_pattern.lock().unwrap().push((example_path, path_pattern));
        }

        // Now that we've created the test cases, refetch any URL to trigger the test in the
        // middleware.
        let req = test::TestRequest::get().uri("/").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
}

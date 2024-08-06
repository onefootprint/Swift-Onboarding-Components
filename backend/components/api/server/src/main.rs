#![warn(clippy::unwrap_used)]
#![warn(clippy::expect_used)]

use actix_web::dev::Service;
use actix_web::http::KeepAlive;
use actix_web::HttpMessage;
use api_core::config::Config;
use api_core::utils::timeouts::ResponseDeadline;
use api_core::*;
use clap::Parser;
use clap::Subcommand;
use std::time::Duration;
mod custom_migrations;
use actix_web_opentelemetry::RequestMetricsBuilder;
use anyhow::Context;
use anyhow::Result;
use paperclip::v2::models::DefaultApiRaw;
use paperclip::v2::models::Info;
use paperclip::v2::models::Tag;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[command(subcommand)]
    command: Option<Command>,
}
#[derive(Subcommand)]
enum Command {
    ApiServer,
    // Cron jobs
    CreateOverdueWatchlistCheckTasks(commands::CreateOverdueWatchlistCheckTasks),
    GenerateInvoices(commands::GenerateInvoices),
    // Workers
    ExecuteTasks(commands::ExecuteTasks),
    VaultDrWorker(commands::VaultDrWorker),
}

#[allow(clippy::expect_used)]
fn main() -> Result<()> {
    let config = config::Config::load_from_env().with_context(|| "failed to load config")?;

    std::env::set_var("RUST_BACKTRACE", "full");

    let runtime = tokio::runtime::Builder::new_multi_thread().enable_all().build()?;
    runtime.block_on(async move { run(config).await })
}

async fn run(config: Config) -> Result<()> {
    // telemetry
    let _controller = telemetry::init(&config).with_context(|| "failed to init telemetry layers")?;

    let args = Args::parse();
    let is_api_server = matches!(args.command, None | Some(Command::ApiServer));
    let state: State = State::init_or_die(config.clone(), is_api_server).await;

    match args.command {
        None | Some(Command::ApiServer) => run_api_server(config, state).await?,
        Some(Command::CreateOverdueWatchlistCheckTasks(subcommand)) => subcommand.run(config, state).await?,
        Some(Command::GenerateInvoices(subcommand)) => subcommand.run(config, state).await?,
        Some(Command::ExecuteTasks(subcommand)) => subcommand.run(config, state).await?,
        Some(Command::VaultDrWorker(subcommand)) => subcommand.run(config, state).await?,
    };

    telemetry::shutdown();
    Ok(())
}

#[allow(clippy::expect_used)]
async fn run_api_server(config: Config, state: State) -> Result<(), std::io::Error> {
    // run custom migrations if needed
    custom_migrations::run(&state)
        .await
        .expect("failed to run custom migrations");

    log::info!("starting server on port {}", config.port);

    // Export metrics
    let meter = opentelemetry_api::global::meter("actix_web");
    let request_metrics = RequestMetricsBuilder::new().build(meter);

    HttpServer::new(move || {
        let cors: actix_cors::Cors = actix_cors::Cors::default()
            .allow_any_origin()
            .allow_any_header()
            .allow_any_method()
            .supports_credentials()
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT"])
            .max_age(3600);

        // custom `Json` extractor configuration
        let json_cfg = web::JsonConfig::default()
            // limit request payload size
            .limit(32_768)
            // accept any content type
            .content_type(|_| true)
            // use custom error handler
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(FpError::from(err))));

        let query_cfg = web::QueryConfig::default()
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(ApiCoreError::InvalidQueryParam(err))));

        let form_cfg = web::FormConfig::default()
            .limit(32_768)
            .error_handler(|err, _req| actix_web::Error::from(ApiError::from(ApiCoreError::InvalidFormError(err))));


        let  spec = DefaultApiRaw {
            swagger: paperclip::v2::models::Version::V2,
            host: Some("api.onefootprint.com".to_string()),
            info: Info {
                version: crate::GIT_HASH.to_string(),
                title: "Footprint API".into(),
                ..Default::default()
            },
            tags: vec![
                Tag {
                    name: "PublicApi".to_string(),
                    ..Default::default()
                },
                Tag {
                    name: "Preview".to_string(),
                    ..Default::default()
                }
            ],
            ..Default::default()
        };

        App::new()
            .app_data(web::Data::new(state.clone()))
            .wrap_fn(|req, srv| {
                // Set a timeout slightly below the ALB timeout to ensure that the API server
                // generates its own timeouts in most cases. Otherwise, the ALB will return a 504
                // to the client but the API server will continue processing the request,
                // potentially yielding a different status code.

                let timeout = Duration::from_secs(58);
                let deadline = ResponseDeadline::from_timeout(timeout);
                req.extensions_mut().insert(deadline);

                let fut = srv.call(req);
                let fut_with_timeout = actix_web::rt::time::timeout(timeout, fut);
                async {
                    match fut_with_timeout.await {
                        Ok(res) => res,
                        Err(_) => {
                            Err(ApiError::from(ApiCoreError::ResponseTimeout).into())
                        }
                    }
                }
            })
            .wrap(request_metrics.clone()) // Export otel metrics for each API request
            // TODO also wrap RequestTracing::new()
            .wrap(actix_web::middleware::NormalizePath::trim())
            .wrap(Logger::default())
            .wrap(TracingLogger::<TelemetrySpanBuilder>::new())
            .wrap(
                actix_web::middleware::DefaultHeaders::new()
                    .add(("X-Footprint-Server-Version", GIT_HASH.to_string())),
            )
            .wrap(cors)
            .app_data(json_cfg)
            .app_data(query_cfg)
            .app_data(form_cfg)
            // exclude from openapi spec generation
            .configure(api_route_private_root::configure)
            .configure(api_route_private_protected::configure)
            .wrap_api_with_spec(spec)
            .configure(api_routes_root::configure)
            .with_json_spec_at("docs-spec")
            .with_json_spec_v3_at("docs-spec-v3")
            .with_rapidoc_at("docs-ui")
            .default_service(actix_web::web::to(default_not_found))
            .build()
    })
    // Our loadbalancer has a keep alive idle timeout of 60s. To make sure that the target doesn't
    // time out while the loadbalancer is waiting for a response, increase the keep alive timeout
    // https://linear.app/footprint/issue/FP-3633/diagnose-502s
    .keep_alive(KeepAlive::Timeout(std::time::Duration::from_secs(120)))
    .shutdown_timeout(30)
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

async fn default_not_found() -> impl actix_web::Responder {
    ApiError::from(ApiCoreError::EndpointNotFound).error_response()
}

#[allow(unused)]
#[allow(clippy::expect_used)]
#[tracing::instrument(skip(config))]
async fn socure_reason_code_check(config: &Config) {
    let socure_client = SocureClient::new(config.socure_config.production_api_key.clone(), false)
        .expect("failed to build socure certification client");

    tracing::info!("[Socure Reason Code check] Beginning check");
    match query_socure_reason_code_endpoint_and_compare_against_enum(&socure_client).await {
        Ok(reason_code_discrepancies) => {
            if reason_code_discrepancies.missing_reason_codes.is_empty()
                && reason_code_discrepancies
                    .differing_description_reason_codes
                    .is_empty()
            {
                tracing::info!("[Socure Reason Code check] no discrepancies between latest API response and defined enum detected");
            } else {
                tracing::warn!(reason_code_discrepancies = format!("{:?}", reason_code_discrepancies), "[Socure Reason Code check] found discrepancies between latest API response and defined enum");
            }
        }
        Err(err) => tracing::warn!(error=?err, "[Socure Reason Code check] Error"),
    }
}

use anyhow::bail;
use api_wire_types::LiteUser;
use api_wire_types::User;
use clap::Parser;
use clap::Subcommand;
use client::ApiClient;
use data::BacktestData;
use data::BacktestUser;
use newtypes::OnboardingStatus;
use progress::Progress;
use progress::ProgressRow;
use progress::ProgressSaver;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;
mod client;
mod data;
mod progress;
use reqwest::Method as M;
use tokio::sync::Semaphore;

#[derive(Parser)]
#[command(name = "Footprint Avis Migration")]
struct Cli {
    /// api key to use
    #[arg(long)]
    api_key: String,

    /// api key to use
    #[arg(long, default_value = "https://api.onefootprint.com")]
    api_url: String,

    /// concurrent workers
    #[arg(short, long, default_value = "100")]
    batch: usize,

    /// limit
    #[arg(short, long)]
    limit: Option<usize>,

    #[arg(long)]
    data_file: String,

    #[arg(long)]
    progress_file: String,

    #[arg(long, default_value = "false")]
    only_errored_users: bool,

    #[arg(long)]
    run_file: Option<String>,

    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    Vault,
    CheckVault,
    CheckLocal,
    Kyc {
        #[arg(long)]
        playbook_key: String,
    },
    Tag,
}

static _KYC_PERMITS: Semaphore = Semaphore::const_new(100);

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let api = ApiClient::new(cli.api_key, cli.api_url)?;
    let data = data::parse_backtest_data(&cli.data_file)?;
    println!("Num users {}", data.users.len());

    let progress = Progress::load(&cli.progress_file)?;
    println!("Num completed {}", progress.0.rows.lock().await.len());

    match cli.command {
        Command::Vault => {
            process_many(
                progress,
                cli.run_file,
                cli.batch,
                cli.limit,
                data,
                api,
                (),
                vault_user,
            )
            .await
        }
        Command::CheckVault => {
            process_many(
                progress,
                cli.run_file,
                cli.batch,
                cli.limit,
                data,
                api,
                (),
                check_vault_completed,
            )
            .await
        }
        Command::CheckLocal => check_local(data, &cli.progress_file),
        Command::Kyc { playbook_key } => {
            process_many(
                progress,
                cli.run_file,
                cli.batch,
                cli.limit,
                data,
                api,
                playbook_key,
                kyc_user,
            )
            .await
        }
        Command::Tag => {
            process_many(
                progress,
                cli.run_file,
                cli.batch,
                cli.limit,
                data,
                api,
                (),
                tag_user,
            )
            .await
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn process_many<A, F, Fut>(
    progress: (Progress, ProgressSaver),
    run_file: Option<String>,
    batch: usize,
    limit: Option<usize>,
    data: BacktestData,
    api: ApiClient,
    args: A,
    process: F,
) -> anyhow::Result<()>
where
    F: Fn(ApiClient, BacktestUser, Progress, A) -> Fut + Copy,
    A: Clone + Send + Sync,
    Fut: std::future::Future<Output = anyhow::Result<()>>,
{
    let (progress, saver) = progress;
    let completed = progress.get_completed().await;

    let user_ids: Vec<String> = if let Some(run_file) = run_file {
        let rows = Progress::load_data(&run_file)?;
        rows.into_iter().map(|r| r.external_id).collect()
    } else {
        data.ids.into_iter().collect()
    };

    let users = user_ids
        .iter()
        .map(|id| data.users.get(id).cloned().unwrap())
        .filter(|user| !completed.contains_key(&user.external_id))
        .take(limit.unwrap_or(user_ids.len()))
        .collect::<Vec<_>>();

    println!("Num to process: {}", users.len());

    type TaskQueue = deadqueue::limited::Queue<BacktestUser>;

    let queue = Arc::new(TaskQueue::new(users.len()));
    for user in users {
        queue.push(user).await;
    }
    println!("created queue");

    let futs = std::iter::repeat(()).take(batch).map(|_| {
        let api = api.clone();
        let queue = queue.clone();
        let progress = progress.clone();
        let args = args.clone();

        async move {
            while let Some(user) = { queue.try_pop() } {
                if let Err(e) = process(api.clone(), user.clone(), progress.clone(), args.clone()).await {
                    println!("process error: {:?}", e);
                    queue.push(user).await;
                    continue;
                }
            }
        }
    });
    let process_handle = saver.process();
    let futs = futures::future::join_all(futs);
    let _ = futures::future::join(futs, process_handle).await;
    Ok(())
}

async fn vault_user(api: ApiClient, user: BacktestUser, progress: Progress, _args: ()) -> anyhow::Result<()> {
    // create if not exists
    let res = api
        .call(
            "users",
            M::POST,
            None::<()>,
            vec![("x-external-id", user.external_id.clone())],
        )
        .await?;
    let res: LiteUser = res.json().await?;
    let fp_id = res.id;

    // vault data
    let data: serde_json::Value = json!({
        "id.email": user.email,
        "id.first_name": user.first_name,
        "id.last_name": user.last_name,
        "id.dob": user.dob,
        "id.address_line1": user.address_line1,
        "id.city": user.city,
        "id.state": user.state,
        "id.country": user.country,
        "id.zip": user.zip,
        "id.drivers_license_number": user.drivers_license_number,
        "id.drivers_license_state": user.drivers_license_state,
        "custom.drivers_license_number": user.drivers_license_number,
        "custom.drivers_license_state": user.drivers_license_state,
    });
    let res: reqwest::Response = api
        .call(format!("users/{fp_id}/vault"), M::PATCH, Some(data), vec![])
        .await?;


    let error = if res.status() == 400 {
        #[derive(serde::Deserialize)]
        struct Error {
            message: String,
            context: HashMap<String, String>,
        }
        let res: Error = res.json().await?;

        Some(format!(
            "{}: {}",
            res.message,
            res.context
                .iter()
                .map(|(k, v)| format!("{}: {}", k, v))
                .collect::<Vec<_>>()
                .join(" | ")
        ))
    } else if res.status().is_success() {
        None
    } else {
        bail!("server error: {:?}", res.text().await?)
    };

    progress.save(ProgressRow {
        external_id: user.external_id,
        fp_id,
        error,
    })?;

    Ok(())
}

fn check_local(data: BacktestData, progress_file: &str) -> anyhow::Result<()> {
    let completed = Progress::load_data(progress_file)?
        .into_iter()
        .map(|r| r.external_id)
        .collect::<HashSet<_>>();
    println!("completed: {:?}", completed.len());

    let ids: HashSet<String> = HashSet::from_iter(data.ids);
    let missing: Vec<_> = ids.difference(&completed).collect();

    let data = json!({"missing": missing});
    println!("missing: {:?}", serde_json::to_string_pretty(&data).unwrap());
    Ok(())
}

async fn check_vault_completed(
    api: ApiClient,
    user: BacktestUser,
    progress: Progress,
    _args: (),
) -> anyhow::Result<()> {
    let res = api
        .call(
            format!("users?external_id={}", user.external_id),
            M::GET,
            None::<()>,
            vec![],
        )
        .await?;

    #[derive(serde::Deserialize)]
    struct Data {
        data: Vec<LiteUser>,
    }
    let res: Data = res.json().await?;
    if res.data.is_empty() {
        return Ok(());
    }
    let fp_id = &res.data[0].id;

    let res = api
        .call(format!("users/{}/vault", fp_id), M::GET, None::<()>, vec![])
        .await?;

    let res: HashMap<String, bool> = res.json().await?;

    let keys = vec![
        "id.first_name",
        "id.last_name",
        "id.dob",
        "id.address_line1",
        "id.city",
        "id.state",
        "id.country",
        "id.zip",
        "id.drivers_license_number",
        "id.drivers_license_state",
        "custom.drivers_license_number",
        "custom.drivers_license_state",
    ];

    for key in keys {
        if !res.get(key).unwrap_or(&false) {
            progress.save(ProgressRow {
                external_id: user.external_id,
                fp_id: fp_id.clone(),
                error: Some(format!("missing key {}", key)),
            })?;
            return Ok(());
        }
    }

    progress.save(ProgressRow {
        external_id: user.external_id,
        fp_id: fp_id.clone(),
        error: None,
    })?;
    Ok(())
}

async fn kyc_user(
    api: ApiClient,
    user: BacktestUser,
    progress: Progress,
    playbook_key: String,
) -> anyhow::Result<()> {
    let res: reqwest::Response = api
        .call(
            format!("users?external_id={}", user.external_id),
            M::GET,
            None::<()>,
            vec![],
        )
        .await?;

    #[derive(serde::Deserialize)]
    struct Data<T> {
        data: Vec<T>,
    }
    if !res.status().is_success() {
        bail!("error resolving fp_id: {:?}", res.text().await?);
    }

    let res: Data<LiteUser> = res.json().await?;
    if res.data.is_empty() {
        return Ok(());
    }
    let fp_id = res.data[0].id.clone();

    // check if the user already ran kyc
    let res: reqwest::Response = api
        .call(format!("users/{fp_id}"), M::GET, None::<()>, vec![])
        .await?;

    if !res.status().is_success() {
        bail!("error getting user status: {:?}", res.text().await?);
    }

    let res: User = res.json().await?;

    if matches!(res.status, OnboardingStatus::Pass | OnboardingStatus::Fail) {
        progress.save(ProgressRow {
            external_id: user.external_id,
            fp_id: fp_id.clone(),
            error: Some(format!("{}|{}", res.status, res.requires_manual_review)),
        })?;
        return Ok(());
    }

    // run kyc
    // let _permit = KYC_PERMITS.acquire().await.unwrap();

    let res = api
        .call(
            format!("users/{fp_id}/kyc"),
            M::POST,
            Some(json!({
                "key": playbook_key
            })),
            vec![],
        )
        .await?;

    let error = if res.status().is_success() {
        #[derive(serde::Deserialize)]
        struct Response {
            status: String,
            requires_manual_review: bool,
        }
        let res: Response = res.json().await?;

        Some(format!("{}|{}", res.status, res.requires_manual_review))
    } else if res.status().as_u16() >= 400 && res.status().as_u16() < 500 {
        Some(res.text().await?)
    } else {
        bail!("server error: {:?}", res.text().await?)
    };

    progress.save(ProgressRow {
        external_id: user.external_id,
        fp_id: fp_id.clone(),
        error,
    })?;

    Ok(())
}

async fn tag_user(api: ApiClient, user: BacktestUser, progress: Progress, _args: ()) -> anyhow::Result<()> {
    let res: reqwest::Response = api
        .call(
            format!("users?external_id={}", user.external_id),
            M::GET,
            None::<()>,
            vec![],
        )
        .await?;

    #[derive(serde::Deserialize)]
    struct Data<T> {
        data: Vec<T>,
    }
    if !res.status().is_success() {
        bail!("error resolving fp_id: {:?}", res.text().await?);
    }

    let res: Data<LiteUser> = res.json().await?;
    if res.data.is_empty() {
        return Ok(());
    }
    let fp_id = res.data[0].id.clone();

    let futs = [
        ("damage", user.damage),
        ("chargeback", user.chargeback),
        ("stolen", user.stolen),
        ("payment_failed", user.payment_failed),
        ("any_fail", user.any_fail),
    ]
    .iter()
    .filter(|(_, v)| *v)
    .map(|(k, _)| k)
    .map(|tag| {
        api.call(
            format!("users/{fp_id}/tags"),
            M::POST,
            Some(json!({
                "tag": tag
            })),
            vec![],
        )
    })
    .collect::<Vec<_>>();

    let futs = futures::future::join_all(futs)
        .await
        .into_iter()
        .collect::<Result<Vec<_>, _>>()?;

    if !futs.is_empty() {
        println!("tagged user: {:?}<=>{:?}", user.external_id, fp_id);
    }

    if let Some(f) = futs.into_iter().find(|f| !f.status().is_success()) {
        bail!("failed to tag user: {:?}", f.text().await?);
    }

    progress.save(ProgressRow {
        external_id: user.external_id,
        fp_id: fp_id.clone(),
        error: None,
    })?;

    Ok(())
}

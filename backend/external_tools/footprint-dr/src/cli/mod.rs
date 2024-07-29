use anyhow::Context;
use anyhow::Result;
use clap::ArgGroup;
use clap::Args;
use clap::CommandFactory;
use clap::Parser;
use clap::{
    self,
};
use log::debug;
use reqwest::Url;
use std::io;
use std::io::Write;
use std::path::PathBuf;

mod age;
mod api_client;
mod decrypt;
mod enroll;
mod get_external_id;
mod list_records;
mod list_vaults;
mod login;
mod s3_client;
mod status;
mod wire_types;

const SANDBOX_GROUP: &str = "sandbox or live";
const VAULT_SELECTOR_GROUP: &str = "vault selector";
const RECORD_SELECTOR_GROUP: &str = "record selector";
const PAGINATION_OR_SAMPLE_GROUP: &str = "pagination or sample";
const NUMBER_OF_VAULTS_GROUP: &str = "number of vaults";
const BUCKET_NAMESPACE_GROUP: &str = "bucket namespace";

#[derive(Parser, Debug)]
#[command(version, about, disable_help_subcommand = true, disable_help_flag = true)]
struct Command {
    /// Footprint API endpoint
    #[arg(
        long,
        default_value = "https://api.onefootprint.com",
        hide = true,
        env = "FOOTPRINT_API_ROOT"
    )]
    api_root: String,

    #[command(subcommand)]
    subcommand: Option<Subcommand>,

    /// Print help
    #[clap(short, long, action = clap::ArgAction::HelpLong, global = true)]
    // Using a custom help command to force the long help message.
    // The default behavior prints short help for -h and long help for --help, which is strange.
    help: Option<bool>,
}

// Clap doesn't support making a global mutually exclusive group, so we have to embed it on all
// subcommands.
#[derive(Args, Debug)]
#[clap(group = ArgGroup::new(SANDBOX_GROUP).required(true))]
struct SandboxFlags {
    /// Use the live environment for the authenticated organization
    #[arg(long, global = true, group = SANDBOX_GROUP)]
    live: bool,

    /// Use the sandbox environment for the authenticated organization
    #[arg(long, global = true, group = SANDBOX_GROUP)]
    sandbox: bool,
}

#[derive(clap::Subcommand, Debug)]
enum Subcommand {
    /// Authenticate the CLI with Footprint
    Login {
        #[clap(flatten)]
        sandbox: SandboxFlags,
    },
    /// Fetch the external ID used for cross-account IAM setup
    GetExternalId {
        #[clap(flatten)]
        sandbox: SandboxFlags,
    },
    /// Enroll the authenticated Footprint organization in Vault Disaster Recovery
    Enroll {
        #[clap(flatten)]
        sandbox: SandboxFlags,
    },
    /// Check the current status of Vault Disaster Recovery backups
    Status {
        #[clap(flatten)]
        sandbox: SandboxFlags,
    },
    /// List vaults
    ListVaults {
        #[clap(flatten)]
        sandbox: SandboxFlags,

        #[clap(flatten)]
        bucket_namespace: BucketNamespace,

        #[clap(flatten)]
        vault_filter: VaultSelector,
    },
    /// List vault records
    ListRecords {
        #[clap(flatten)]
        sandbox: SandboxFlags,

        #[clap(flatten)]
        bucket_namespace: BucketNamespace,

        #[clap(flatten)]
        vault_filter: VaultSelector,

        /// List of FP IDs
        #[arg(name = "FP ID", group = VAULT_SELECTOR_GROUP, group = NUMBER_OF_VAULTS_GROUP)]
        fp_ids: Vec<String>,
    },
    /// Decrypt vault records from the Disaster Recovery backups
    ///
    /// Requires the --org-identity flag, pointing to an age identity file for the org private key.
    /// For an org private key on a YubiKey, this is a file from a command like the following:
    ///     age-plugin-yubikey --identity --slot 1 > org-identity.txt
    ///
    /// Test recovery:
    ///     If the --wrapped-recovery-key flag is not provided, the CLI will run a test recovery.
    ///     This is supported by online Footprint services, and will generate audit logs for all
    ///     decryptions.
    ///
    /// Full recovery:
    ///     If the --wrapped-recovery-key flag is provided, the CLI will decrypt the records
    ///     in the cloud storage bucket without relying on Footprint services.
    ///
    ///     To perform a full recovery without depending on the Footprint API, provide the --bucket
    ///     and --namespace flags using the details from the enrollment process.
    #[command(verbatim_doc_comment)]
    #[command(group = ArgGroup::new(RECORD_SELECTOR_GROUP).required(true))]
    Decrypt {
        #[clap(flatten)]
        sandbox: SandboxFlags,

        #[clap(flatten)]
        bucket_namespace: BucketNamespace,

        /// Decrypt all records
        #[arg(long, group = RECORD_SELECTOR_GROUP)]
        all: bool,

        /// Decrypt records from the given line-separated JSON file (.jsonl)
        #[arg(long, value_name = "PATH", group = RECORD_SELECTOR_GROUP)]
        records: Option<PathBuf>,

        /// Path to an age identity file for the org private key
        #[arg(long, value_name = "PATH")]
        org_identity: PathBuf,

        /// Path to the wrapped recovery key file (.age)
        #[arg(long, value_name = "PATH")]
        wrapped_recovery_key: Option<PathBuf>,

        /// Output directory for decrypted records
        #[arg(long, value_name = "PATH")]
        output_dir: PathBuf,

        /// Concurrency limit for decryption operations (defaults to the number of CPUs)
        #[arg(long)]
        concurrency_limit: Option<usize>,
    },
}

#[derive(Args, Debug)]
#[command(group = ArgGroup::new(PAGINATION_OR_SAMPLE_GROUP).requires("limit"))]
struct VaultSelector {
    /// Begin paginating over vaults after this FP ID
    #[arg(
        long,
        group = VAULT_SELECTOR_GROUP,
        group = PAGINATION_OR_SAMPLE_GROUP,
        value_name = "FP ID"
    )]
    fp_id_gt: Option<String>,

    /// Randomly sample vaults
    #[arg(long, group = VAULT_SELECTOR_GROUP, group = PAGINATION_OR_SAMPLE_GROUP)]
    sample: bool,

    /// The maximum number of vaults to list
    #[arg(
        short = 'n',
        long,
        group = NUMBER_OF_VAULTS_GROUP,
        value_name = "COUNT",
    )]
    // We use a rather small u16 instead of a usize because S3 API sizes are i32.
    limit: Option<u16>,
}

#[derive(Args, Debug)]
#[command(group = ArgGroup::new(BUCKET_NAMESPACE_GROUP).multiple(true).requires_all(["bucket", "namespace"]))]
struct BucketNamespace {
    /// Bucket where encrypted data is stored (only required if bypassing dependency on
    /// Footprint API)
    #[arg(
        long,
        group = BUCKET_NAMESPACE_GROUP,
    )]
    bucket: Option<String>,

    /// Bucket namespace assigned during enrollment (only required if bypassing dependency on
    /// Footprint API)
    #[arg(
        long,
        group = BUCKET_NAMESPACE_GROUP,
    )]
    namespace: Option<String>,
}

pub async fn run() -> Result<()> {
    env_logger::Builder::from_env("LOG_LEVEL").init();

    let cmd = Command::parse();

    let api_root = Url::parse(&cmd.api_root).with_context(|| "Invalid API root URL")?;
    debug!("Footprint API endpoint: \"{}\"", api_root);

    let Some(subcommand) = cmd.subcommand else {
        Command::command().print_help()?;
        std::process::exit(1);
    };

    match subcommand {
        Subcommand::Login { sandbox } => login::login_cmd(api_root, sandbox.live.into()).await,
        Subcommand::Status { sandbox } => status::status_cmd(api_root, sandbox.live.into()).await,
        Subcommand::GetExternalId { sandbox } => {
            get_external_id::get_external_id_cmd(api_root, sandbox.live.into()).await
        }
        Subcommand::Enroll { sandbox } => enroll::enroll_cmd(api_root, sandbox.live.into()).await,
        Subcommand::ListVaults {
            sandbox,
            bucket_namespace,
            vault_filter,
        } => {
            list_vaults::list_vaults_cmd(api_root, sandbox.live.into(), bucket_namespace, vault_filter).await
        }
        Subcommand::ListRecords {
            sandbox,
            bucket_namespace,
            vault_filter,
            fp_ids,
        } => {
            list_records::list_records_cmd(
                api_root,
                sandbox.live.into(),
                bucket_namespace,
                vault_filter,
                fp_ids,
            )
            .await
        }
        Subcommand::Decrypt {
            sandbox,
            bucket_namespace,
            all,
            records,
            org_identity,
            wrapped_recovery_key,
            output_dir,
            concurrency_limit,
        } => {
            decrypt::decrypt_cmd(
                api_root,
                sandbox.live.into(),
                bucket_namespace,
                all,
                records,
                org_identity,
                wrapped_recovery_key,
                output_dir,
                concurrency_limit,
            )
            .await
        }
    }
}

pub(crate) fn get_input(prompt: &str) -> Result<String> {
    print!("{}", prompt);
    io::stdout().flush()?;

    let mut answer = String::new();
    io::stdin().read_line(&mut answer)?;
    Ok(answer.trim().to_string())
}

pub(crate) fn confirm(prompt: &str) -> Result<bool> {
    let answer = get_input(&format!("{} [y/n] ", prompt))?;
    match answer.to_lowercase().as_str() {
        "y" | "yes" => Ok(true),
        "n" | "no" => Ok(false),
        _ => {
            println!("Please choose \"y\" (yes) or \"n\" (no).");
            confirm(prompt)
        }
    }
}

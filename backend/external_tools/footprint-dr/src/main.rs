use clap::{
    ArgGroup,
    Args,
    Parser,
    Subcommand,
};
use log::debug;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(version, about, disable_help_subcommand = true, disable_help_flag = true)]
struct Command {
    /// Footprint API endpoint
    #[arg(
        long,
        default_value = "https://api.onefootprint.com",
        hide = true,
        env = "FOOTPRINT_API"
    )]
    api: String,

    #[command(subcommand)]
    subcommand: Option<SubCommand>,

    /// Print help
    #[clap(short, long, action = clap::ArgAction::HelpLong, global = true)]
    // Using a custom help command to force the long help message.
    // The default behavior prints short help for -h and long help for --help, which is strange.
    help: Option<bool>,
}

const VAULT_SELECTOR_GROUP: &str = "vault selector";
const RECORD_SELECTOR_GROUP: &str = "record selector";
const PAGINATION_OR_SAMPLE_GROUP: &str = "pagination or sample";
const NUMBER_OF_VAULTS_GROUP: &str = "number of vaults";

#[derive(Subcommand, Debug)]
enum SubCommand {
    /// Authenticate the CLI with Footprint
    Login,
    /// Fetch the external ID used for cross-account IAM setup
    GetExternalId {
        #[clap(flatten)]
        sandbox: SandboxFlag,
    },
    /// Enroll the authenticated Footprint organization in Vault Disaster Recovery
    Enroll {
        #[clap(flatten)]
        sandbox: SandboxFlag,
    },
    /// Check the current status of Vault Disaster Recovery backups
    Status {
        #[clap(flatten)]
        sandbox: SandboxFlag,
    },
    /// List vaults
    ListVaults {
        #[clap(flatten)]
        sandbox: SandboxFlag,

        /// List all vaults
        #[arg(long, group = VAULT_SELECTOR_GROUP, group = NUMBER_OF_VAULTS_GROUP)]
        all: bool,

        #[clap(flatten)]
        vault_filter: VaultSelector,
    },
    /// List vault records
    ListRecords {
        #[clap(flatten)]
        sandbox: SandboxFlag,

        /// List all vault records
        #[arg(long, group = VAULT_SELECTOR_GROUP, group = NUMBER_OF_VAULTS_GROUP)]
        all: bool,

        #[clap(flatten)]
        vault_filter: VaultSelector,

        /// List of FP IDs
        #[arg(name = "FP ID", group = VAULT_SELECTOR_GROUP, group = NUMBER_OF_VAULTS_GROUP)]
        fp_ids: Vec<String>,
    },
    /// Decrypt vault records from the Disaster Recovery backups
    ///
    /// Requires the --org-private-key-plugin flag, pointing to an executable that emits the org
    /// private key to stdout.
    ///
    /// Test recovery:
    ///     If the --wrapped-recovery-key flag is not provided, the CLI will run a test recovery.
    ///     This is supported by online Footprint services, and will generate audit logs for all
    ///     decryptions.
    ///
    /// Full recovery:
    ///     If the --wrapped-recovery-key flag is provided, the CLI will decrypt the records
    ///     in the cloud storage bucket without relying on Footprint services.
    #[command(verbatim_doc_comment)]
    #[command(group = ArgGroup::new(RECORD_SELECTOR_GROUP).required(true))]
    Decrypt {
        #[clap(flatten)]
        sandbox: SandboxFlag,

        /// Decrypt all records
        #[arg(long, group = RECORD_SELECTOR_GROUP)]
        all: bool,

        /// Decrypt records from the given line-separated JSON file (.jsonl)
        #[arg(value_name = "path", group = RECORD_SELECTOR_GROUP)]
        records: Option<PathBuf>,

        /// An that emits the organization private key to stdout
        #[arg(long, value_name = "path")]
        org_private_key_plugin: Option<PathBuf>,

        /// Wrapped recovery key file (.age)
        #[arg(long, value_name = "path")]
        wrapped_recovery_key: Option<PathBuf>,
    },
}

#[derive(Args, Debug)]
struct SandboxFlag {
    /// Use the sandbox environment for the authenticated organization.
    #[arg(long)]
    sandbox: bool,
}

#[derive(Args, Debug)]
struct VaultSelector {
    /// Begin paginating over vaults after this FP ID.
    #[arg(
        long,
        group = "vault selector",
        group = PAGINATION_OR_SAMPLE_GROUP,
        value_name = "FP ID"
    )]
    vault_gt: Option<String>,

    /// Randomly sample vaults.
    #[arg(long, group = "vault selector", group = PAGINATION_OR_SAMPLE_GROUP)]
    sample: bool,

    /// The maximum number of vaults to list.
    #[arg(
        short = 'n',
        long,
        group = NUMBER_OF_VAULTS_GROUP,
        value_name = "count",
        default_value = "100"
    )]
    limit: Option<usize>,
}

fn main() {
    env_logger::Builder::from_env("LOG_LEVEL").init();

    let cmd = Command::parse();

    debug!("Footprint API endpoint: \"{}\"", cmd.api);

    match &cmd.subcommand {
        Some(_) => {
            unimplemented!();
        }
        None => {}
    }
}

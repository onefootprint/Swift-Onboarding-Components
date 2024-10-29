use backfill::BackfillArgs;
use clap::Args;
use clap::Parser;
use clap::Subcommand;
use clap::ValueEnum;
use crypto::base64;
use crypto::hex;
use crypto::zeroize::Zeroize;
use export::ExportArgs;
use kyc::KycArgs;
use newtypes::export_reason_codes;
use newtypes::PiiString;
use newtypes::VaultPublicKey;
use stripe_migrate::StripeCardMigrateArgs;
mod backfill;
mod export;
mod kyc;
mod stripe_migrate;
mod util;

#[derive(Parser)]
#[command(name = "Footprint Utility")]
#[command(author = "Footprint <support@onefootprint.com>")]
#[command(version = "1.0")]
#[command(about = "Footprint's command-line client", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Seal data to a footprint public key
    Seal(SealArgs),
    /// Generate a data key sealed to a footprint public key
    GenerateDataKey(GenerateDataKeyArgs),
    /// Export footprint's reason codes in a friendly format
    ExportFootprintReasonCode,
    /// Fetch users and export there results (no pii)
    ExportEntities(ExportArgs),
    /// Backfill vault data for a customer
    Backfill(BackfillArgs),
    /// KYC
    Kyc(KycArgs),
    /// Migrate stripe card data to footprint
    StripeCardMigrate(StripeCardMigrateArgs),
}

#[derive(Args)]
struct SealArgs {
    #[command(flatten)]
    key_in: KeyInArgs,

    #[arg(short, long)]
    /// the contents of the message to seal
    message: String,
}

#[derive(Args)]
struct GenerateDataKeyArgs {
    #[command(flatten)]
    key_in: KeyInArgs,

    #[arg(short = 'n', long)]
    /// the byte-length of the data key to generate
    key_size: usize,
}

#[derive(Args)]
struct KeyInArgs {
    #[arg(long, default_value = "hex")]
    /// byte encoding format of the public key
    inform: Form,
    #[arg(long, default_value = "raw")]
    /// format of the public key
    keyform: KeyForm,
    #[arg(short, long)]
    /// the public key to seal to
    pk: String,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Default)]
enum Form {
    #[default]
    /// hex encoded string
    Hex,
    /// base64 encoded string
    Base64,
    /// base64-url encoded string
    Base64Url,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Default)]
enum KeyForm {
    #[default]
    /// Raw uncompressed EC point
    Raw,

    /// ANS1 DER encoded
    Der,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    pretty_env_logger::init();
    let cli = Cli::parse();
    let out = match cli.command {
        Commands::Seal(args) => {
            let public_key = args.key_in.into_vault_public_key()?;
            let out = public_key.seal_pii(&PiiString::from(args.message))?;
            hex::encode(out)
        }
        Commands::GenerateDataKey(args) => {
            let public_key = args.key_in.into_vault_public_key()?;
            let mut key = crypto::random::gen_rand_bytes(args.key_size);
            let out = public_key.seal_bytes(&key)?;
            key.zeroize(); // ensure this key is gone from memory
            hex::encode(out)
        }
        Commands::ExportFootprintReasonCode => {
            export_reason_codes();
            "export complete!".into()
        }
        Commands::ExportEntities(args) => {
            export::export_entities(args).await?;
            "export complete!".into()
        }
        Commands::Backfill(args) => {
            backfill::backfill(args).await?;
            "Done backfilling".into()
        }
        Commands::Kyc(args) => {
            kyc::kyc(args).await?;
            "Done running kyc".into()
        }
        Commands::StripeCardMigrate(args) => {
            stripe_migrate::run(args).await?;
            "Done migrating stripe card data".into()
        }
    };
    print!("{}", out);
    Ok(())
}

impl KeyInArgs {
    fn into_vault_public_key(self) -> anyhow::Result<VaultPublicKey> {
        let public_key = match self.inform {
            Form::Hex => hex::decode(self.pk)?,
            Form::Base64 => base64::decode(self.pk)?,
            Form::Base64Url => base64::decode_config(self.pk, base64::URL_SAFE_NO_PAD)?,
        };

        Ok(match self.keyform {
            KeyForm::Raw => VaultPublicKey::from_raw_uncompressed(&public_key)?,
            KeyForm::Der => VaultPublicKey::from_der_bytes(&public_key)?,
        })
    }
}

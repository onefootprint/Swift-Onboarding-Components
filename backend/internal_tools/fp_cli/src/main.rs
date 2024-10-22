use anyhow::bail;
use backfill::BackfillArgs;
use clap::Args;
use clap::Parser;
use clap::Subcommand;
use clap::ValueEnum;
use crypto::base64;
use crypto::hex;
use crypto::zeroize::Zeroize;
use kyc::KycArgs;
use newtypes::export_reason_codes;
use newtypes::PiiString;
use newtypes::VaultPublicKey;
mod backfill;
mod kyc;
mod util;
// mod export_entity_results;

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
    ExportEntityResults {
        /// api key to use
        #[arg(long)]
        api_key: String,
        /// page size
        #[arg(short, long, default_value = "64")]
        page_size: usize,
        #[arg(long)]
        out_file: Option<std::path::PathBuf>,
    },
    /// Backfill vault data for a customer
    Backfill(BackfillArgs),
    /// KYC
    Kyc(KycArgs),
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
        Commands::ExportEntityResults { .. } => {
            bail!("not currently supported");
            // let rows = export_entity_results::run(api_key, page_size).await?;
            // if let Some(out_file) = out_file {
            //     let mut writer = csv::Writer::from_path(&out_file)?;
            //     for row in rows {
            //         writer.serialize(row)?;
            //     }
            //     writer.flush()?;
            //     format!("wrote results to {}\n", out_file.to_string_lossy())
            // } else {
            //     let mut writer = csv::WriterBuilder::new().from_writer(vec![]);
            //     for row in rows {
            //         writer.serialize(row)?;
            //     }
            //     writer.flush()?;

            //     String::from_utf8(writer.into_inner()?)?
            // }
        }
        Commands::Backfill(args) => {
            backfill::backfill(args).await?;
            "Done backfilling".into()
        }
        Commands::Kyc(args) => {
            kyc::kyc(args).await?;
            "Done running kyc".into()
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

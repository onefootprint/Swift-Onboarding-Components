use newtypes::secret_api_key::SecretApiKey;
use reqwest::header::HeaderMap;
use reqwest::header::HeaderValue;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::time::Duration;
use tokio::sync::mpsc;
use tokio::sync::mpsc::UnboundedSender;
use tokio::task::JoinHandle;

pub fn api_client(api_key: SecretApiKey) -> anyhow::Result<reqwest::Client> {
    let mut headers = HeaderMap::new();
    let api_key_str = String::from(api_key);
    headers.insert("X-Footprint-Secret-Key", HeaderValue::from_str(&api_key_str)?);
    Ok(reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .default_headers(headers)
        .build()?)
}

pub struct OutputFile {
    tx: UnboundedSender<String>,
    #[allow(unused)]
    file_path: String,
    #[allow(unused)]
    handle: JoinHandle<anyhow::Result<()>>,
}

impl OutputFile {
    pub fn write<S: ToString>(&self, line: S) -> anyhow::Result<()> {
        log::info!("{}", line.to_string());
        self.tx.send(line.to_string())?;
        Ok(())
    }
}

pub async fn output_file(file: Option<String>) -> anyhow::Result<OutputFile> {
    let path_str = file.unwrap_or_else(|| {
        format!(
            "fp_cli_out_{}.csv",
            chrono::Local::now().format("%Y-%m-%d_%H-%M-%S")
        )
    });

    let path = PathBuf::from(&path_str);
    if path.exists() {
        log::info!("Output file already exists: {}", path.display());
    } else {
        log::info!("Creating new output file: {}", path.display());
        File::create(&path)?;
    }

    log::info!("Writing output to {}", path.display());

    // open file for append only
    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    let handle = tokio::spawn(async move {
        let mut file = OpenOptions::new().append(true).open(&path)?;
        while let Some(line) = rx.recv().await {
            let line = format!("{}\n", line);
            file.write_all(line.as_bytes())?;
        }
        Ok(())
    });

    Ok(OutputFile {
        tx,
        file_path: path_str,
        handle,
    })
}

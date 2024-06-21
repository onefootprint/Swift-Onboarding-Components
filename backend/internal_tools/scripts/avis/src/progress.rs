use csv::Writer;
use newtypes::FpId;
use std::collections::HashMap;
use std::fs::File;
use std::fs::OpenOptions;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::mpsc::UnboundedReceiver;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

#[derive(Debug, Clone)]
pub struct Progress {
    pub rows: Arc<Mutex<Vec<ProgressRow>>>,
    pub tx: UnboundedSender<ProgressRow>,
}

impl Progress {
    pub async fn get_completed(&self) -> HashMap<String, FpId> {
        self.rows
            .lock()
            .await
            .iter()
            .map(|r| (r.external_id.clone(), r.fp_id.clone()))
            .collect()
    }
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct ProgressRow {
    pub external_id: String,
    pub fp_id: FpId,
    pub error: Option<String>,
}


impl Progress {
    pub fn load(file_path: &str) -> anyhow::Result<(Self, ProgressSaver)> {
        let (tx, rx) = tokio::sync::mpsc::unbounded_channel::<ProgressRow>();

        if !Path::new(file_path).exists() {
            let _ = File::create(file_path)?;
            let writer = csv::WriterBuilder::new().from_path(file_path)?;
            return Ok((
                Progress {
                    rows: Arc::new(Mutex::new(vec![])),
                    tx,
                },
                ProgressSaver { writer, rx },
            ));
        };

        let mut options = OpenOptions::new();
        let file = options.append(true).open(file_path)?;
        let writer = csv::WriterBuilder::new().from_writer(file);

        Ok((
            Progress {
                rows: Arc::new(Mutex::new(Self::load_data(file_path)?)),
                tx,
            },
            ProgressSaver { writer, rx },
        ))
    }

    pub fn load_data(file_path: &str) -> anyhow::Result<Vec<ProgressRow>> {
        if !Path::new(file_path).exists() {
            return Ok(vec![]);
        };

        let mut rdr = csv::ReaderBuilder::new().from_path(file_path)?;
        let rows = rdr.deserialize().collect::<Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    pub fn save(&self, row: ProgressRow) -> anyhow::Result<()> {
        self.tx.send(row)?;
        Ok(())
    }
}


pub struct ProgressSaver {
    writer: Writer<File>,
    rx: UnboundedReceiver<ProgressRow>,
}

impl ProgressSaver {
    pub fn process(mut self) -> JoinHandle<()> {
        tokio::spawn(async move {
            while let Some(row) = self.rx.recv().await {
                self.writer.serialize(&row).unwrap();
                let _ = self
                    .writer
                    .flush()
                    .map_err(|e| println!("failed to flush: {:?}", e));
            }
        })
    }
}

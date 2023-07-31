mod generate_workos_csv;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // setup env variables
    dotenv().ok();
    // genrate workos state csv
    generate_workos_csv::generate().await?;
    Ok(())
}

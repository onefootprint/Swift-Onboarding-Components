#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let pool = db::init("postgresql://localhost/footprint_db")?;
    let tenant = db::test(&pool).await?;
    eprintln!("{:?}", tenant);
    Ok(())
}

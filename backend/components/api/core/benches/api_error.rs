use api_core::errors::ApiResult;
use criterion::{
    criterion_group,
    criterion_main,
    Criterion,
};

fn api_error() -> ApiResult<()> {
    Ok(())
}

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("return api_error", |b| b.iter(api_error));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);

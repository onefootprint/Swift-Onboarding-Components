use api_core::FpResult;
use criterion::criterion_group;
use criterion::criterion_main;
use criterion::Criterion;

fn api_error() -> FpResult<()> {
    Ok(())
}

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("return api_error", |b| b.iter(api_error));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);

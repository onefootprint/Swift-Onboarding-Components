use std::process::Command;
fn main() {
    let output = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .expect("failed to run git");
    let git_hash_out = String::from_utf8(output.stdout).expect("failed to parse git has");
    let hash = git_hash_out.trim();
    if !hash.is_empty() {
        println!("cargo:rustc-env=GIT_HASH={}", hash);
    }
}

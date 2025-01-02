use age::Identity;
use anyhow::anyhow;
use anyhow::bail;
use anyhow::Ok;
use anyhow::Result;
use core::str;
use futures::AsyncReadExt as FuturesAsyncReadExt;
use std::collections::HashMap;
use std::iter;
use std::path::PathBuf;
use std::str::FromStr;
use tokio::io::AsyncReadExt;

pub(crate) async fn read_identities(path: PathBuf) -> Result<Vec<Box<dyn Identity>>> {
    let mut file = tokio::fs::File::open(&path).await?;

    let mut buf = vec![];
    file.read_to_end(&mut buf).await?;

    let identity_file = age::IdentityFile::from_buffer(buf.as_slice())?;
    let identities = identity_file.into_identities()?;
    Ok(identities)
}

pub(crate) async fn unwrap_key(
    wrapped_key: &[u8],
    identities: impl Iterator<Item = &dyn Identity>,
) -> Result<age::x25519::Identity> {
    // The key should be armored, so we can trim whitespace safely.
    let wrapped_key = str::from_utf8(wrapped_key)?.trim().as_bytes();

    let armored_reader = age::armor::ArmoredReader::from_async_reader(wrapped_key);

    let decryptor = age::Decryptor::new_async_buffered(armored_reader).await?;
    if decryptor.is_scrypt() {
        bail!("scrypt-encrypted keys are not supported");
    }

    let mut key = vec![];
    let mut reader = decryptor.decrypt_async(identities)?;
    reader.read_to_end(&mut key).await?;

    let identity = age::x25519::Identity::from_str(&String::from_utf8(key)?).map_err(|err| anyhow!(err))?;
    Ok(identity)
}

pub(crate) trait IdentityForKey: Send {
    fn identity(&self, key: &str) -> Option<&age::x25519::Identity>;
}

impl IdentityForKey for age::x25519::Identity {
    fn identity(&self, _key: &str) -> Option<&age::x25519::Identity> {
        Some(self)
    }
}

impl IdentityForKey for HashMap<String, age::x25519::Identity> {
    fn identity(&self, key: &str) -> Option<&age::x25519::Identity> {
        self.get(key)
    }
}

pub(crate) async fn decrypt(
    e_data: impl futures::AsyncBufRead + Unpin,
    identity: &age::x25519::Identity,
) -> Result<impl futures::AsyncRead> {
    let decryptor = age::Decryptor::new_async_buffered(e_data).await?;
    if decryptor.is_scrypt() {
        bail!("scrypt-encrypted keys are not supported");
    }

    let p_reader = decryptor.decrypt_async(iter::once(identity as &dyn Identity))?;
    Ok(p_reader)
}

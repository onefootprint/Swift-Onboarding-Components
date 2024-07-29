use age::cli_common::UiCallbacks;
use age::plugin::IdentityPluginV1;
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

type HasYubiKeyIdentity = bool;

pub(crate) async fn read_identities(path: PathBuf) -> Result<(Vec<Box<dyn Identity>>, HasYubiKeyIdentity)> {
    let mut file = tokio::fs::File::open(&path).await?;

    let mut buf = vec![];
    file.read_to_end(&mut buf).await?;

    let mut has_yubikey_identity = false;

    let identities = age::IdentityFile::from_buffer(buf.as_slice())?
        .into_identities()
        .into_iter()
        .map(|identity| {
            let identity: Box<dyn Identity> = match identity {
                age::IdentityFileEntry::Native(identity) => Box::new(identity),
                age::IdentityFileEntry::Plugin(identity) => {
                    has_yubikey_identity |= identity.plugin() == "yubikey";

                    Box::new(IdentityPluginV1::new(
                        identity.plugin(),
                        &[identity.clone()],
                        UiCallbacks,
                    )?)
                }
            };
            Ok(identity)
        })
        .collect::<Result<Vec<_>>>()?;

    Ok((identities, has_yubikey_identity))
}

pub(crate) async fn unwrap_key(
    wrapped_key: &[u8],
    identities: impl Iterator<Item = &dyn Identity>,
) -> Result<age::x25519::Identity> {
    // The key should be armored, so we can trim whitespace safely.
    let wrapped_key = str::from_utf8(wrapped_key)?.trim().as_bytes();

    let armored_reader = age::armor::ArmoredReader::from_async_reader(wrapped_key);
    let decryptor = match age::Decryptor::new_async_buffered(armored_reader).await? {
        age::Decryptor::Recipients(d) => d,
        age::Decryptor::Passphrase(_) => bail!("passphrase decryptor type is not supported"),
    };

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
    let decryptor = match age::Decryptor::new_async_buffered(e_data).await? {
        age::Decryptor::Recipients(d) => d,
        age::Decryptor::Passphrase(_) => bail!("passphrase decryptor type is not supported"),
    };

    let p_reader = decryptor.decrypt_async(iter::once(identity as &dyn Identity))?;
    Ok(p_reader)
}

use byteorder::BigEndian;
use byteorder::ReadBytesExt;
use byteorder::WriteBytesExt;
use crypto::base64;
use std::io::Read;
use std::io::Write;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("token type invalid")]
    InvalidTokenType,

    #[error("invalid signature")]
    BadSignature,

    #[error("mismatched context")]
    MismatchedChallengeDigest,

    #[error("blind_rsa error:{0}")]
    BlindRsa(#[from] blind_rsa_signatures::Error),

    #[error("base64 decoding error: {0}")]
    Base64(#[from] base64::DecodeError),

    #[error("io error: {0}")]
    IO(#[from] std::io::Error),
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
}

#[derive(Debug, Clone)]
pub struct TokenChallenge {
    pub issuer_name: String,
    pub redemption_context: [u8; 32],
    pub origin_info: String,
}

/// temporarily hardcoded demo issuer
const ISSUER_NAME: &str = "demo-pat.issuer.cloudflare.com";

/// temporarily hardcoded demo issuer public key
pub const ISSUER_TOKEN_PUBLIC_KEY: &str = "MIIBUjA9BgkqhkiG9w0BAQowMKANMAsGCWCGSAFlAwQCAqEaMBgGCSqGSIb3DQEBCDALBglghkgBZQMEAgKiAwIBMAOCAQ8AMIIBCgKCAQEAmfx9AB3xGHk6MJhEo4QbUEv2ACjOFB8NV3kUuCSCldhSDKw5MNenDdSJGY8o9e4Zjlt249qJraUsstvhS7_6uKVfnf4-F80uUAnFvBkBQw3AmxoUN62VFZEF8JdQVRLobDD8R6Ck6Om4YSBDJ4Rc_F0_1p-aJXfVxb5MVTDGk7OKO00EDviNRP2an-nx67K8b7SgPyf6soZqgkLRg-IX7vJCMcnBNB7nxnCwAW1Og_AbnFjYUtbEgjcn3QJouFeFtQKMgXTqAJvjvGAaVZTgASucZrVmXRXg-zTKVkSmbl298zqooaz1eBAPy4M4SfQtfx-AiHJMjYYdA2NmzJz0qwIDAQAB";

impl TokenChallenge {
    /// create a new token challenge
    pub fn new(origin: String, context: [u8; 32]) -> Self {
        TokenChallenge {
            issuer_name: ISSUER_NAME.to_string(),
            redemption_context: context,
            origin_info: origin,
        }
    }

    /// Marshalls the token to base64 network-byte encoded struct
    /// struct {
    ///     uint16_t token_type;               // 0x0002, in network-byte order
    ///     uint16_t issuer_name_length;       // Issuer name length, in network-byte order
    ///     char issuer_name[];                // Hostname of the token issuer
    ///     uint8_t redemption_context_length; // Redemption context length (0 or 32)
    ///     uint8_t redemption_context[];      // Redemption context, either 0 or 32 bytes3
    ///     uint16_t origin_info_length;       // Origin info length, in network-byte order
    ///     char origin_info[];                // Hostname of your server
    /// } TokenChallenge;
    pub fn marshal_bytes(&self) -> Result<Vec<u8>> {
        let mut result = vec![];

        // token type
        result.write_u16::<BigEndian>(2)?;

        // issuer
        result.write_u16::<BigEndian>(self.issuer_name.len() as u16)?;
        result.extend(self.issuer_name.as_bytes());

        // redemption context
        result.write_u8(32)?;
        result.extend(self.redemption_context);

        // redemption context
        result.write_u16::<BigEndian>(self.origin_info.len() as u16)?;
        result.extend(self.origin_info.as_bytes());

        Ok(result)
    }

    /// marshals the challenge into base64 url safe encoded string
    pub fn marshal(self) -> Result<String> {
        Ok(base64::encode_config(self.marshal_bytes()?, base64::URL_SAFE))
    }
}

/// Privacy Pass Token
pub struct Token {
    pub token_type: u16,
    pub nonce: [u8; 32],
    pub challenge_digest: [u8; 32],
    pub token_key_id: [u8; 32],
    pub authenticator: [u8; 256],
}

impl Token {
    /// unmarshals a Token struct
    ///  struct {
    ///    uint16_t token_type;
    ///    uint8_t nonce[32];
    ///    uint8_t challenge_digest[32];
    ///    uint8_t token_key_id[32];
    ///    uint8_t authenticator[256];
    ///} Token;
    pub fn unmarshal(token: &str) -> Result<Self> {
        let token = base64::decode_config(token, base64::URL_SAFE)?;
        let mut token = std::io::Cursor::new(token);

        let token_type = token.read_u16::<BigEndian>()?;

        let mut nonce = [0u8; 32];
        token.read_exact(&mut nonce)?;

        let mut challenge_digest = [0u8; 32];
        token.read_exact(&mut challenge_digest)?;

        let mut token_key_id = [0u8; 32];
        token.read_exact(&mut token_key_id)?;

        let mut authenticator = [0u8; 256];
        token.read_exact(&mut authenticator)?;

        Ok(Self {
            token_type,
            nonce,
            challenge_digest,
            token_key_id,
            authenticator,
        })
    }

    /// verify the token
    pub fn verify(self, challenge: &TokenChallenge) -> Result<()> {
        let Token {
            token_type,
            nonce,
            challenge_digest,
            token_key_id,
            authenticator,
        } = self;

        if token_type != 2 {
            return Err(Error::InvalidTokenType);
        }

        let expected_challenge_digest = crypto::sha256(&challenge.marshal_bytes()?);

        if challenge_digest != expected_challenge_digest {
            return Err(Error::MismatchedChallengeDigest);
        }

        // compute the message we need to verify
        let message = {
            let mut result = vec![];
            result.write_u16::<BigEndian>(token_type)?;
            result.write_all(&nonce)?;
            result.write_all(&challenge_digest)?;
            result.write_all(&token_key_id)?;
            result
        };

        let issuer_public_key = base64::decode_config(ISSUER_TOKEN_PUBLIC_KEY, base64::URL_SAFE)?;
        let issuer_public_key = blind_rsa_signatures::PublicKey::from_spki(&issuer_public_key, None)?;
        let signature = blind_rsa_signatures::Signature::new(authenticator.to_vec());

        signature.verify(
            &issuer_public_key,
            message,
            &blind_rsa_signatures::Options::default(),
        )?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::Token;
    use crate::TokenChallenge;

    #[test]
    fn test_verify() {
        let challenge_marshalled = "AAIAHmRlbW8tcGF0Lmlzc3Vlci5jbG91ZGZsYXJlLmNvbSABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAFYWdtYWM=";

        let fake_nonce = [1u8; 32];
        let challenge = TokenChallenge::new("agmac".into(), fake_nonce);
        assert_eq!(
            challenge.clone().marshal().unwrap(),
            challenge_marshalled.to_string()
        );

        let token = "AAL6m5h6fpZn606171M_raQv900lqf99sLz0dqi-jjiVbcBSQs5Zg5A-cV4LzMtNeX1YG7wYaub_OVNmXqdFuI_0exg4ID4AE9Xkqa2Bc0gnRHm12eBQXijbsfTUi3r5pZ5b0yVYP8K9vKQZAIGyHIXanxv1Z0wnRXdM95NxvEfZTjs_hr6BpeW-CMCObB1Kt2blfmYz3ajWX_LRKtrzrGqzQdpDO9bvRo_2BvV9n-FZCxzioOe0LckjRls02lJY5FL0c5NYH_RFgswcbTB5K5ZniotseioeAreUdAhU_qAkLKcy2MNL_A8x04WjS2yJL691PJ4mSX9uPaVHCJQCWsYimoRg33Dg8mcs5-7atKhYxYGuI5DrQxmrME2lYKwsjvtIr0Gl7_1bY4D_ezTEca2NzFKBqDtwdc0O5BTbYzD7Y4TQhgkHFAPYHZ2U7iiT3eyQsgxidYWQTWotoDrOYz5t";

        let token = Token::unmarshal(token).expect("invalid token");
        token.verify(&challenge).expect("verification failed");
    }
}

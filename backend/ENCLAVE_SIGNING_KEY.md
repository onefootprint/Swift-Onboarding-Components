# Enclave Signing Key instructions
This document describes how to generate an enclave signing key + cert and compute the PCR8 measurement required to attest the enclave is signed by us before permissioned access to KMS.

Instructions from AWS found here: https://docs.aws.amazon.com/enclaves/latest/user/set-up-attestation.html#where

1. generate the key: `openssl ecparam -name secp384r1 -genkey -out enclave_key.pem`
2. generate csr: `openssl req -new -key enclave_key.pem -sha384 -nodes -subj "/CN=FootprintEnclaveProd/C=US/ST=NY/L=NYC/O=OneFootprintInc/OU=Footprint" -out csr.pem`
3. Generate a certificate based on the CSR: `openssl x509 -req -days 3650  -in csr.pem -out cert.pem -sha384 -signkey enclave_key.pem`

## Compute the PCR8
Login to a linux box that can run the nitro-cli.
1. sudo amazon-linux-extras install aws-nitro-enclaves-cli
2. `nitro-cli pcr --signing-certificate cert.pem`
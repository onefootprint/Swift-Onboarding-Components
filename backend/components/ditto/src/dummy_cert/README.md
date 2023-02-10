# Generating a local self-signed cert

## Server example

```shell
openssl genrsa -out server.key 4096
openssl req -new -out server.csr -key server.key -config server.cnf
openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt -extensions v3_req -extfile server.cnf
```

## Client example

```shell
cp /etc/ssl/openssl.cnf /tmp/
echo '[ subject_alt_name ]' >> /tmp/openssl.cnf
echo 'subjectAltName = DNS:testclient' >> /tmp/openssl.cnf

openssl req -x509 -days 3650 -nodes -newkey rsa:4096 \
  -config /tmp/openssl.cnf \
  -extensions subject_alt_name \
  -keyout client.key \
  -out client.crt \
  -subj '/C=US/ST=MA/L=BOS/O=TestClient/emailAddress=testclient@footprint.dev'
```

FROM alpine:latest

COPY ./out/enclave .

ENV RUST_LOG=info

CMD ./enclave
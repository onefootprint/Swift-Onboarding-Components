FROM alpine:latest

COPY ./out/enclave .

CMD ./enclave
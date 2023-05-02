FROM alpine:latest

VOLUME /shared
RUN mkdir -p /contents
COPY ./out/enclave_proxy /contents/

CMD ["cp", "-a", "/contents/.", "/shared/"]
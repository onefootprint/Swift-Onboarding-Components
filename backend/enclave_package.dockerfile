FROM alpine:3.16

VOLUME /shared
RUN mkdir -p /contents
COPY ./out/enclave.eif /contents/
COPY ./out/enclave_proxy /contents/

CMD ["cp", "-a", "/contents/.", "/shared/"]
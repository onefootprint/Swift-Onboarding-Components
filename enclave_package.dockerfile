FROM alpine:3.14

VOLUME /shared
RUN mkdir -p /contents
COPY ./out/enclave.eif /contents/

CMD ["cp", "/contents/enclave.eif", "/shared/"]
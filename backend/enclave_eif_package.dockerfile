FROM alpine:latest

VOLUME /shared
RUN mkdir -p /contents
COPY ./out/enclave.eif /contents/

CMD ["cp", "-a", "/contents/.", "/shared/"]
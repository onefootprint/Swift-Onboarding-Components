FROM alpine:3.16

VOLUME /shared
RUN mkdir -p /contents
COPY ./out/enclave.eif /contents/

CMD ["cp", "-a", "/contents/.", "/shared/"]
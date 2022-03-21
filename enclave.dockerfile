# build the EIF

FROM enclave_builder as builder

USER root

COPY ./out/enclave /usr/bin/enclave

RUN mkdir -p /rootfs
WORKDIR /rootfs

# Collect eVault lib deps
RUN BINS="\
    /usr/bin/enclave \
    " && \
    for bin in $BINS; do \
        { echo "$bin"; ldd "$bin" | grep -Eo "/.*lib.*/[^ ]+"; } | \
            while read path; do \
                mkdir -p ".$(dirname $path)"; \
                cp -fL "$path" ".$path"; \
                strip --strip-unneeded ".$path"; \
            done \
    done
RUN mkdir -p /rootfs/etc/ssl/certs \
    && cp -f /etc/ssl/certs/ca-certificates.crt /rootfs/etc/ssl/certs/
RUN mkdir -p /rootfs/p11ne

RUN mkdir -p /rootfs/bin/ && \
    cp /rootfs/usr/bin/enclave /rootfs/bin/enclave && \
    chmod +x /rootfs/bin/enclave

RUN find /rootfs

FROM scratch
COPY --from=builder /rootfs /

ENV RUST_LOG=info

CMD ["/bin/enclave"]



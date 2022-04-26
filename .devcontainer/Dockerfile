# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.195.0/containers/rust/.devcontainer/base.Dockerfile
# [Choice] Debian OS version (use bullseye on local arm64/Apple Silicon): buster, bullseye
ARG VARIANT="bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/rust:1-bullseye

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends libssl-dev libpq-dev postgresql

RUN git config --global alias.s "status -s"
RUN git config --global alias.pr "!git pull --rebase; git submodule update --init --recursive"
RUN git config --global alias.l "log --oneline --graph"

RUN curl -fsSL https://get.pulumi.com | sh
RUN source /root/.bashrc
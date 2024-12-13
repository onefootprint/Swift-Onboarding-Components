
## update and install some things we should probably have
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends \
  curl \
  wget \
  git \
  gnupg2 \
  jq \
  sudo \
  zsh \
  vim \
  build-essential \
  openssl \
  ca-certificates \
  pkg-config \
  libssl-dev \
  libpq-dev \
  python3-pip \
  python3-venv \
  lsb-core \
  clang \
  awscli \
  less \
  openssh-server

## enable ssh
sudo systemctl enable ssh --now
sudo systemctl start ssh

## install postgres
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update -y
apt-get install postgresql-14 -y
service postgresql start
sudo -u postgres createuser root --createdb
sed -i -e 's/peer/trust/g' /etc/postgresql/14/main/pg_hba.conf
sed -i -e 's/scram-sha-256/trust/g' /etc/postgresql/14/main/pg_hba.conf
service postgresql restart
createdb footprint_db

## Install rustup and common components
# Is there even a way to install Rust without curl | bash?
# nosemgrep: semgrep.shell.curl-pipe-shell
curl https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
rustup install stable
rustup default 1.79.0
rustup component add rustfmt
rustup component add clippy

cargo install cargo-expand
cargo install cargo-edit
cargo install diesel_cli --no-default-features --features postgres --version 2.0.0

# install a faster linker: mold
dir=$(pwd)
cd /tmp
git clone https://github.com/rui314/mold.git
mkdir mold/build
cd mold/build
git checkout v2.0.0
../install-build-deps.sh
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_COMPILER=g++-10 ..
cmake --build . -j $(nproc)
sudo cmake --build . --target install
cd $dir

## setup and install oh-my-zsh + some fun term things
# Pinned commit for more safety
# nosemgrep: semgrep.shell.curl-pipe-shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/69a6359f7cf8978d464573fb7b023ee3cd00181a/tools/install.sh)"
cp -R /root/.oh-my-zsh /home/$USERNAME
cp /root/.zshrc /home/$USERNAME
sed -i -e "s/\/root\/.oh-my-zsh/\/home\/$USERNAME\/.oh-my-zsh/g" /home/$USERNAME/.zshrc
chown -R $USER_UID:$USER_GID /home/$USERNAME/.oh-my-zsh /home/$USERNAME/.zshrc
echo 'PROMPT="footprint #"' >> /home/$USERNAME/.zshrc

## install pulumi
# nosemgrep: semgrep.shell.curl-pipe-shell
RUN curl -fsSL https://get.pulumi.com | sh

## install node
# nosemgrep: bash.curl.security.curl-pipe-bash.curl-pipe-bash,semgrep.shell.curl-pipe-shell
curl -L https://deb.nodesource.com/setup_19.x | bash && apt-get install -yq nodejs
npm install -g yarn

## setup git
git config --global alias.s "status -s"
git config --global alias.pr "!git pull --rebase; git submodule update --init --recursive"
git config --global alias.l "log --oneline --graph"

npm install -g @withgraphite/graphite-cli

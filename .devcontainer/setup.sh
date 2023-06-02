
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
  awscli

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
curl https://sh.rustup.rs -sSf | sh -s -- -y 
rustup install stable
rustup component add rustfmt
rustup component add clippy 

cargo install cargo-expand
cargo install cargo-edit
cargo install diesel_cli --no-default-features --features postgres

## setup and install oh-my-zsh + some fun term things
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
cp -R /root/.oh-my-zsh /home/$USERNAME
cp /root/.zshrc /home/$USERNAME
sed -i -e "s/\/root\/.oh-my-zsh/\/home\/$USERNAME\/.oh-my-zsh/g" /home/$USERNAME/.zshrc
chown -R $USER_UID:$USER_GID /home/$USERNAME/.oh-my-zsh /home/$USERNAME/.zshrc
echo 'PROMPT="footprint #"' >> /home/$USERNAME/.zshrc

## install pulumi
RUN curl -fsSL https://get.pulumi.com | sh

## install node
curl -L https://deb.nodesource.com/setup_19.x | bash && apt-get install -yq nodejs
npm install -g yarn

## setup git
git config --global alias.s "status -s"
git config --global alias.pr "!git pull --rebase; git submodule update --init --recursive"
git config --global alias.l "log --oneline --graph"

npm install -g @withgraphite/graphite-cli

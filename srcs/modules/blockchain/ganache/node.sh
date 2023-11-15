#!/bin/sh

echo -n $(hostname -i) > /var/blockchain/hostname

if [[ "$(npm list -g ganache)" =~ "empty" ]]; then
    echo "Installing ganache"
    npm install -g ganache > /dev/null 2>&1;
else
    echo "ganache is already installed"
fi

echo "Launching the node"

touch /var/blockchain/check

ganache --database.dbPath /var/blockchain/state/ --wallet.accounts "0x$GANACHEPRIVATEKEY, 1000000000000000000000" --chain.chainId "31337" --server.port "8545" --server.host "$(hostname -i)"


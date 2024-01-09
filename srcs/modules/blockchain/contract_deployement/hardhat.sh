#!/bin/sh

if [ -f "/var/blockchain/contract_address.txt" ]; then
    export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);
    echo Contract already deployed;
    sleep 50000
fi

if [[ "$(npm list chai)" =~ "empty" ]]; then
    echo "Installing chai"
    npm install chai > /dev/null 2>&1;
else
    echo "chai is already installed"
fi

if [[ "$(npm list mocha)" =~ "empty" ]]; then
    echo "Installing mocha"
    npm install mocha > /dev/null 2>&1;
else
    echo "mocha is already installed"
fi

if [[ "$(npm list @nomiclabs/hardhat-waffle)" =~ "empty" ]]; then
    echo "Installing nomiclabs/hardhat-waffle"
    npm install @nomiclabs/hardhat-waffle > /dev/null 2>&1;
else
    echo "nomiclabs/hardhat-waffle is already installed"
fi

if [ ! -f "/var/blockchain/contract_address.txt" ]; then
    echo "running npx hardhat compile";
    npx hardhat compile;
fi

export IP_NODE=$(cat /var/blockchain/hostname);

x=0

while [ "$x" -lt 30 ]; do
    if [ -d "/var/blockchain/state" ] && [ -f "/var/blockchain/check" ]; then
        echo find state
        break
    else
        if [ "$x" -lt 30 ]; then
            x=$((x + 1))
            sleep 1
        else
            exit 1
        fi
    fi
done


if [ ! -f "/var/blockchain/contract_address.txt" ]; then
    echo "running npx hardhat run --network ganache scripts/deploy.js";
    npx hardhat run --network ganache scripts/deploy.js;
    cp contract_address.txt /var/blockchain/;
    echo Contract address file is create;
    export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);
fi


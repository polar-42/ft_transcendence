#!/bin/sh

if [ -f "/var/blockchain/contract_address.txt" ]; then
    export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);
    echo Contract already deployed;
    exit 0
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

var=$(ping container_ganache -qc 1 | grep PING | awk '{print $3}'); echo ${var:1:-2}
export IP_NODE=${var:1:-2};

while [ !  -f "/var/blockchain/check" ]; do
    sleep 1
done

echo find state


if [ ! -f "/var/blockchain/contract_address.txt" ]; then
    echo "running npx hardhat run --network ganache scripts/deploy.js";
    npx hardhat run --network ganache scripts/deploy.js;

    cp contract_address.txt /var/blockchain/;
    echo Contract address file is create;

    cp artifacts/contracts/TranscendenceTournamentHistory.sol/TranscendenceTournamentHistory.json /var/blockchain
    echo ABI file is create;
fi


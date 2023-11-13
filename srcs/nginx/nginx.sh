#!/bin/sh
if npm ls | grep nomiclabs/hardhat-waffle > /dev/null 2>&1; then
    true
else
    echo "running npm install nomiclabs/hardhat-waffle";
    npm install @nomiclabs/hardhat-waffle > /dev/null 2>&1;
fi


if npm ls | grep nomiclabs/hardhat-ethers > /dev/null 2>&1; then
    true
else
    echo "running npm install nomiclabs/hardhat-ethers";
    npm install @nomiclabs/hardhat-ethers > /dev/null 2>&1;
fi


if npm ls | grep ethers > /dev/null 2>&1; then
    true
else
    echo "running npm install ethers";
    npm install ethers > /dev/null 2>&1;
fi

export IP_NODE=$(cat /var/blockchain/hostname);

x=0

while [ "$x" -lt 120 ]; do
    if [ -f "/var/blockchain/contract_address.txt" ]; then
        echo find
        break
    else
        if [ "$x" -lt 120 ]; then
            echo plus one
            x=$((x + 1))
            sleep 1
        else
            exit 1
        fi
    fi
done

export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);
rm /var/blockchain/contract_address.txt;

wget https://cdn.ethers.io/lib/ethers-5.2.esm.min.js
mv ethers-5.2.esm.min.js /usr/share/nginx/html/script/ethers.js

nginx -g "daemon off;"

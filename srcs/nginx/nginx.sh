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
        echo find contract address
        break
    else
        if [ "$x" -lt 120 ]; then
            x=$((x + 1))
            sleep 1
        else
            exit 1
        fi
    fi
done

export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);
rm /var/blockchain/contract_address.txt;

sed -i "s/IPADDRESS/$IP_NODE/g" /usr/share/nginx/html/script/getData.js
sed -i "s/CONTRACTADDRESS/$CONTRACT_ADDRESS/g" /usr/share/nginx/html/script/getData.js

nginx -g "daemon off;"

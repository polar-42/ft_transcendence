#!/bin/sh

#if [[ "$(npm list @nomiclabs/hardhat-waffle)" =~ "empty" ]]; then
#    echo "Installing nomiclabs/hardhat-waffle"
#    npm install @nomiclabs/hardhat-waffle > /dev/null 2>&1;
#else
#    echo "nomiclabs/hardhat-waffle is already installed"
#fi

#if [[ "$(npm list @nomiclabs/hardhat-ethers)" =~ "empty" ]]; then
#    echo "Installing nomiclabs/hardhat-ethers"
#    npm install @nomiclabs/hardhat-ethers > /dev/null 2>&1;
#else
#    echo "nomiclabs/hardhat-ethers is already installed"
#fi

#if [[ "$(npm list @ethers)" =~ "empty" ]]; then
#    echo "Installing ethers"
#    npm install ethers > /dev/null 2>&1;
#else
#    echo "ethers is already installed"
#fi

#export IP_NODE=$(cat /var/blockchain/hostname);

#x=0

#while [ "$x" -lt 120 ]; do
#    if [ -f "/var/blockchain/contract_address.txt" ] && [ -f "/var/blockchain/check" ]; then
#        echo find contract address
#        break
#    else
#        if [ "$x" -lt 120 ]; then
#            x=$((x + 1))
#            sleep 1
#        else
#            exit 1
#        fi
#    fi
#done

#export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt);

#rm /var/blockchain/check;

#sed -i "s/IPADDRESS/$IP_NODE/g" /usr/share/nginx/html/script/getData.js
#sed -i "s/CONTRACTADDRESS/$CONTRACT_ADDRESS/g" /usr/share/nginx/html/script/getData.js

nginx -g "daemon off;"

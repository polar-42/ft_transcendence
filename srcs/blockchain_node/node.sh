#!/bin/sh

echo -n $(hostname -i) > /var/blockchain/hostname

#if npm ls | grep hardhat@2.18. > /dev/null 2>&1; then
#    true
#else
#    echo "running npm install --save-dev -g hardhat";
#    npm install --save-dev "hardhat@^2.18.1" > /dev/null 2>&1;
#fi


if npm ls | grep nomiclabs/hardhat-waffle > /dev/null 2>&1; then
    true
else
    echo "running npm install @nomiclabs/hardhat-waffle";
    npm install @nomiclabs/hardhat-waffle > /dev/null 2>&1;
fi


if npm ls | grep nomiclabs/hardhat-ethers > /dev/null 2>&1; then
    true
else
    echo "running npm install @nomiclabs/hardhat-ethers";
    npm install @nomiclabs/hardhat-ethers > /dev/null 2>&1;
fi

touch /var/blockchain/check
echo "Launching the node"
npx hardhat node

sh

#!/bin/sh
#if npm ls | grep hardhat@2.18. > /dev/null 2>&1; then
#    true
#else
#    echo "running npm install --save-dev -g hardhat";
#    npm install --save-dev "hardhat@^2.18.1" > /dev/null 2>&1;
#fi


if npm ls | grep chai > /dev/null 2>&1; then
    true
else
    echo "running npm install --save-dev -g chai";
    npm install chai > /dev/null 2>&1;
fi


if npm ls | grep mocha > /dev/null 2>&1; then
    true
else
    echo "running npm install mocha";
    npm install mocha > /dev/null 2>&1;
fi


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

echo "running npx hardhat compile";
npx hardhat compile;

export IP_NODE=$(cat /var/blockchain/hostname);

x=0

while [ "$x" -lt 30 ]; do
    if [ -f "/var/blockchain/check" ]; then
        echo find check
        rm -rf /var/blockchain/check
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


#echo "running npx hardhat test --network localhost";
#npx hardhat test --network localhost;

echo "running npx hardhat run --network localhost scripts/deploy.js";
npx hardhat run --network localhost scripts/deploy.js;

export CONTRACT_ADDRESS=$(cat contract_address.txt);
mv contract_address.txt /var/blockchain;
echo Contract address file is create;

sh

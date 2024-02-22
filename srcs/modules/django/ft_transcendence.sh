#!/bin/sh

#CHECK IF POSTGRES IS LAUNCH AND TRANSCENDENCE_DB EXIST
while true ; do

	pg_isready --dbname=transcendence_db --host=container_postgresql --port=5432 --username=user_db > /dev/null 2>&1;

	if [ $? -eq 0 ]; then
		break
	fi

	sleep 1
done

#BLOCKCHAIN

var=$(ping container_ganache -qc 1 | grep PING | awk '{print $3}');
export IP_NODE=${var:1:-2};

python3 << EOF
from web3 import Web3
import time, os
w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
while w3.is_connected() is False:
   time.sleep(1)
print('http://172.22.0.4:8545 is a valid blockchain')
EOF

while [ ! -f "/var/blockchain/contract_address.txt" ]; do
	sleep 1
done

export CONTRACT_ADDRESS=$(cat /var/blockchain/contract_address.txt)
var=$(ping container_nginx -qc 1 | grep PING | awk '{print $3}'); echo ${var:1:-2}
export NGINXIP=${var:1:-2};
#BLOCKCHAIN


ln -s /var/conf/ft_transcendence .
cd ft_transcendence

python manage.py makemigrations
python manage.py migrate
python manage.py db_check
python manage.py create_user

# daphne ft_transcendence.asgi:application --host 0.0.0.0 --port 8000 --reload
gunicorn -c /usr/src/app/gunicornConf.py ft_transcendence.asgi:application

# uvicorn ft_transcendence.asgi:application --host 0.0.0.0 --port 8000 --reload --access-log --use-colors

# python3 manage.py runserver 0.0.0.0:8000

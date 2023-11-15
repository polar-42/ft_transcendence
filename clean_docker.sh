docker stop container_blockchain_contract container_blockchain_node container_nginx &&
	docker system prune -af &&
	docker volume rm ft_transcendence_blockchain

echo fle-tolg42 | sudo -S rm -rf /home/fle-tolg/data/blockchain/*


#Address: 0xE19ED1F272790B763E756DD6C8956A324f9986Af
#Private key: b5da18401bd4966bee293e65d32bd9d2059393c12876ab7e02160bd17416189a

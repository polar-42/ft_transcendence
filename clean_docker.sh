docker stop container_blockchain_contract container_blockchain_node container_nginx &&
	docker system prune -af &&
	docker volume rm ft_transcendence_blockchain

echo fle-tolg42 | sudo -S rm -rf /home/fle-tolg/data/blockchain/*

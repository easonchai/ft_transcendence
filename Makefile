build:
	docker compose build --no-cache

up:
	docker compose up -d

start:
	docker compose start

down:
	docker compose down

clean_containers:
	if [ $$(docker ps -aq) ]; then docker rm $$(docker ps -aq); fi

clean_images:
	if [ $$(docker images -aq) ]; then docker rmi $$(docker images -aq); fi

clean_volume:
	if [ $$(docker volume ls -q) ]; then docker volume rm $$(docker volume ls -q); fi

fclean: clean_containers clean_images clean_volume
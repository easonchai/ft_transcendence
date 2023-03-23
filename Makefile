FRONTEND_IMAGE=frontend:v1
BACKEND_IMAGE=backend:v1

build:
	docker compose build --no-cache

up:
	docker compose up -d

start:
	docker compose start

restart:
	docker compose restart

down:
	docker compose down

clean_containers:
	if [ "$$(docker ps -aq)" ]; then docker rm $$(docker ps -aq); fi

clean_images:
	if [ "$$(docker images $(FRONTEND_IMAGE) -q)" ]; then docker rmi $(FRONTEND_IMAGE); fi
	if [ "$$(docker images $(BACKEND_IMAGE) -q)" ]; then docker rmi $(BACKEND_IMAGE); fi

clean_volume:
	if [ "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); fi

fclean: clean_containers clean_images clean_volume
FRONTEND_IMAGE=frontend:v1
BACKEND_IMAGE=backend:v1

OLD_NEXTAUTH_URL=$(shell awk '/NEXTAUTH_URL/ {print}' ./frontend/app/.docker.env)
OLD_NESTJS_URL=$(shell awk '/NEXT_PUBLIC_NESTJS_URL/ {print}' ./frontend/app/.docker.env)
OLD_NESTJS_WS=$(shell awk '/NEXT_PUBLIC_NESTJS_WS/ {print}' ./frontend/app/.docker.env)
OLD_IP=$(shell awk '/IP/ {print}' ./frontend/app/.docker.env)
OLD_NEXTAUTH_URL_BACKEND=$(shell awk '/NEXTAUTH_URL/ {print}' ./backend/app/.docker.env)

build:
	docker compose build --no-cache

up:
	sed -i '' 's|$(OLD_NEXTAUTH_URL)|NEXTAUTH_URL="http:\/\/$(shell python3 ip.py):3001"|g' ./frontend/app/.docker.env
	sed -i '' 's|$(OLD_NESTJS_URL)|NEXT_PUBLIC_NESTJS_URL="http:\/\/$(shell python3 ip.py):3000"|g' ./frontend/app/.docker.env
	sed -i '' 's|$(OLD_NESTJS_WS)|NEXT_PUBLIC_NESTJS_WS="ws:\/\/$(shell python3 ip.py):3000"|g' ./frontend/app/.docker.env
	sed -i '' 's|$(OLD_IP)|IP="$(shell python3 ip.py)"|g' ./frontend/app/.docker.env
	sed -i '' 's|$(OLD_NEXTAUTH_URL_BACKEND)|NEXTAUTH_URL="http:\/\/$(shell python3 ip.py):3001"|g' ./backend/app/.docker.env
	mkdir -p ./frontend/app/prisma
	cp ./backend/app/prisma/schema.prisma ./frontend/app/prisma/
	docker compose up -d --force-recreate

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
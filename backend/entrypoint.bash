#!bin/bash

cd /app

npm install

if ![ -e prisma/migrations ]
	cd prisma
	npx prisma mirgate dev
fi

npm run start:dev

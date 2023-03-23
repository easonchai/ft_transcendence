#!bin/bash

cd /app

npm install
npx prisma migrate deploy
npx prisma generate
npm run start:dev

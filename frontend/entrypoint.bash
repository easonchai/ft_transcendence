#!/bin/bash

cd /app

npm install
npx prisma generate
# npm run build
# npm run start
npm run dev 
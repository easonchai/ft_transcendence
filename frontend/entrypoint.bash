#!/bin/bash

cd /app

npm install
npx prisma generate
npm run dev
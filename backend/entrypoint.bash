#!/bin/bash

cd /app

# db
npx prisma migrate deploy

npm run start:prod

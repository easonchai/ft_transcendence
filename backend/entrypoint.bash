#!bin/bash

cd /app

npm install
# db
npx prisma migrate deploy
npx prisma generate

# migrate test db
sed 's/DATABASE_URL/TEST_DATABASE_URL/g' prisma/schema.prisma > prisma/test_schema.prisma
npx prisma migrate deploy --schema=./prisma/test_schema.prisma

npm run start:dev

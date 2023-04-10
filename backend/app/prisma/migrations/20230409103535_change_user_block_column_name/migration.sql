/*
  Warnings:

  - The primary key for the `UserBlocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blocker_id` on the `UserBlocks` table. All the data in the column will be lost.
  - Added the required column `blocked_by_id` to the `UserBlocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserBlocks" DROP CONSTRAINT "UserBlocks_blocker_id_fkey";

-- AlterTable
ALTER TABLE "UserBlocks" DROP CONSTRAINT "UserBlocks_pkey",
DROP COLUMN "blocker_id",
ADD COLUMN     "blocked_by_id" TEXT NOT NULL,
ADD CONSTRAINT "UserBlocks_pkey" PRIMARY KEY ("blocked_by_id", "blocked_id");

-- AddForeignKey
ALTER TABLE "UserBlocks" ADD CONSTRAINT "UserBlocks_blocked_by_id_fkey" FOREIGN KEY ("blocked_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

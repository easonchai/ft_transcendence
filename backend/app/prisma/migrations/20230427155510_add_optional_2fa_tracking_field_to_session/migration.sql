-- CreateEnum
CREATE TYPE "TwoFactorStatus" AS ENUM ('PASSED', 'PENDING');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "twoFaStatus" "TwoFactorStatus";

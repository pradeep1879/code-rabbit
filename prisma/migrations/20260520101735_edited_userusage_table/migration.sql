/*
  Warnings:

  - The `repositoryCount` column on the `user_usage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `user_usage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_usage" DROP COLUMN "repositoryCount",
ADD COLUMN     "repositoryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "user_usage_userId_key" ON "user_usage"("userId");

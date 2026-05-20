-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "user_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryCount" TEXT NOT NULL,
    "reviewCounts" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_usage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

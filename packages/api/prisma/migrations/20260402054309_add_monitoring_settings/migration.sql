-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "monitoring_settings" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "monitoring_settings" JSONB;

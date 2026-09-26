-- Optional birth date for parent dogs. Lists fall back to createdAt until it is set.
ALTER TABLE "ParentDog" ADD COLUMN "birthDate" TIMESTAMP(3);

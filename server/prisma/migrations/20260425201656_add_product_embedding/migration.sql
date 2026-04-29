-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "embedding" vector(1024),
ADD COLUMN     "embeddingVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex (HNSW for cosine similarity — only indexes non-null rows)
CREATE INDEX "Product_embedding_hnsw_idx"
  ON "Product" USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

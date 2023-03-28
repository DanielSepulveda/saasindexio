import { type Product } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { z } from "zod";

import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

/* ------------------------------ LIST PRODUCTS ----------------------------- */

const listProducts = publicProcedure.query(({ ctx }) => {
  return ctx.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
});

/* ----------------------------- ADD PRODUCT ----------------------------- */

const addProductSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  shortDesc: z.string(),
  fullDesc: z.string().optional().default(""),
  releaseYear: z.string().optional(),
  hasFreeTier: z.boolean().default(false),
});

const addProduct = protectedProcedure
  .meta({ openapi: { method: "POST", path: "/product" } })
  .input(addProductSchema)
  .mutation(async ({ ctx, input }) => {
    const newProduct: Product = await ctx.prisma.product.create({
      data: {
        name: input.name,
        url: input.url,
        shortDesc: input.shortDesc,
        fullDesc: input.fullDesc,
        releaseYear: input.releaseYear,
        hasFreeTier: input.hasFreeTier,
      },
    });

    const productDescToEmbed = `${newProduct.name} - ${newProduct.shortDesc}`;
    const productDoc = new Document({
      pageContent: productDescToEmbed,
    });

    const pineconeIndex = ctx.pinecone.Index(env.PINECONE_INDEX);
    const productStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace: "description" },
    );
    await productStore.addDocuments([productDoc], [newProduct.id]);

    return newProduct;
  });

/* ----------------------------- DELETE PRODUCT ----------------------------- */

const deleteProductSchema = z.object({
  id: z.string(),
});

const deleteProduct = protectedProcedure
  .meta({ openapi: { method: "DELETE", path: "/product" } })
  .input(deleteProductSchema)
  .mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    const pineconeIndex = ctx.pinecone.Index(env.PINECONE_INDEX);
    await pineconeIndex.delete1({ ids: [product.id] });

    return ctx.prisma.product.delete({ where: { id: input.id } });
  });

export const productRouter = createTRPCRouter({
  list: listProducts,
  add: addProduct,
  delete: deleteProduct,
});

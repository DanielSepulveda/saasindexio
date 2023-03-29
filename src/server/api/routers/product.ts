import { type ScoredVector } from "@pinecone-database/pinecone";
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

const listProductsSchema = z.object({
  search: z.string().optional(),
});

const listProducts = publicProcedure
  .input(listProductsSchema)
  .query(async ({ ctx, input }) => {
    if (input.search) {
      const pineconeIndex = ctx.pinecone.Index(env.PINECONE_INDEX);
      const embeddings = new OpenAIEmbeddings();

      const searchQuery = await embeddings.embedQuery(input.search);

      const searchResults = await pineconeIndex.query({
        queryRequest: {
          vector: searchQuery,
          topK: 10,
          namespace: "description",
          includeMetadata: true,
        },
      });

      if (!searchResults.matches || searchResults.matches.length === 0) {
        return [];
      }

      const searchMatches = searchResults.matches;
      const searchMatchesMap = new Map<string, ScoredVector>();

      const productIds = searchMatches.map((match) => {
        searchMatchesMap.set(match.id, match);
        return match.id;
      });

      const foundProducts = await ctx.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productsWithScore = foundProducts.map((product) => {
        const productMatch = searchMatchesMap.get(product.id);
        const productScore =
          productMatch && productMatch.score ? productMatch.score : 0;

        return {
          ...product,
          score: productScore,
        };
      });

      const sortedProducts = productsWithScore.sort(
        (a, b) => b.score - a.score,
      );

      return sortedProducts;
    }

    return ctx.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
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
  .meta({ openapi: { method: "POST", path: "/product/delete" } })
  .input(deleteProductSchema)
  .mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    const pineconeIndex = ctx.pinecone.Index(env.PINECONE_INDEX);
    await pineconeIndex.delete1({
      ids: [product.id],
      namespace: "description",
    });

    return ctx.prisma.product.delete({ where: { id: input.id } });
  });

export const productRouter = createTRPCRouter({
  list: listProducts,
  add: addProduct,
  delete: deleteProduct,
});

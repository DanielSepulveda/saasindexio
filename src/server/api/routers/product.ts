import { type Product } from "@prisma/client";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

/* ------------------------------ LIST PRODUCTS ----------------------------- */

const listProducts = publicProcedure.query(({ ctx }) => {
  return ctx.prisma.product.findMany();
});

/* ----------------------------- ADD PRODUCT ----------------------------- */

const addProductSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  shortDesc: z.string(),
  fullDesc: z.string().optional(),
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

    return newProduct;
  });

export const productRouter = createTRPCRouter({
  list: listProducts,
  add: addProduct,
});

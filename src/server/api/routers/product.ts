import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
  releaseYear: z.number().optional(),
  hasFreeTier: z.boolean().default(false),
});

const addProduct = publicProcedure
  .input(addProductSchema)
  .mutation(({ ctx, input }) => {
    const product = ctx.prisma.product.create({
      data: {
        name: input.name,
        url: input.url,
        shortDesc: input.shortDesc,
        fullDesc: input.fullDesc,
        releaseYear: input.releaseYear,
        hasFreeTier: input.hasFreeTier,
      },
    });

    return product;
  });

export const productRouter = createTRPCRouter({
  list: listProducts,
  add: addProduct,
});

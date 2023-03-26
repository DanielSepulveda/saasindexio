import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
});

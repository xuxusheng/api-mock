import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { apis: true },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.project.findFirst({
        where: { 
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          apis: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { apis: true },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      baseUrl: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          baseUrl: input.baseUrl,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      baseUrl: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.update({
        where: { 
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          name: input.name,
          description: input.description,
          baseUrl: input.baseUrl,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: { 
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const totalProjects = await ctx.db.project.count({
      where: { createdById: ctx.session.user.id },
    });

    const totalApis = await ctx.db.api.count({
      where: {
        project: { createdById: ctx.session.user.id },
      },
    });

    const activeApis = await ctx.db.api.count({
      where: {
        project: { createdById: ctx.session.user.id },
        isActive: true,
      },
    });

    return {
      totalProjects,
      totalApis,
      activeApis,
    };
  }),
});
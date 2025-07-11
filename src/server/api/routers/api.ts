import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const HttpMethodEnum = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]);

export const apiRouter = createTRPCRouter({
  // 获取项目下的所有API
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // 先验证用户是否有权限访问这个项目
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          createdById: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return ctx.db.api.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),

  // 根据ID获取API
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const api = await ctx.db.api.findFirst({
        where: {
          id: input.id,
          project: {
            createdById: ctx.session.user.id,
          },
        },
        include: {
          project: true,
        },
      });

      if (!api) {
        throw new Error("API not found");
      }

      return api;
    }),

  // 创建API
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        path: z.string().regex(/^\//, "Path must start with /"),
        method: HttpMethodEnum,
        config: z.any().optional(),
        mockData: z.any().optional(),
        statusCode: z.number().int().min(100).max(599).default(200),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 验证用户是否有权限访问这个项目
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          createdById: ctx.session.user.id,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // 检查同一项目下是否已存在相同路径和方法的API
      const existingApi = await ctx.db.api.findFirst({
        where: {
          projectId: input.projectId,
          path: input.path,
          method: input.method,
        },
      });

      if (existingApi) {
        throw new Error("API with same path and method already exists");
      }

      return ctx.db.api.create({
        data: {
          name: input.name,
          description: input.description,
          path: input.path,
          method: input.method,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          config: input.config,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mockData: input.mockData,
          statusCode: input.statusCode,
          isActive: input.isActive,
          projectId: input.projectId,
        },
      });
    }),

  // 更新API
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        path: z.string().regex(/^\//, "Path must start with /"),
        method: HttpMethodEnum,
        config: z.any().optional(),
        mockData: z.any().optional(),
        statusCode: z.number().int().min(100).max(599),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const api = await ctx.db.api.findFirst({
        where: {
          id: input.id,
          project: {
            createdById: ctx.session.user.id,
          },
        },
        include: {
          project: true,
        },
      });

      if (!api) {
        throw new Error("API not found");
      }

      // 检查是否存在相同路径和方法的其他API
      const existingApi = await ctx.db.api.findFirst({
        where: {
          projectId: api.projectId,
          path: input.path,
          method: input.method,
          id: { not: input.id },
        },
      });

      if (existingApi) {
        throw new Error("API with same path and method already exists");
      }

      return ctx.db.api.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          path: input.path,
          method: input.method,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          config: input.config,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mockData: input.mockData,
          statusCode: input.statusCode,
          isActive: input.isActive,
        },
      });
    }),

  // 删除API
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const api = await ctx.db.api.findFirst({
        where: {
          id: input.id,
          project: {
            createdById: ctx.session.user.id,
          },
        },
      });

      if (!api) {
        throw new Error("API not found");
      }

      return ctx.db.api.delete({
        where: { id: input.id },
      });
    }),

  // 切换API状态
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const api = await ctx.db.api.findFirst({
        where: {
          id: input.id,
          project: {
            createdById: ctx.session.user.id,
          },
        },
      });

      if (!api) {
        throw new Error("API not found");
      }

      return ctx.db.api.update({
        where: { id: input.id },
        data: {
          isActive: !api.isActive,
        },
      });
    }),
});
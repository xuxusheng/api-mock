# API Mock Project Structure

这是一个基于 Next.js 的 API 模拟项目，使用 TypeScript 和现代化的全栈开发技术栈。

## 项目结构

```
.
├── bun.lock                    # Bun 包管理器锁定文件
├── components.json             # shadcn/ui 组件配置文件
├── eslint.config.js           # ESLint 配置
├── next.config.js             # Next.js 配置
├── package.json               # 项目依赖和脚本
├── postcss.config.js          # PostCSS 配置
├── prettier.config.js         # Prettier 代码格式化配置
├── prisma/                    # 数据库 ORM
│   └── schema.prisma          # 数据库模式定义
├── public/                    # 静态资源目录
│   └── favicon.ico
├── README.md                  # 项目说明文档
├── src/                       # 源代码目录
│   ├── app/                   # Next.js App Router 目录
│   │   ├── _components/       # 应用组件
│   │   │   └── post.tsx
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关 API
│   │   │   └── trpc/          # tRPC API 处理器
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 主页组件
│   ├── env.js                 # 环境变量配置
│   ├── lib/                   # 工具库
│   │   └── utils.ts           # shadcn/ui 工具函数
│   ├── server/                # 服务端代码
│   │   ├── api/               # 服务端 API 逻辑
│   │   │   ├── root.ts        # tRPC 根路由
│   │   │   ├── routers/       # API 路由器
│   │   │   └── trpc.ts        # tRPC 配置
│   │   ├── auth/              # 认证配置
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── db.ts              # 数据库连接配置
│   ├── styles/                # 样式文件
│   │   └── globals.css        # 全局样式（包含 shadcn/ui 主题）
│   └── trpc/                  # tRPC 客户端配置
│       ├── query-client.ts    # React Query 客户端
│       ├── react.tsx          # tRPC React 组件
│       └── server.ts          # 服务端 tRPC 配置
├── start-database.sh          # 数据库启动脚本
└── tsconfig.json              # TypeScript 配置
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: Prisma ORM
- **认证**: NextAuth.js
- **API**: tRPC + React Query
- **样式**: Tailwind CSS + shadcn/ui
- **包管理**: Bun
- **代码质量**: ESLint + Prettier

## 开发命令

- `bun dev` - 启动开发服务器
- `bun build` - 构建生产版本
- `bun check` - 运行 lint 和类型检查
- `bun db:generate` - 生成 Prisma 迁移
- `bun db:studio` - 打开 Prisma Studio
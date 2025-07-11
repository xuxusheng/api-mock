"use client"

import { Badge } from "@/components/ui/badge"
import { api } from "@/trpc/react"

interface ProjectHeaderProps {
  projectId: string
}

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { data: project, isLoading } = api.project.getById.useQuery({
    id: projectId,
  })

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">项目不存在</h1>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground">
          {project.description ?? "暂无描述"}
        </p>
      </div>
      <Badge variant="secondary">
        {project.apis.length} 个接口
      </Badge>
    </>
  )
}
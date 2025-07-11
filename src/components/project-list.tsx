"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/trpc/react"
import { ProjectForm } from "@/components/project-form"
import { MoreHorizontal, Trash2, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { toast } from "sonner"
import Link from "next/link"

export function ProjectList() {
  const t = useTranslations()
  const locale = useLocale()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { data: projects, isLoading } = api.project.getAll.useQuery()
  const utils = api.useUtils()
  
  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      void utils.project.getAll.invalidate()
      void utils.project.getStats.invalidate()
      setDeletingId(null)
      toast.success("项目已删除")
    },
    onError: (error) => {
      toast.error(error.message)
      setDeletingId(null)
    },
  })

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteProject.mutate({ id })
  }

  const dateLocale = locale === 'zh' ? zhCN : enUS

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!projects?.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">{t("project.noProjects")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("project.createFirst")}
          </p>
          <ProjectForm />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription className="mt-1">
                  {project.description ?? "暂无描述"}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/projects/${project.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      查看详情
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <ProjectForm
                      projectId={project.id}
                      initialData={{
                        name: project.name,
                        description: project.description ?? "",
                      }}
                    />
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("project.delete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("project.deleteConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id)}
                          disabled={deletingId === project.id}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingId === project.id ? t("common.loading") : t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge variant="secondary">
                  {project._count.apis} 个接口
                </Badge>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground">
            创建于 {formatDistanceToNow(new Date(project.createdAt), { 
              addSuffix: true, 
              locale: dateLocale 
            })}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
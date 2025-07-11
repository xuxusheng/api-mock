"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ApiForm } from "@/components/api-form"
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Copy, 
  Play, 
  Pause,
  ExternalLink 
} from "lucide-react"
import { toast } from "sonner"

interface ApiListProps {
  projectId: string
}

export function ApiList({ projectId }: ApiListProps) {
  const t = useTranslations()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const utils = api.useUtils()
  
  const { data: apis, isLoading } = api.api.getByProject.useQuery({
    projectId,
  })
  
  const deleteApi = api.api.delete.useMutation({
    onSuccess: () => {
      utils.api.getByProject.invalidate({ projectId })
      utils.project.getById.invalidate({ id: projectId })
      setDeletingId(null)
      toast.success("接口已删除")
    },
    onError: (error) => {
      toast.error(error.message)
      setDeletingId(null)
    },
  })

  const toggleActive = api.api.toggleActive.useMutation({
    onSuccess: () => {
      utils.api.getByProject.invalidate({ projectId })
      utils.project.getById.invalidate({ id: projectId })
      toast.success("状态已更新")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteApi.mutate({ id })
  }

  const handleToggleActive = (id: string) => {
    toggleActive.mutate({ id })
  }

  const copyApiUrl = (api: any) => {
    const url = `${window.location.origin}/api/mock/${projectId}${api.path}`
    navigator.clipboard.writeText(url)
    toast.success(t("common.copied"))
  }

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case "GET":
        return "default"
      case "POST":
        return "destructive"
      case "PUT":
        return "secondary"
      case "DELETE":
        return "destructive"
      case "PATCH":
        return "outline"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!apis?.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">{t("api.noApis")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("api.createFirst")}
          </p>
          <ApiForm projectId={projectId} />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {apis.map((api) => (
        <Card key={api.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getMethodBadgeVariant(api.method)}>
                    {api.method}
                  </Badge>
                  <Badge variant={api.isActive ? "default" : "secondary"}>
                    {api.isActive ? "启用" : "禁用"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{api.name}</CardTitle>
                <CardDescription className="mt-1">
                  {api.description || "暂无描述"}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyApiUrl(api)}>
                    <Copy className="h-4 w-4 mr-2" />
                    复制URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleActive(api.id)}>
                    {api.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        禁用
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        启用
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <ApiForm
                      projectId={projectId}
                      apiId={api.id}
                      initialData={{
                        name: api.name,
                        description: api.description || "",
                        path: api.path,
                        method: api.method,
                        statusCode: api.statusCode,
                        mockData: api.mockData,
                        isActive: api.isActive,
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
                        <AlertDialogTitle>{t("api.delete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("api.deleteConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(api.id)}
                          disabled={deletingId === api.id}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingId === api.id ? t("common.loading") : t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {api.path}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>状态码: {api.statusCode}</span>
              </div>
              {api.mockData && (
                <div className="text-xs text-muted-foreground">
                  <pre className="bg-muted p-2 rounded text-xs max-h-20 overflow-y-auto">
                    {JSON.stringify(api.mockData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
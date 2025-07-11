"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/trpc/react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface ApiFormProps {
  projectId: string
  apiId?: string
  initialData?: {
    name: string
    description?: string
    path: string
    method: string
    statusCode: number
    mockData?: any
    isActive: boolean
  }
  onSuccess?: () => void
}

const HTTP_METHODS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
]

export function ApiForm({ projectId, apiId, initialData, onSuccess }: ApiFormProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [path, setPath] = useState(initialData?.path || "/")
  const [method, setMethod] = useState(initialData?.method || "GET")
  const [statusCode, setStatusCode] = useState(initialData?.statusCode || 200)
  const [mockData, setMockData] = useState(
    initialData?.mockData ? JSON.stringify(initialData.mockData, null, 2) : "{}"
  )
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  
  const utils = api.useUtils()
  
  const createApi = api.api.create.useMutation({
    onSuccess: () => {
      utils.api.getByProject.invalidate({ projectId })
      utils.project.getById.invalidate({ id: projectId })
      setOpen(false)
      resetForm()
      onSuccess?.()
      toast.success(t("form.saved"))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateApi = api.api.update.useMutation({
    onSuccess: () => {
      utils.api.getByProject.invalidate({ projectId })
      utils.api.getById.invalidate({ id: apiId! })
      setOpen(false)
      onSuccess?.()
      toast.success(t("form.saved"))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setName("")
    setDescription("")
    setPath("/")
    setMethod("GET")
    setStatusCode(200)
    setMockData("{}")
    setIsActive(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error(t("api.nameRequired"))
      return
    }

    if (!path.trim()) {
      toast.error(t("api.pathRequired"))
      return
    }

    if (!path.startsWith("/")) {
      toast.error(t("api.pathInvalid"))
      return
    }

    // Validate JSON
    let parsedMockData
    try {
      parsedMockData = JSON.parse(mockData)
    } catch (error) {
      toast.error(t("api.mockDataInvalid"))
      return
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      path: path.trim(),
      method: method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      statusCode,
      mockData: parsedMockData,
      isActive,
    }

    if (apiId) {
      updateApi.mutate({ id: apiId, ...data })
    } else {
      createApi.mutate({ projectId, ...data })
    }
  }

  const isLoading = createApi.isPending || updateApi.isPending
  const isEdit = !!apiId

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            {t("common.edit")}
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("api.create")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("api.edit") : t("api.create")}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? t("api.editDescription") 
                : t("api.createDescription")
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("api.name")} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("api.namePlaceholder")}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t("api.description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("api.descriptionPlaceholder")}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="method">{t("api.method")} *</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("api.methodPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="path">{t("api.path")} *</Label>
                <Input
                  id="path"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/users"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="statusCode">{t("api.statusCode")}</Label>
              <Input
                id="statusCode"
                type="number"
                min="100"
                max="599"
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="mockData">{t("api.mockData")}</Label>
              <Textarea
                id="mockData"
                value={mockData}
                onChange={(e) => setMockData(e.target.value)}
                placeholder='{"message": "Hello World"}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="isActive">{t("api.isActive")}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("form.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
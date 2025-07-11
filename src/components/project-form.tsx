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
import { api } from "@/trpc/react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface ProjectFormProps {
  projectId?: string
  initialData?: {
    name: string
    description?: string
    baseUrl?: string
  }
  onSuccess?: () => void
}

export function ProjectForm({ projectId, initialData, onSuccess }: ProjectFormProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [baseUrl, setBaseUrl] = useState(initialData?.baseUrl || "")
  
  const utils = api.useUtils()
  
  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate()
      utils.project.getStats.invalidate()
      setOpen(false)
      resetForm()
      onSuccess?.()
      toast.success(t("form.saved"))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate()
      utils.project.getById.invalidate({ id: projectId! })
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
    setBaseUrl("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error(t("project.nameRequired"))
      return
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined,
    }

    if (projectId) {
      updateProject.mutate({ id: projectId, ...data })
    } else {
      createProject.mutate(data)
    }
  }

  const isLoading = createProject.isPending || updateProject.isPending
  const isEdit = !!projectId

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
            {t("project.create")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("project.edit") : t("project.create")}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? t("project.editDescription") 
                : t("project.createDescription")
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("project.name")} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("project.namePlaceholder")}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t("project.description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("project.descriptionPlaceholder")}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
              />
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
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { ProjectList } from "@/components/project-list";
import { ProjectForm } from "@/components/project-form";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
          <p className="text-muted-foreground">
            管理您的所有 API Mock 项目
          </p>
        </div>
        <ProjectForm />
      </div>
      
      <ProjectList />
    </div>
  );
}
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { ApiList } from "@/components/api-list";
import { ApiForm } from "@/components/api-form";
import { ProjectHeader } from "@/components/project-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string; locale: string }>
}) {
  const { projectId, locale } = await params;
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/projects`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目列表
          </Button>
        </Link>
        <ProjectHeader projectId={projectId} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          接口管理
        </h2>
        <ApiForm projectId={projectId} />
      </div>

      <ApiList projectId={projectId} />
    </div>
  );
}
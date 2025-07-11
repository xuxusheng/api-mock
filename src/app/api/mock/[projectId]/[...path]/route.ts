import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams, "PATCH");
}

async function handleApiRequest(
  request: NextRequest,
  params: { projectId: string; path: string[] },
  method: string
) {
  const { projectId, path } = params;
  const apiPath = "/" + (path || []).join("/");

  try {
    // 查找对应的API配置
    const api = await db.api.findFirst({
      where: {
        projectId: projectId,
        path: apiPath,
        method: method as any,
        isActive: true,
      },
      include: {
        project: true,
      },
    });

    if (!api) {
      return NextResponse.json(
        { error: "API not found or inactive" },
        { status: 404 }
      );
    }

    // 添加CORS头
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // 返回模拟数据
    return NextResponse.json(
      api.mockData || { message: "Hello from API Mock" },
      {
        status: api.statusCode,
        headers,
      }
    );
  } catch (error) {
    console.error("API Mock Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
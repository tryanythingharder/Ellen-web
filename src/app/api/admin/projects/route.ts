import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isProjectList } from "@/data/contentValidation";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const projectsSourcePath = path.join(process.cwd(), "src", "data", "projects.ts");

function renderProjectsSource(nextProjects: Project[]) {
  const serializedProjects = JSON.stringify(nextProjects, null, 2).replaceAll("<", "\\u003c");

  return `import type { Project } from "@/types/content";

export const projects: Project[] = ${serializedProjects};
`;
}

export function GET() {
  return NextResponse.json({
    projects,
    updatedAt: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 请求体无效。" }, { status: 400 });
  }

  const nextProjects = (body as { projects?: unknown }).projects;

  if (!isProjectList(nextProjects)) {
    return NextResponse.json({ error: "项目数据结构无效。" }, { status: 422 });
  }

  try {
    await writeFile(projectsSourcePath, renderProjectsSource(nextProjects), "utf8");
  } catch {
    return NextResponse.json({ error: "无法写入项目数据源。" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    projects: nextProjects,
    updatedAt: new Date().toISOString(),
  });
}

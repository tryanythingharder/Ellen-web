import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "管理后台",
};

export default function AdminPage() {
  return <AdminDashboard initialProjects={projects} />;
}

"use client";

import { useMemo, useState } from "react";
import {
  contentDraftChangeEvent,
  contentDraftStorageKey,
  isContentDraft,
  type ContentDraft,
} from "@/data/contentDraft";
import { isProjectList } from "@/data/contentValidation";
import type { MediaAsset, Project } from "@/types/content";
import styles from "./AdminDashboard.module.scss";

type AdminDashboardProps = {
  initialProjects: Project[];
};

type StatusTone = "neutral" | "success" | "warning" | "error";

type Status = {
  message: string;
  tone: StatusTone;
};

const mediaTypeOptions: MediaAsset["type"][] = ["image", "video", "placeholder"];
const toneOptions: Array<NonNullable<MediaAsset["tone"]> | ""> = ["", "light", "mid", "dark"];
const mediaTypeLabels: Record<MediaAsset["type"], string> = {
  image: "图片",
  placeholder: "占位",
  video: "视频",
};
const toneLabels: Record<NonNullable<MediaAsset["tone"]> | "", string> = {
  "": "自动",
  dark: "深色",
  light: "浅色",
  mid: "中性",
};

function cloneProjects(projects: Project[]) {
  return JSON.parse(JSON.stringify(projects)) as Project[];
}

function safeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createMediaItem(projectId: string, index: number, type: MediaAsset["type"] = "image"): MediaAsset {
  return {
    id: `${projectId}-media-${Date.now()}-${index}`,
    type,
    src: "",
    alt: "Managed homepage visual",
    aspectRatio: "4 / 5",
  };
}

function createProject(index: number): Project {
  const id = `managed-project-${Date.now()}`;

  return {
    id,
    slug: id,
    title: `新项目 ${index + 1}`,
    year: String(new Date().getFullYear()),
    tags: [],
    thumbnail: createMediaItem(id, 0),
    items: [createMediaItem(id, 0)],
  };
}

function readInitialProjects(initialProjects: Project[]) {
  if (typeof window === "undefined") {
    return cloneProjects(initialProjects);
  }

  try {
    const stored = window.localStorage.getItem(contentDraftStorageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : null;

    return isContentDraft(parsed) ? cloneProjects(parsed.projects) : cloneProjects(initialProjects);
  } catch {
    return cloneProjects(initialProjects);
  }
}

function dispatchDraftChange() {
  window.dispatchEvent(new Event(contentDraftChangeEvent));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);

  return nextItems;
}

export function AdminDashboard({ initialProjects }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(() => readInitialProjects(initialProjects));
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [status, setStatus] = useState<Status>({
    message: "本地编辑器已就绪。",
    tone: "neutral",
  });
  const [jsonBuffer, setJsonBuffer] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingMediaId, setUploadingMediaId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );
  const selectedProjectIndex = selectedProject
    ? projects.findIndex((project) => project.id === selectedProject.id)
    : -1;

  function setProjectList(updater: (currentProjects: Project[]) => Project[]) {
    setProjects((currentProjects) => updater(currentProjects));
    setIsDirty(true);
  }

  function updateSelectedProject(updater: (project: Project) => Project) {
    if (!selectedProject) {
      return;
    }

    setProjectList((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject.id ? updater(project) : project,
      ),
    );
  }

  function updateProjectField(
    field: keyof Pick<Project, "title" | "slug" | "year" | "subtitle">,
    value: string,
  ) {
    updateSelectedProject((project) => ({
      ...project,
      [field]: field === "slug" ? safeSlug(value) : value,
    }));
  }

  function updateTags(value: string) {
    updateSelectedProject((project) => ({
      ...project,
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }));
  }

  function updateMedia(index: number, patch: Partial<MediaAsset>) {
    updateSelectedProject((project) => ({
      ...project,
      items: project.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    }));
  }

  function addProject() {
    const nextProject = createProject(projects.length);

    setProjectList((currentProjects) => [...currentProjects, nextProject]);
    setSelectedProjectId(nextProject.id);
    setStatus({ message: "已新增项目。发布前请先补充真实媒体资源。", tone: "warning" });
  }

  function duplicateProject() {
    if (!selectedProject) {
      return;
    }

    const nextId = `${selectedProject.id}-copy-${Date.now()}`;
    const duplicatedProject: Project = {
      ...cloneProjects([selectedProject])[0],
      id: nextId,
      slug: selectedProject.slug ? `${selectedProject.slug}-copy` : nextId,
      title: `${selectedProject.title} 副本`,
      items: selectedProject.items.map((item, index) => ({
        ...item,
        id: `${nextId}-media-${index}`,
      })),
    };

    duplicatedProject.thumbnail = duplicatedProject.items[0] ?? selectedProject.thumbnail;

    setProjectList((currentProjects) => [
      ...currentProjects.slice(0, selectedProjectIndex + 1),
      duplicatedProject,
      ...currentProjects.slice(selectedProjectIndex + 1),
    ]);
    setSelectedProjectId(nextId);
  }

  function removeProject() {
    if (!selectedProject || projects.length <= 1) {
      setStatus({ message: "首页项目流至少需要保留一个项目。", tone: "warning" });
      return;
    }

    const nextProjects = projects.filter((project) => project.id !== selectedProject.id);
    setProjects(nextProjects);
    setSelectedProjectId(nextProjects[Math.max(0, selectedProjectIndex - 1)]?.id ?? "");
    setIsDirty(true);
  }

  function moveProject(direction: -1 | 1) {
    if (!selectedProject || selectedProjectIndex < 0) {
      return;
    }

    setProjectList((currentProjects) => moveItem(currentProjects, selectedProjectIndex, direction));
  }

  function addMedia(type: MediaAsset["type"] = "image") {
    updateSelectedProject((project) => ({
      ...project,
      items: [...project.items, createMediaItem(project.id, project.items.length, type)],
    }));
  }

  function removeMedia(index: number) {
    updateSelectedProject((project) => {
      const nextItems = project.items.filter((_, itemIndex) => itemIndex !== index);
      const removedItem = project.items[index];
      const thumbnail =
        project.thumbnail?.id === removedItem?.id ? nextItems[0] ?? undefined : project.thumbnail;

      return {
        ...project,
        items: nextItems,
        thumbnail,
      };
    });
  }

  function moveMedia(index: number, direction: -1 | 1) {
    updateSelectedProject((project) => ({
      ...project,
      items: moveItem(project.items, index, direction),
    }));
  }

  function promoteThumbnail(index: number) {
    updateSelectedProject((project) => ({
      ...project,
      thumbnail: project.items[index] ?? project.thumbnail,
    }));
  }

  async function uploadAsset(index: number, file: File | undefined, target: "src" | "poster") {
    if (!file) {
      return;
    }

    const media = selectedProject.items[index];

    if (!media) {
      return;
    }

    setUploadingMediaId(media.id);
    setStatus({ message: `正在上传 ${file.name}...`, tone: "neutral" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/uploads", {
        body: formData,
        method: "POST",
      });
      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok || typeof (payload as { url?: unknown }).url !== "string") {
        const message =
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "上传失败。";
        throw new Error(message);
      }

      const uploadedUrl = (payload as { url: string }).url;
      updateMedia(index, { [target]: uploadedUrl });
      setStatus({ message: "上传完成。保存草稿或发布后生效。", tone: "success" });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : "上传失败。",
        tone: "error",
      });
    } finally {
      setUploadingMediaId(null);
    }
  }

  function saveLocalDraft(message = "本地草稿已保存，首页预览会立即同步。") {
    const draft: ContentDraft = {
      projects,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(contentDraftStorageKey, JSON.stringify(draft));
    dispatchDraftChange();
    setStatus({ message, tone: "success" });
    setIsDirty(false);
  }

  async function publishSource() {
    setIsSaving(true);
    setStatus({ message: "正在发布到项目数据源...", tone: "neutral" });

    try {
      const response = await fetch("/api/admin/projects", {
        body: JSON.stringify({ projects }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "发布失败。";
        throw new Error(message);
      }

      saveLocalDraft("已发布到 src/data/projects.ts，并同步到本地预览。");
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : "发布失败。",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function reloadSource() {
    setIsSaving(true);
    setStatus({ message: "正在重新载入源码数据...", tone: "neutral" });

    try {
      const response = await fetch("/api/admin/projects", { cache: "no-store" });
      const payload: unknown = await response.json();
      const nextProjects = (payload as { projects?: unknown }).projects;

      if (!response.ok || !isProjectList(nextProjects)) {
        throw new Error("无法重新载入源码项目数据。");
      }

      window.localStorage.removeItem(contentDraftStorageKey);
      dispatchDraftChange();
      setProjects(cloneProjects(nextProjects));
      setSelectedProjectId(nextProjects[0]?.id ?? "");
      setIsDirty(false);
      setStatus({ message: "已重新载入源码数据，并清除本地草稿。", tone: "success" });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : "无法重新载入源码项目数据。",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraft() {
    window.localStorage.removeItem(contentDraftStorageKey);
    dispatchDraftChange();
    const resetProjects = cloneProjects(initialProjects);
    setProjects(resetProjects);
    setSelectedProjectId(resetProjects[0]?.id ?? "");
    setIsDirty(false);
    setStatus({ message: "本地草稿已清除，编辑器已回到页面载入时的源码数据。", tone: "success" });
  }

  function exportJson() {
    setJsonBuffer(JSON.stringify({ projects }, null, 2));
    setStatus({ message: "已在下方生成导出 JSON。", tone: "success" });
  }

  async function copyJson() {
    const value = jsonBuffer || JSON.stringify({ projects }, null, 2);

    try {
      await navigator.clipboard.writeText(value);
      setStatus({ message: "JSON 已复制到剪贴板。", tone: "success" });
    } catch {
      setJsonBuffer(value);
      setStatus({ message: "剪贴板被浏览器拦截，JSON 已保留在文本框中。", tone: "warning" });
    }
  }

  function importJson() {
    try {
      const parsed: unknown = JSON.parse(jsonBuffer);
      const nextProjects = Array.isArray(parsed)
        ? parsed
        : (parsed as { projects?: unknown }).projects;

      if (!isProjectList(nextProjects)) {
        throw new Error("JSON 必须是项目数组，或 { projects: [...] } 结构。");
      }

      const clonedProjects = cloneProjects(nextProjects);
      setProjects(clonedProjects);
      setSelectedProjectId(clonedProjects[0]?.id ?? "");
      setIsDirty(true);
      setStatus({ message: "JSON 已导入编辑器。保存草稿或发布后生效。", tone: "success" });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : "JSON 格式无效。",
        tone: "error",
      });
    }
  }

  if (!selectedProject) {
    return (
      <section className={styles.dashboard}>
        <p>暂无可管理项目。</p>
      </section>
    );
  }

  return (
    <section className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.kicker}>ELLEN 内容后台</p>
          <h1>首页资源管理</h1>
        </div>
        <p className={styles.intro}>
          管理首页项目流的项目、媒体顺序、缩略图和资源地址。
        </p>

        <div className={styles.sidebarActions}>
          <button onClick={addProject} type="button">
            新增项目
          </button>
          <button onClick={duplicateProject} type="button">
            复制项目
          </button>
        </div>

        <div className={styles.projectList}>
          {projects.map((project, index) => (
            <button
              data-active={project.id === selectedProject.id}
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              type="button"
            >
              <span>{project.title}</span>
              <small>
                {String(index + 1).padStart(2, "0")} / {project.items.length} 个媒体
              </small>
            </button>
          ))}
        </div>
      </aside>

      <main className={styles.editor}>
        <div className={styles.toolbar}>
          <span data-tone={status.tone}>
            {isDirty ? "有未保存修改。 " : ""}
            {status.message}
          </span>
          <div>
            <a href="/" target="_blank" rel="noreferrer">
              预览
            </a>
            <button disabled={isSaving} onClick={() => saveLocalDraft()} type="button">
              保存草稿
            </button>
            <button disabled={isSaving} onClick={reloadSource} type="button">
              重新载入源码
            </button>
            <button disabled={isSaving} onClick={resetDraft} type="button">
              清除草稿
            </button>
            <button data-primary disabled={isSaving} onClick={publishSource} type="button">
              发布
            </button>
          </div>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>项目</p>
              <h2>{selectedProject.title}</h2>
            </div>
            <div className={styles.headerActions}>
              <button onClick={() => moveProject(-1)} type="button">
                上移
              </button>
              <button onClick={() => moveProject(1)} type="button">
                下移
              </button>
              <button onClick={removeProject} type="button">
                删除
              </button>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <label>
              标题
              <input
                onChange={(event) => updateProjectField("title", event.target.value)}
                value={selectedProject.title}
              />
            </label>
            <label>
              路由别名
              <input
                onChange={(event) => updateProjectField("slug", event.target.value)}
                value={selectedProject.slug ?? ""}
              />
            </label>
            <label>
              年份
              <input
                onChange={(event) => updateProjectField("year", event.target.value)}
                value={selectedProject.year ?? ""}
              />
            </label>
            <label>
              标签
              <input
                onChange={(event) => updateTags(event.target.value)}
                placeholder="AI, Campaign, Stills"
                value={selectedProject.tags?.join(", ") ?? ""}
              />
            </label>
            <label className={styles.fullField}>
              副标题
              <input
                onChange={(event) => updateProjectField("subtitle", event.target.value)}
                value={selectedProject.subtitle ?? ""}
              />
            </label>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>媒体序列</p>
              <h2>首页流顺序</h2>
              <p>每一行都会成为一个视觉瓦片，这里的顺序会控制 WebGL 首页流。</p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={() => addMedia("image")} type="button">
                新增图片
              </button>
              <button onClick={() => addMedia("video")} type="button">
                新增视频
              </button>
            </div>
          </div>

          <div className={styles.mediaList}>
            {selectedProject.items.length ? (
              selectedProject.items.map((item, index) => {
                const isThumbnail = selectedProject.thumbnail?.id === item.id;

                return (
                  <article className={styles.mediaRow} key={item.id}>
                    <div className={styles.preview} data-type={item.type}>
                      {item.type === "image" && item.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt={item.alt} src={item.src} />
                      ) : null}
                      {item.type === "video" && item.src ? (
                        <video muted playsInline poster={item.poster} preload="metadata" src={item.src} />
                      ) : null}
                      {item.type === "placeholder" || !item.src ? (
                        <span>{item.type === "placeholder" ? "占位资源" : "暂无资源"}</span>
                      ) : null}
                    </div>

                    <div className={styles.mediaFields}>
                      <div className={styles.rowMeta}>
                        <span>
                          {String(index + 1).padStart(2, "0")} {isThumbnail ? "/ 缩略图" : ""}
                        </span>
                        <div>
                          <button onClick={() => moveMedia(index, -1)} type="button">
                            上移
                          </button>
                          <button onClick={() => moveMedia(index, 1)} type="button">
                            下移
                          </button>
                          <button onClick={() => promoteThumbnail(index)} type="button">
                            设为缩略图
                          </button>
                          <button onClick={() => removeMedia(index)} type="button">
                            删除
                          </button>
                        </div>
                      </div>

                      <div className={styles.mediaGrid}>
                        <label>
                          类型
                          <select
                            onChange={(event) =>
                              updateMedia(index, {
                                type: event.target.value as MediaAsset["type"],
                              })
                            }
                            value={item.type}
                          >
                            {mediaTypeOptions.map((type) => (
                              <option key={type} value={type}>
                                {mediaTypeLabels[type]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          媒体比例
                          <input
                            onChange={(event) =>
                              updateMedia(index, { aspectRatio: event.target.value })
                            }
                            placeholder="4 / 5"
                            value={item.aspectRatio ?? ""}
                          />
                        </label>
                        <label className={styles.fullField}>
                          资源地址
                          <input
                            onChange={(event) => updateMedia(index, { src: event.target.value })}
                            value={item.src ?? ""}
                          />
                        </label>
                        <label>
                          上传资源
                          <input
                            accept="image/*,video/mp4,video/webm,video/quicktime"
                            disabled={uploadingMediaId === item.id}
                            onChange={(event) => {
                              void uploadAsset(index, event.target.files?.[0], "src");
                              event.target.value = "";
                            }}
                            type="file"
                          />
                        </label>
                        <label className={styles.fullField}>
                          视频封面地址
                          <input
                            onChange={(event) => updateMedia(index, { poster: event.target.value })}
                            value={item.poster ?? ""}
                          />
                        </label>
                        <label>
                          上传封面
                          <input
                            accept="image/*"
                            disabled={uploadingMediaId === item.id}
                            onChange={(event) => {
                              void uploadAsset(index, event.target.files?.[0], "poster");
                              event.target.value = "";
                            }}
                            type="file"
                          />
                        </label>
                        <label>
                          替代文本
                          <input
                            onChange={(event) => updateMedia(index, { alt: event.target.value })}
                            value={item.alt}
                          />
                        </label>
                        <label>
                          色调
                          <select
                            onChange={(event) =>
                              updateMedia(index, {
                                tone: event.target.value
                                  ? (event.target.value as NonNullable<MediaAsset["tone"]>)
                                  : undefined,
                              })
                            }
                            value={item.tone ?? ""}
                          >
                            {toneOptions.map((tone) => (
                              <option key={tone || "auto"} value={tone}>
                                {toneLabels[tone]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={styles.fullField}>
                          说明文字
                          <input
                            onChange={(event) => updateMedia(index, { caption: event.target.value })}
                            value={item.caption ?? ""}
                          />
                        </label>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>这个项目还没有首页媒体。</p>
                <button onClick={() => addMedia("image")} type="button">
                  添加第一个媒体
                </button>
              </div>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>数据操作</p>
              <h2>导入与导出</h2>
              <p>在接入正式 CMS 之前，可用于备份、迁移或批量编辑。</p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={exportJson} type="button">
                生成 JSON
              </button>
              <button onClick={copyJson} type="button">
                复制 JSON
              </button>
              <button onClick={importJson} type="button">
                应用导入
              </button>
            </div>
          </div>
          <textarea
            className={styles.jsonBox}
            onChange={(event) => setJsonBuffer(event.target.value)}
            placeholder='在这里粘贴 { "projects": [...] } 或原始 Project[] 数组。'
            spellCheck={false}
            value={jsonBuffer}
          />
        </section>
      </main>
    </section>
  );
}

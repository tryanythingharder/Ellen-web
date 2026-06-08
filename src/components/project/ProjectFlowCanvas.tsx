"use client";

import { useEffect, useRef } from "react";
import type { MediaAsset, Project } from "@/types/content";
import styles from "./ProjectFlow.module.scss";

type ProjectFlowCanvasProps = {
  activeProjectId: string | null;
  onHoverProject: (project: Project | null, pointer?: { x: number; y: number }) => void;
  onPointerMove?: (pointer: { x: number; y: number }) => void;
  mode: "overview" | "index";
  onActivateProject: (project: Project, tileKey: string) => void;
  projects: Project[];
};

type Runtime = typeof import("three");

type PlaneRecord = {
  baseOpacity: number;
  baseScale: number;
  group: import("three").Group;
  hitMaterial: import("three").MeshBasicMaterial;
  hitMesh: import("three").Mesh<import("three").BufferGeometry, import("three").MeshBasicMaterial>;
  index: number;
  key: string;
  media: MediaAsset;
  mediaGroup: import("three").Group;
  mesh: import("three").Mesh<import("three").BufferGeometry, import("three").ShaderMaterial>;
  material: import("three").ShaderMaterial;
  project: Project;
  width: number;
};

type TileRecord = {
  key: string;
  media: MediaAsset;
  project: Project;
};

const minimumTileCount = 24;
const maximumTileCount = 36;
const tileSpacing = 0.375;
const scrollEase = 0.15;
const wheelDivisor = 42;
const maxWheelStep = 2.65;
const dragDivisor = 118;
const hoverMediaOffsetX = 0.82;
const hoverMediaOffsetY = -0.1;
const clickTravelTolerance = 8;
const hoverCheckIntervalMs = 42;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float grey = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(vec3(grey), tex.rgb, 0.72 + uHover * 0.2);
    color = mix(vec3(0.5), color, 1.08 + uHover * 0.04);
    float alpha = tex.a * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

function toRatio(aspectRatio?: string) {
  if (!aspectRatio) {
    return 1;
  }

  const [width, height] = aspectRatio.split("/").map((value) => Number(value.trim()));
  return width && height ? width / height : 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

function wrapRange(value: number, min: number, max: number) {
  return wrap(value - min, max - min) + min;
}

function buildTileDeck(projects: Project[]) {
  const projectMedia = projects
    .map((project) => {
      const media = (project.items.length ? project.items : project.thumbnail ? [project.thumbnail] : [])
        .filter((item) => item.src);

      return {
        media,
        project,
      };
    })
    .filter((entry) => entry.media.length);

  if (!projectMedia.length) {
    return [];
  }

  const woven: TileRecord[] = [];
  const maxMediaCount = Math.max(...projectMedia.map((entry) => entry.media.length));

  for (let mediaIndex = 0; mediaIndex < maxMediaCount; mediaIndex += 1) {
    for (const entry of projectMedia) {
      const media = entry.media[mediaIndex];

      if (media) {
        woven.push({
          key: `${entry.project.id}:${media.id}`,
          media,
          project: entry.project,
        });
      }
    }
  }

  const expanded: TileRecord[] = [];
  let loop = 0;

  while (expanded.length < minimumTileCount && woven.length) {
    expanded.push(
      ...woven.map((tile) => ({
        ...tile,
        key: loop ? `${tile.key}:loop-${loop}` : tile.key,
      })),
    );
    loop += 1;
  }

  const deck = expanded.length ? expanded : woven;

  return deck.slice(0, Math.max(minimumTileCount, Math.min(maximumTileCount, deck.length)));
}

export function ProjectFlowCanvas({
  activeProjectId,
  onHoverProject,
  onPointerMove,
  mode,
  onActivateProject,
  projects,
}: ProjectFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onActivateRef = useRef(onActivateProject);
  const onHoverRef = useRef(onHoverProject);
  const onPointerMoveRef = useRef(onPointerMove);
  const modeRef = useRef(mode);
  const activeProjectIdRef = useRef(activeProjectId);

  useEffect(() => {
    onActivateRef.current = onActivateProject;
  }, [onActivateProject]);

  useEffect(() => {
    onHoverRef.current = onHoverProject;
  }, [onHoverProject]);

  useEffect(() => {
    onPointerMoveRef.current = onPointerMove;
  }, [onPointerMove]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasElement = canvas;
    let disposed = false;
    let animationFrame = 0;
    let runtime: Runtime;
    let renderer: import("three").WebGLRenderer;
    let scene: import("three").Scene;
    let camera: import("three").PerspectiveCamera;
    let holder: import("three").Group;
    let planes: PlaneRecord[] = [];
    let hoveredPlane: PlaneRecord | null = null;
    let pressedPlane: PlaneRecord | null = null;
    let width = 1;
    let height = 1;
    const pointer = { x: 0, y: 0 };
    const pointerNdc = { x: -10, y: -10 };
    let raycaster: import("three").Raycaster;
    let rayPointer: import("three").Vector2;
    let hoverableMeshes: Array<import("three").Mesh<import("three").BufferGeometry, import("three").MeshBasicMaterial>> = [];
    let hoverDirty = true;
    let lastHoverCheck = 0;
    let lastHoverProjectId: string | null = null;
    const drag = {
      active: false,
      offset: 0,
      moved: false,
      smoothed: 0,
      startCurrent: 0,
      startOffset: 0,
      startX: 0,
      startY: 0,
    };
    const scroll = {
      current: 0,
      previous: 0,
      velocity: 0,
    };

    async function setup() {
      runtime = await import("three");

      if (disposed) {
        return;
      }

      renderer = new runtime.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasElement,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0xfafafa, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));

      scene = new runtime.Scene();
      holder = new runtime.Group();
      scene.add(holder);
      raycaster = new runtime.Raycaster();
      rayPointer = new runtime.Vector2(-10, -10);

      camera = new runtime.PerspectiveCamera(5, 1, 0.1, 1000);
      camera.position.set(0, 100 / 7.5, 35);
      camera.lookAt(0, 0, 0);

      await createPlanes();

      if (disposed) {
        return;
      }

      resize();
      bindEvents();
      tick();
    }

    async function createPlanes() {
      const tileDeck = buildTileDeck(projects);
      const loader = new runtime.TextureLoader();
      loader.setCrossOrigin("anonymous");

      const loadedPlanes = await Promise.all(
        tileDeck.map(
          (tile, index) =>
            new Promise<PlaneRecord | null>((resolve) => {
              const { media, project } = tile;

              if (!media?.src) {
                resolve(null);
                return;
              }

              loader.load(
                media.src,
                (texture) => {
                  texture.colorSpace = runtime.SRGBColorSpace;
                  texture.generateMipmaps = true;
                  texture.minFilter = runtime.LinearMipmapLinearFilter;
                  texture.magFilter = runtime.LinearFilter;

                  const ratio = toRatio(media.aspectRatio);
                  const imageRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
                  let planeWidth = 1.38;
                  let planeHeight = planeWidth / imageRatio;

                  if (imageRatio < 1) {
                    const portraitFactor = 1 - (1 / imageRatio - 1) * 0.23;
                    planeWidth *= clamp(portraitFactor, 0.72, 1);
                    planeHeight *= clamp(portraitFactor, 0.72, 1);
                  }

                  const geometry = new runtime.PlaneGeometry(planeWidth, planeHeight, 1, 1);
                  const hitGeometry = new runtime.PlaneGeometry(planeWidth * 1.58, planeHeight * 1.12, 1, 1);
                  const material = new runtime.ShaderMaterial({
                    depthTest: true,
                    depthWrite: true,
                    fragmentShader,
                    transparent: true,
                    uniforms: {
                      uHover: { value: 0 },
                      uOpacity: { value: 0.45 },
                      uTexture: { value: texture },
                    },
                    vertexShader,
                  });
                  const hitMaterial = new runtime.MeshBasicMaterial({
                    color: 0xffffff,
                    depthWrite: false,
                    opacity: 0,
                    transparent: true,
                  });
                  const mesh = new runtime.Mesh(geometry, material);
                  const hitMesh = new runtime.Mesh(hitGeometry, hitMaterial);
                  const group = new runtime.Group();
                  const mediaGroup = new runtime.Group();
                  const baseOpacity = clamp(0.76 + (index % 8) * 0.024, 0.72, 0.94);
                  const baseScale = clamp(0.88 + (index % 6) * 0.018, 0.84, 0.98);
                  const record: PlaneRecord = {
                    baseOpacity,
                    baseScale,
                    group,
                    hitMaterial,
                    hitMesh,
                    index,
                    key: tile.key,
                    media,
                    mediaGroup,
                    mesh,
                    material,
                    project,
                    width: planeWidth,
                  };

                  mesh.position.x = -(planeWidth - 1.32) / 2;
                  hitMesh.position.x = -(planeWidth - 1.32) / 2;
                  hitMesh.userData.record = record;
                  hitMesh.renderOrder = 10;
                  mediaGroup.add(mesh);
                  group.add(mediaGroup);
                  group.add(hitMesh);
                  group.rotation.y = -Math.PI / 6;
                  holder.add(group);
                  resolve(record);
                },
                undefined,
                () => resolve(null),
              );
            }),
        ),
      );

      planes = loadedPlanes.filter(Boolean) as PlaneRecord[];
      hoverableMeshes = planes.map((plane) => plane.hitMesh);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, 100 / 7.5, width < 640 ? 55 : 35);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }

    function bindEvents() {
      window.addEventListener("resize", resize);
      window.addEventListener("wheel", handleWheel, { passive: false });
      canvasElement.addEventListener("pointerdown", handlePointerDown);
      canvasElement.addEventListener("pointermove", handlePointerMove);
      canvasElement.addEventListener("pointerup", handlePointerUp);
      canvasElement.addEventListener("pointerleave", handlePointerLeave);
    }

    function unbindEvents() {
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", handleWheel);
      canvasElement.removeEventListener("pointerdown", handlePointerDown);
      canvasElement.removeEventListener("pointermove", handlePointerMove);
      canvasElement.removeEventListener("pointerup", handlePointerUp);
      canvasElement.removeEventListener("pointerleave", handlePointerLeave);
    }

    function handleWheel(event: WheelEvent) {
      if (modeRef.current !== "overview") {
        return;
      }

      event.preventDefault();
      const wheelStep = clamp((event.deltaY + event.deltaX) / wheelDivisor, -maxWheelStep, maxWheelStep);
      scroll.current += wheelStep;
      hoverDirty = true;
    }

    function updatePointer(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointerNdc.x = (pointer.x / rect.width) * 2 - 1;
      pointerNdc.y = -(pointer.y / rect.height) * 2 + 1;
      hoverDirty = true;
      onPointerMoveRef.current?.(pointer);
    }

    function handlePointerDown(event: PointerEvent) {
      if (modeRef.current !== "overview" || event.button !== 0) {
        return;
      }

      updatePointer(event);
      updateHover(true);
      drag.active = true;
      drag.moved = false;
      pressedPlane = hoveredPlane;
      drag.startCurrent = scroll.current;
      drag.startOffset = drag.offset;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      canvasElement.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointer(event);

      if (!drag.active || modeRef.current !== "overview") {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (Math.abs(deltaX) + Math.abs(deltaY) > clickTravelTolerance) {
        drag.moved = true;
      }

      drag.offset = drag.startOffset + deltaX - deltaY;
      scroll.current = drag.startCurrent;
      hoverDirty = true;
    }

    function handlePointerUp(event: PointerEvent) {
      if (canvasElement.hasPointerCapture(event.pointerId)) {
        canvasElement.releasePointerCapture(event.pointerId);
      }

      updatePointer(event);
      updateHover(true);

      const clickPlane = hoveredPlane ?? pressedPlane;

      if (!drag.moved && clickPlane && modeRef.current === "overview") {
        onActivateRef.current(clickPlane.project, clickPlane.key);
      }

      drag.active = false;
      pressedPlane = null;
    }

    function handlePointerLeave() {
      pointerNdc.x = -10;
      pointerNdc.y = -10;
      drag.active = false;
      pressedPlane = null;
      hoverDirty = true;
    }

    function updateHover(force = false) {
      const now = performance.now();

      if (!force && (!hoverDirty || now - lastHoverCheck < hoverCheckIntervalMs)) {
        return;
      }

      lastHoverCheck = now;
      hoverDirty = false;
      rayPointer.set(pointerNdc.x, pointerNdc.y);
      raycaster.setFromCamera(rayPointer, camera);
      const intersections = raycaster.intersectObjects(hoverableMeshes, false);
      const nextRecord = intersections.find((intersection) => {
        const record = intersection.object.userData.record as PlaneRecord | undefined;

        return record?.group.visible;
      })?.object.userData.record as PlaneRecord | undefined;
      const nextHoveredPlane = modeRef.current === "overview" ? (nextRecord ?? null) : null;
      const nextProjectId = nextHoveredPlane?.project.id ?? null;

      if (lastHoverProjectId !== nextProjectId) {
        lastHoverProjectId = nextProjectId;
        onHoverRef.current(nextHoveredPlane?.project ?? null, pointer);
      }

      hoveredPlane = nextHoveredPlane;
      canvasElement.style.cursor = drag.active ? "grabbing" : hoveredPlane ? "pointer" : "grab";
    }

    function positionPlanes() {
      const aspect = width / height;
      const virtualLength = Math.max(planes.length, minimumTileCount);
      const halfRange = (virtualLength * tileSpacing) / 2;
      const trackSlotScale = planes.length > 0 ? virtualLength / planes.length : 1;
      const activeProject = activeProjectIdRef.current;
      const isIndex = modeRef.current === "index";
      const pointerScroll = drag.smoothed / dragDivisor;
      const easedScroll = scroll.previous / 25 - pointerScroll;

      holder.scale.x += ((drag.active || activeProject || isIndex ? 0.825 : 1) - holder.scale.x) * 0.08;
      holder.scale.y = holder.scale.x;
      holder.scale.z = holder.scale.x;
      holder.position.x += ((drag.active ? 0.45 : 0.92) - holder.position.x) * 0.08;
      holder.position.y += ((drag.active ? 0.06 : 0.18) - holder.position.y) * 0.08;

      for (const plane of planes) {
        const slot = plane.index * trackSlotScale;
        const x = wrapRange(slot * tileSpacing - easedScroll, -halfRange, halfRange);
        const normalized = x / halfRange;
        const focus = clamp(1 - Math.abs(normalized) * 1.82, 0, 1);
        const z = aspect < 1 ? -x * 6 : -x * aspect * 1.5;
        const visible = z < 10.75 && z > -10.75;
        const wasVisible = plane.group.visible;
        const isActive = activeProject === plane.key;
        const isHovered = hoveredPlane?.key === plane.key;
        const targetX = isActive ? 0 : x;
        const targetZ = isActive ? 0 : z;
        const targetRotationY = isActive ? 0 : -Math.PI / 6;
        const activeEase = activeProject ? 0.12 : 1;
        const mediaOffsetX = isHovered && !isActive ? hoverMediaOffsetX : 0;
        const mediaOffsetY = isHovered && !isActive ? hoverMediaOffsetY : 0;
        const scale = plane.baseScale * 0.94 + focus * 0.09 + (isHovered || isActive ? 0.07 : 0);
        const targetOpacity = isIndex
          ? 0.08
          : activeProject && !isActive
            ? 0.08
            : clamp(plane.baseOpacity * 0.92 + focus * 0.1 + (isHovered || isActive ? 0.08 : 0), 0.44, 0.96);

        plane.group.visible = visible || isActive;
        if (plane.group.visible !== wasVisible) {
          hoverDirty = true;
        }
        plane.group.renderOrder = Math.round((targetZ + 20) * 100);
        plane.group.position.x += (targetX - plane.group.position.x) * activeEase;
        plane.group.position.y += (0 - plane.group.position.y) * activeEase;
        plane.group.position.z += (targetZ - plane.group.position.z) * activeEase;
        plane.group.rotation.x = 0;
        plane.group.rotation.y += (targetRotationY - plane.group.rotation.y) * activeEase;
        plane.group.scale.setScalar(scale);
        plane.mesh.renderOrder = Math.round((20 - targetZ) * 100);
        plane.mediaGroup.position.x += (mediaOffsetX - plane.mediaGroup.position.x) * 0.16;
        plane.mediaGroup.position.y += (mediaOffsetY - plane.mediaGroup.position.y) * 0.16;
        plane.material.uniforms.uOpacity.value +=
          (targetOpacity - plane.material.uniforms.uOpacity.value) * 0.12;
        plane.material.uniforms.uHover.value +=
          ((isHovered || isActive ? 1 : 0) - plane.material.uniforms.uHover.value) * 0.18;
      }
    }

    function tick() {
      if (disposed) {
        return;
      }

      const previous = scroll.previous;
      scroll.previous += (scroll.current - scroll.previous) * scrollEase;
      scroll.velocity = scroll.previous - previous;
      drag.smoothed += (drag.offset - drag.smoothed) * 0.1;

      updateHover();
      positionPlanes();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(tick);
    }

    setup();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      unbindEvents();

      for (const plane of planes) {
        plane.mesh.geometry.dispose();
        plane.hitMesh.geometry.dispose();
        plane.material.uniforms.uTexture.value?.dispose?.();
        plane.material.dispose();
        plane.hitMaterial.dispose();
      }

      renderer?.dispose();
    };
  }, [projects]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden={mode !== "overview"} />;
}

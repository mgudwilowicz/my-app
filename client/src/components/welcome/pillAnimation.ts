export type PillColor = {
  body: string;
  shade: string;
  band: string;
};

export type MouseState = {
  x: number;
  y: number;
  active: boolean;
};

export type CanvasDimensions = {
  width: number;
  height: number;
  dpr: number;
};

const COLORS: PillColor[] = [
  { body: "#bfe3f5", shade: "#8fc7e3", band: "#2f9bd6" },
  { body: "#c9f0e3", shade: "#9adfc6", band: "#3fbf94" },
  { body: "#ffffff", shade: "#dde9f0", band: "#5b9cd6" },
  { body: "#eaf6ff", shade: "#cfe9f7", band: "#7fb8e0" },
  { body: "#d8f3ec", shade: "#b3e6d8", band: "#4cc3a1" },
];

const DEFAULT_NUM_PILLS = 80;
const REDUCED_MOTION_NUM_PILLS = 16;
const MAX_DELTA_MS = 32;
const MAX_ANGULAR_VELOCITY = 0.012;
const MOUSE_RADIUS = 140;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function drawCapsuleShape(
  ctx: CanvasRenderingContext2D,
  color: PillColor,
  len: number,
  wid: number,
  alpha: number,
): void {
  const l = len;
  const w = wid;
  const r = w / 2;

  ctx.beginPath();
  ctx.moveTo(-l / 2 + r, -r);
  ctx.lineTo(0, -r);
  ctx.lineTo(0, r);
  ctx.lineTo(-l / 2 + r, r);
  ctx.arc(-l / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath();
  ctx.fillStyle = color.shade;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(l / 2 - r, -r);
  ctx.arc(l / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(0, r);
  ctx.closePath();
  ctx.fillStyle = color.body;
  ctx.fill();

  ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath();
  ctx.ellipse(-l * 0.12, -r * 0.4, l * 0.22, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function drawRoundShape(
  ctx: CanvasRenderingContext2D,
  color: PillColor,
  len: number,
  alpha: number,
): void {
  const r = len / 2.6;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = color.body;
  ctx.fill();

  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = color.band;
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, 0);
  ctx.lineTo(r * 0.65, 0);
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.55;
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.4, r * 0.25, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function createPillSprite(
  type: "capsule" | "round",
  color: PillColor,
  len: number,
  wid: number,
  depth: number,
  dpr: number,
): { canvas: HTMLCanvasElement; size: number } {
  const alpha = 0.55 + depth * 0.4;
  const padding = 16 * depth;
  const bounds =
    type === "capsule"
      ? { w: len + padding * 2, h: wid + padding * 2 }
      : { w: len + padding * 2, h: len + padding * 2 };
  const size = Math.ceil(Math.max(bounds.w, bounds.h));

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(size * dpr);
  canvas.height = Math.ceil(size * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { canvas, size };
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.translate(size / 2, size / 2);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(91,156,214,0.22)";
  ctx.shadowBlur = 6 * depth;
  ctx.shadowOffsetY = 2 * depth;

  if (type === "capsule") {
    drawCapsuleShape(ctx, color, len, wid, alpha);
  } else {
    drawRoundShape(ctx, color, len, alpha);
  }

  return { canvas, size };
}

export class Pill {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  len: number;
  wid: number;
  angle: number;
  ambientSpin: number;
  angularVelocity: number;
  type: "capsule" | "round";
  color: PillColor;
  depth: number;
  floatPhase: number;
  floatSpeed: number;
  pushX: number;
  pushY: number;
  sprite: HTMLCanvasElement;
  spriteSize: number;

  constructor(width: number, height: number, dpr: number) {
    this.x = rand(0, width);
    this.y = rand(0, height);
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = rand(-0.12, 0.12);
    this.vy = rand(-0.12, 0.12);
    this.len = rand(16, 28);
    this.wid = this.len * rand(0.38, 0.46);
    this.angle = rand(0, Math.PI * 2);
    this.ambientSpin = rand(-0.0012, 0.0012);
    this.angularVelocity = 0;
    this.type = Math.random() < 0.45 ? "capsule" : "round";
    this.color = COLORS[Math.floor(rand(0, COLORS.length))]!;
    this.depth = rand(0.5, 1);
    this.floatPhase = rand(0, Math.PI * 2);
    this.floatSpeed = rand(0.4, 0.9);
    this.pushX = 0;
    this.pushY = 0;

    const { canvas, size } = createPillSprite(
      this.type,
      this.color,
      this.len,
      this.wid,
      this.depth,
      dpr,
    );
    this.sprite = canvas;
    this.spriteSize = size;
  }

  update(
    elapsedMs: number,
    mouse: MouseState,
    width: number,
    height: number,
  ): void {
    const dt = Math.min(elapsedMs, MAX_DELTA_MS) / 16.667;

    this.baseX += this.vx * dt;
    this.baseY += this.vy * dt;

    if (this.baseX < -40) this.baseX = width + 40;
    if (this.baseX > width + 40) this.baseX = -40;
    if (this.baseY < -40) this.baseY = height + 40;
    if (this.baseY > height + 40) this.baseY = -40;

    const t = performance.now();
    const floatY =
      Math.sin(t * 0.001 * this.floatSpeed + this.floatPhase) * 6 * this.depth;
    const floatX =
      Math.cos(t * 0.0007 * this.floatSpeed + this.floatPhase) *
      4 *
      this.depth;

    const targetX = this.baseX + floatX;
    const targetY = this.baseY + floatY;

    if (mouse.active) {
      const dx = targetX - mouse.x;
      const dy = targetY - mouse.y;
      const distSq = dx * dx + dy * dy;
      const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS;

      if (distSq < radiusSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const influence = 1 - dist / MOUSE_RADIUS;
        const force = influence * 24 * dt;
        const nx = dx / dist;
        const ny = dy / dist;
        this.pushX += nx * force;
        this.pushY += ny * force;
        // Brief spin impulse only while the cursor is actively repelling this pill.
        this.angularVelocity += (nx - ny) * influence * 0.002 * dt;
      }
    }

    const damping = Math.pow(0.88, dt);
    this.pushX *= damping;
    this.pushY *= damping;

    const angularDamping = Math.pow(0.9, dt);
    this.angularVelocity *= angularDamping;
    this.angularVelocity = Math.max(
      -MAX_ANGULAR_VELOCITY,
      Math.min(MAX_ANGULAR_VELOCITY, this.angularVelocity),
    );

    const maxPush = 48;
    this.pushX = Math.max(-maxPush, Math.min(maxPush, this.pushX));
    this.pushY = Math.max(-maxPush, Math.min(maxPush, this.pushY));

    this.x = targetX + this.pushX;
    this.y = targetY + this.pushY;

    this.angle += (this.ambientSpin + this.angularVelocity) * dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const half = this.spriteSize / 2;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.sprite, -half, -half, this.spriteSize, this.spriteSize);
    ctx.restore();
  }
}

export function createMouseState(): MouseState {
  return { x: 0, y: 0, active: false };
}

export function getPillCount(reducedMotion: boolean): number {
  if (reducedMotion) return REDUCED_MOTION_NUM_PILLS;
  const area = window.innerWidth * window.innerHeight;
  if (area < 480_000) return 50;
  return DEFAULT_NUM_PILLS;
}

export function createPills(
  width: number,
  height: number,
  dpr: number,
  reducedMotion: boolean,
): Pill[] {
  const count = getPillCount(reducedMotion);
  const pills = Array.from(
    { length: count },
    () => new Pill(width, height, dpr),
  );
  pills.sort((a, b) => a.depth - b.depth);
  return pills;
}

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): CanvasDimensions {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { width, height, dpr };
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  pills: Pill[],
  mouse: MouseState,
  dimensions: CanvasDimensions,
  elapsedMs: number,
): void {
  ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  for (const pill of pills) {
    pill.update(elapsedMs, mouse, dimensions.width, dimensions.height);
    pill.draw(ctx);
  }
}

export function lerpMouse(
  current: MouseState,
  target: MouseState,
  factor: number,
): MouseState {
  if (!target.active) {
    return { x: current.x, y: current.y, active: false };
  }

  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
    active: true,
  };
}

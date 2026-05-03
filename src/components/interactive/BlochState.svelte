<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { DoubleSide } from 'three';
  import {
    blochAnglesToSpinor,
    jonesEllipse,
    polarizationLabel,
    fmtC,
  } from '../../lib/spinor';

  // Estado: ángulos polares en grados + fase global γ.
  let thetaDeg = $state(60);
  let phiDeg = $state(40);
  let gammaDeg = $state(0);

  const theta = $derived((thetaDeg * Math.PI) / 180);
  const phi = $derived((phiDeg * Math.PI) / 180);
  const gamma = $derived((gammaDeg * Math.PI) / 180);

  const psi = $derived(blochAnglesToSpinor(theta, phi, gamma));
  // Punto en Bloch: (sin θ cos φ, sin θ sin φ, cos θ).
  const bloch = $derived<[number, number, number]>([
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ]);

  // Cociente β/α en CP¹ (∞ cuando α = 0).
  const ratio = $derived(((): string => {
    const a = psi[0];
    const b = psi[1];
    const den = a[0] * a[0] + a[1] * a[1];
    if (den < 1e-8) return '∞';
    const re = (b[0] * a[0] + b[1] * a[1]) / den;
    const im = (b[1] * a[0] - b[0] * a[1]) / den;
    return fmtC([re, im]);
  })());

  // Quaternion que envía +ẑ → dirección de Bloch:
  // q = R_z(φ) · R_y(θ).
  const blochQuat = $derived<[number, number, number, number]>(((): [
    number,
    number,
    number,
    number,
  ] => {
    const cy = Math.cos(theta / 2);
    const sy = Math.sin(theta / 2);
    const cz = Math.cos(phi / 2);
    const sz = Math.sin(phi / 2);
    return [-sz * sy, cz * sy, cy * sz, cz * cy];
  })());

  const polarization = $derived(polarizationLabel(psi));

  // Trayectoria de la elipse de Jones (cacheada).
  const ellipsePts = $derived(jonesEllipse(psi));

  // Canvas 2D para la elipse.
  let canvas: HTMLCanvasElement;
  const drawEllipse = (pts: Array<[number, number]>): void => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.42;

    // Ejes
    ctx.strokeStyle = '#2c3140';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - R - 6, cy);
    ctx.lineTo(cx + R + 6, cy);
    ctx.moveTo(cx, cy - R - 6);
    ctx.lineTo(cx, cy + R + 6);
    ctx.stroke();

    // Etiquetas Ex / Ey
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText('Ex', cx + R + 8, cy + 4);
    ctx.fillText('Ey', cx - 12, cy - R - 10);

    // Caja de referencia |E| = 1
    ctx.strokeStyle = '#1c2030';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.setLineDash([]);

    // Elipse
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(([ex, ey], i) => {
      const px = cx + ex * R;
      const py = cy - ey * R;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();

    // Marcador de fase t=0 (la "punta" del campo en el instante inicial)
    const [ex0, ey0] = pts[0];
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(cx + ex0 * R, cy - ey0 * R, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Flecha pequeña indicando sentido de giro
    const [ex1, ey1] = pts[1];
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + ex0 * R, cy - ey0 * R);
    ctx.lineTo(cx + ex1 * R, cy - ey1 * R);
    ctx.stroke();
  };

  $effect(() => {
    drawEllipse(ellipsePts);
  });

  type Preset = { label: string; theta: number; phi: number; tag: string };
  const presets: Preset[] = [
    { label: '|+z⟩', theta: 0, phi: 0, tag: 'lineal H' },
    { label: '|−z⟩', theta: 180, phi: 0, tag: 'lineal V' },
    { label: '|+x⟩', theta: 90, phi: 0, tag: 'lineal +45°' },
    { label: '|−x⟩', theta: 90, phi: 180, tag: 'lineal −45°' },
    { label: '|+y⟩', theta: 90, phi: 90, tag: 'circular L' },
    { label: '|−y⟩', theta: 90, phi: 270, tag: 'circular R' },
  ];

  function setPreset(p: Preset) {
    thetaDeg = p.theta;
    phiDeg = p.phi;
  }

  const r = (x: number) => x.toFixed(2);
</script>

<div class="bloch-state">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[2.6, 1.8, 2.6]} fov={45} makeDefault>
        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={2.4}
          maxDistance={6}
          target={[0, 0, 0]}
        />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.55} />
      <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />

      <!-- esfera + wireframe -->
      <T.Mesh>
        <T.SphereGeometry args={[1, 48, 32]} />
        <T.MeshStandardMaterial color="#1f2937" transparent opacity={0.18} />
      </T.Mesh>
      <T.Mesh>
        <T.SphereGeometry args={[1.001, 24, 12]} />
        <T.MeshBasicMaterial color="#3f4658" wireframe />
      </T.Mesh>

      <!-- ejes -->
      {#each [
        { dir: [1, 0, 0], color: '#f87171' },
        { dir: [0, 1, 0], color: '#4ade80' },
        { dir: [0, 0, 1], color: '#60a5fa' },
      ] as ax}
        <T.Mesh
          position={[ax.dir[0] * 0.7, ax.dir[1] * 0.7, ax.dir[2] * 0.7]}
          rotation={[
            ax.dir[1] === 1 ? 0 : ax.dir[2] === 1 ? Math.PI / 2 : 0,
            ax.dir[0] === 1 ? 0 : ax.dir[2] === 1 ? 0 : Math.PI / 2,
            ax.dir[0] === 1 ? -Math.PI / 2 : 0,
          ]}
        >
          <T.CylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
          <T.MeshBasicMaterial color={ax.color} />
        </T.Mesh>
      {/each}

      <!-- Grupo orientado a la dirección de Bloch (eje local +z = punto). -->
      <T.Group quaternion={blochQuat}>
        <!-- flagpole alineado con +z mediante una rotación local -->
        <T.Group rotation.x={Math.PI / 2}>
          <T.Mesh position={[0, 0.5, 0]}>
            <T.CylinderGeometry args={[0.014, 0.014, 1, 16]} />
            <T.MeshStandardMaterial color="#7dd3fc" />
          </T.Mesh>
        </T.Group>
        <!-- punta -->
        <T.Mesh position={[0, 0, 1]}>
          <T.SphereGeometry args={[0.045, 16, 16]} />
          <T.MeshStandardMaterial
            color="#fcd34d"
            emissive="#fcd34d"
            emissiveIntensity={0.4}
          />
        </T.Mesh>
        <!-- bandera: rectángulo en el plano local xz (contiene el asta), gira con γ -->
        <T.Group position={[0, 0, 1]} rotation.z={gamma}>
          <T.Mesh position={[0.18, 0, -0.085]} rotation={[Math.PI / 2, 0, 0]}>
            <T.PlaneGeometry args={[0.34, 0.17]} />
            <T.MeshStandardMaterial
              color="#fcd34d"
              side={DoubleSide}
            />
          </T.Mesh>
          <T.Mesh position={[0.18, 0, -0.005]}>
            <T.BoxGeometry args={[0.34, 0.012, 0.012]} />
            <T.MeshStandardMaterial color="#f59e0b" />
          </T.Mesh>
        </T.Group>
      </T.Group>
    </Canvas>
  </div>

  <div class="ellipse-wrap">
    <div class="ellipse-title">Vector de Jones · campo eléctrico</div>
    <canvas bind:this={canvas}></canvas>
    <div class="ellipse-foot">
      <span>{polarization}</span>
    </div>
  </div>

  <div class="controls">
    <label class="slider">
      <span>θ <em>(polar)</em>: <strong>{thetaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="180" step="1" bind:value={thetaDeg} />
    </label>
    <label class="slider">
      <span>φ <em>(azimut)</em>: <strong>{phiDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={phiDeg} />
    </label>
    <label class="slider gamma">
      <span>
        γ <em>(fase global, no mueve el punto)</em>:
        <strong>{gammaDeg.toFixed(0)}°</strong>
      </span>
      <input type="range" min="0" max="360" step="1" bind:value={gammaDeg} />
    </label>

    <div class="presets">
      {#each presets as p}
        <button type="button" onclick={() => setPreset(p)}>
          <span class="ket">{p.label}</span>
          <span class="tag">{p.tag}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="readout">
    <div class="row">
      <span class="lbl">Bloch (x, y, z)</span>
      <span class="val mono">({r(bloch[0])}, {r(bloch[1])}, {r(bloch[2])})</span>
    </div>
    <div class="row">
      <span class="lbl">α</span>
      <span class="val mono">{fmtC(psi[0])}</span>
    </div>
    <div class="row">
      <span class="lbl">β</span>
      <span class="val mono">{fmtC(psi[1])}</span>
    </div>
    <div class="row">
      <span class="lbl">β/α (CP¹)</span>
      <span class="val mono">{ratio}</span>
    </div>
  </div>
</div>

<style>
  .bloch-state {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    grid-template-areas:
      'sphere'
      'ellipse'
      'controls'
      'readout';
  }
  @media (min-width: 760px) {
    .bloch-state {
      grid-template-columns: 1.1fr 0.9fr;
      grid-template-areas:
        'sphere ellipse'
        'controls controls'
        'readout readout';
    }
  }
  .canvas-wrap {
    grid-area: sphere;
    height: 360px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .ellipse-wrap {
    grid-area: ellipse;
    height: 360px;
    border-radius: 6px;
    background: #0a0c12;
    padding: 0.6rem;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
  .ellipse-title {
    font-size: 12px;
    color: var(--fg-mute);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .ellipse-wrap canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  .ellipse-foot {
    text-align: right;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent);
  }
  .controls {
    grid-area: controls;
    display: grid;
    gap: 0.7rem;
    grid-template-columns: 1fr 1fr;
  }
  .controls .gamma {
    grid-column: 1 / -1;
  }
  .slider {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }
  .slider em {
    color: var(--fg-mute);
    font-style: normal;
    font-size: 0.85em;
  }
  .slider input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .presets {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .presets button {
    background: #1a1f2c;
    border: 1px solid var(--rule);
    color: var(--fg);
    border-radius: 4px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: var(--font-body);
  }
  .presets button:hover {
    border-color: var(--accent);
  }
  .presets .ket {
    font-family: var(--font-mono);
    color: var(--accent);
  }
  .presets .tag {
    color: var(--fg-mute);
    font-size: 12px;
  }
  .readout {
    grid-area: readout;
    font-size: 0.9rem;
    display: grid;
    gap: 0.25rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    border-bottom: 1px dashed #2c3140;
    padding: 0.2rem 0;
  }
  .row .lbl {
    color: var(--fg-mute);
  }
  .row .val {
    font-variant-numeric: tabular-nums;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: 0.88em;
  }
</style>

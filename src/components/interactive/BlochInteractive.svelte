<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { DoubleSide, Quaternion, Vector3 } from 'three';
  import {
    spinorFromAngles,
    blochDirection,
    polarizationKind,
    polarizationEllipse,
    fmtC,
  } from '../../lib/spinor';

  // Estado de los sliders (θ polar, φ azimutal, γ fase global) en grados.
  let thetaDeg = $state(60);
  let phiDeg = $state(45);
  let gammaDeg = $state(0);

  // Animación del campo E sobre la elipse.
  let tFrac = $state(0); // 0..1, fracción del periodo
  let playing = $state(true);

  $effect(() => {
    if (!playing) return;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      tFrac = (((now - start) / 4000) % 1 + 1) % 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  });

  const theta = $derived((thetaDeg * Math.PI) / 180);
  const phi = $derived((phiDeg * Math.PI) / 180);
  const gamma = $derived((gammaDeg * Math.PI) / 180);

  const psi = $derived(spinorFromAngles(theta, phi, gamma));
  const bloch = $derived(blochDirection(psi));
  const kind = $derived(polarizationKind(psi));
  const ellipse = $derived(polarizationEllipse(psi, 128));

  // Punto sobre la esfera (Bloch direction = unit vector).
  const pointPos = $derived<[number, number, number]>([bloch[0], bloch[1], bloch[2]]);

  // Flag rotation: lo controla γ (la fase global "rota la bandera sin mover el punto").
  const flagAngleRad = $derived(gamma);

  // Orientación del flagpole: alineamos el local +Y del grupo con la dirección de Bloch.
  const UP_Y = new Vector3(0, 1, 0);
  const flagpoleQuat = $derived.by(() => {
    const t = new Vector3(pointPos[0], pointPos[1], pointPos[2]);
    if (t.lengthSq() < 1e-8) return [0, 0, 0, 1] as [number, number, number, number];
    t.normalize();
    const q = new Quaternion().setFromUnitVectors(UP_Y, t);
    return [q.x, q.y, q.z, q.w] as [number, number, number, number];
  });

  const presets: { label: string; pol: string; theta: number; phi: number }[] = [
    { label: '|+z⟩', pol: 'H', theta: 0, phi: 0 },
    { label: '|−z⟩', pol: 'V', theta: 180, phi: 0 },
    { label: '|+x⟩', pol: 'D', theta: 90, phi: 0 },
    { label: '|−x⟩', pol: 'A', theta: 90, phi: 180 },
    { label: '|+y⟩', pol: 'R', theta: 90, phi: 90 },
    { label: '|−y⟩', pol: 'L', theta: 90, phi: 270 },
  ];

  function applyPreset(p: { theta: number; phi: number }) {
    thetaDeg = p.theta;
    phiDeg = p.phi;
    gammaDeg = 0;
  }

  // Canvas de la elipse.
  let ellipseCanvas: HTMLCanvasElement | undefined = $state(undefined);

  $effect(() => {
    if (!ellipseCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = 240, h = 240;
    ellipseCanvas.width = w * dpr;
    ellipseCanvas.height = h * dpr;
    ellipseCanvas.style.width = `${w}px`;
    ellipseCanvas.style.height = `${h}px`;
    const ctx = ellipseCanvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawEllipse(ctx, w, h);
  });

  // Redibujado reactivo cuando cambia ψ o tFrac.
  $effect(() => {
    if (!ellipseCanvas) return;
    const ctx = ellipseCanvas.getContext('2d');
    if (!ctx) return;
    drawEllipse(ctx, 240, 240);
    // dependencias explícitas:
    void ellipse; void tFrac;
  });

  function drawEllipse(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.42;

    // ejes
    ctx.strokeStyle = '#2c3140';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    // círculo unitario de referencia
    ctx.strokeStyle = '#1f2532';
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
    ctx.stroke();

    // labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px ui-sans-serif';
    ctx.fillText('Eₓ', w - 18, cy - 6);
    ctx.fillText('Eᵧ', cx + 6, 14);

    // elipse trazada
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < ellipse.length; i++) {
      const [x, y] = ellipse[i];
      const px = cx + x * scale;
      const py = cy - y * scale;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // vector E animado
    const idx = Math.floor(tFrac * ellipse.length) % ellipse.length;
    const [ex, ey] = ellipse[idx];
    const tx = cx + ex * scale;
    const ty = cy - ey * scale;
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(tx, ty, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  const r = (x: number) => x.toFixed(2);

  const polLabels: Record<string, string> = {
    horizontal: 'lineal horizontal',
    vertical: 'lineal vertical',
    diagonal: 'lineal +45°',
    'anti-diagonal': 'lineal −45°',
    'right-circular': 'circular derecha',
    'left-circular': 'circular izquierda',
    elliptical: 'elíptica',
    lineal: 'lineal',
  };
</script>

<div class="bloch-interactive">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[2.6, 1.8, 2.6]} fov={45} makeDefault>
        <OrbitControls enableDamping enablePan={false} minDistance={2.4} maxDistance={6} target={[0, 0, 0]} />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.55} />
      <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />

      <T.Mesh>
        <T.SphereGeometry args={[1, 48, 32]} />
        <T.MeshStandardMaterial color="#1f2937" transparent opacity={0.18} />
      </T.Mesh>
      <T.Mesh>
        <T.SphereGeometry args={[1.001, 24, 12]} />
        <T.MeshBasicMaterial color="#3f4658" wireframe />
      </T.Mesh>

      <!-- ejes RGB + etiquetas implícitas: x=rojo (H), y=verde, z=azul -->
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
          <T.CylinderGeometry args={[0.006, 0.006, 1.4, 8]} />
          <T.MeshBasicMaterial color={ax.color} />
        </T.Mesh>
      {/each}

      <!-- flagpole + tip + flag, alineados al punto de Bloch -->
      <T.Group quaternion={flagpoleQuat}>
        <!-- pole: cilindro a lo largo de local +y, longitud 1 -->
        <T.Mesh position={[0, 0.5, 0]}>
          <T.CylinderGeometry args={[0.013, 0.013, 1, 12]} />
          <T.MeshStandardMaterial color="#7dd3fc" />
        </T.Mesh>
        <!-- punta -->
        <T.Mesh position={[0, 1, 0]}>
          <T.SphereGeometry args={[0.045, 16, 16]} />
          <T.MeshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.4} />
        </T.Mesh>
        <!-- bandera: rota a γ alrededor del flagpole (local +y) -->
        <T.Group rotation.y={flagAngleRad}>
          <T.Mesh position={[0.17, 0.92, 0]}>
            <T.PlaneGeometry args={[0.34, 0.16]} />
            <T.MeshStandardMaterial color="#fcd34d" side={DoubleSide} />
          </T.Mesh>
          <!-- borde superior -->
          <T.Mesh position={[0.17, 0.99, 0]}>
            <T.BoxGeometry args={[0.34, 0.012, 0.012]} />
            <T.MeshStandardMaterial color="#f59e0b" />
          </T.Mesh>
        </T.Group>
      </T.Group>
    </Canvas>
  </div>

  <div class="presets">
    {#each presets as p}
      <button onclick={() => applyPreset(p)} title={p.pol}>
        <span class="ket">{p.label}</span>
        <span class="pol">{p.pol}</span>
      </button>
    {/each}
  </div>

  <div class="controls-grid">
    <label class="slider">
      <span>θ (polar): <strong>{thetaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="180" step="1" bind:value={thetaDeg} />
    </label>
    <label class="slider">
      <span>φ (azimutal): <strong>{phiDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={phiDeg} />
    </label>
    <label class="slider">
      <span>γ (fase global): <strong>{gammaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={gammaDeg} />
      <small>Mueve la bandera, no el punto.</small>
    </label>
  </div>

  <div class="bottom">
    <div class="ellipse-wrap">
      <div class="ellipse-title">Polarización física</div>
      <canvas bind:this={ellipseCanvas}></canvas>
      <button class="play-toggle" onclick={() => (playing = !playing)}>
        {playing ? '❙❙ pausar' : '▶ reproducir'}
      </button>
    </div>
    <div class="readout">
      <div class="row"><span class="lbl">α</span><span class="val mono">{fmtC(psi[0])}</span></div>
      <div class="row"><span class="lbl">β</span><span class="val mono">{fmtC(psi[1])}</span></div>
      <div class="row"><span class="lbl">Bloch</span><span class="val">({r(bloch[0])}, {r(bloch[1])}, {r(bloch[2])})</span></div>
      <div class="row"><span class="lbl">Tipo</span><span class="val">{polLabels[kind]}</span></div>
    </div>
  </div>
</div>

<style>
  .bloch-interactive {
    display: grid;
    gap: 1rem;
  }
  .canvas-wrap {
    height: 360px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .presets {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.4rem;
  }
  @media (max-width: 520px) {
    .presets { grid-template-columns: repeat(3, 1fr); }
  }
  .presets button {
    background: #1a1f2c;
    color: var(--fg);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.5rem 0.25rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
  }
  .presets button:hover {
    border-color: var(--accent);
  }
  .presets button .ket {
    font-family: var(--font-mono);
    font-size: 0.95em;
  }
  .presets button .pol {
    font-size: 0.7em;
    color: var(--fg-mute);
  }
  .controls-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  @media (min-width: 600px) {
    .controls-grid { grid-template-columns: 1fr 1fr 1fr; }
  }
  .slider {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.92rem;
  }
  .slider input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .slider small {
    color: var(--fg-mute);
    font-size: 0.78em;
  }
  .bottom {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 600px) {
    .bottom { grid-template-columns: 240px 1fr; align-items: start; }
  }
  .ellipse-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .ellipse-title {
    color: var(--fg-mute);
    font-size: 0.85rem;
  }
  .ellipse-wrap canvas {
    background: #0a0c12;
    border-radius: 4px;
  }
  .play-toggle {
    background: transparent;
    color: var(--fg-mute);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .readout {
    display: grid;
    gap: 0.25rem;
    align-content: start;
    font-size: 0.9rem;
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
    text-align: right;
  }
  .mono { font-family: var(--font-mono); font-size: 0.88em; }
</style>

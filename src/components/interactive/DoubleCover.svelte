<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { Quaternion, Vector3 } from 'three';

  type Axis = 'x' | 'y' | 'z';
  let axis = $state<Axis>('z');
  let thetaDeg = $state(0);

  const theta = $derived((thetaDeg * Math.PI) / 180);
  const half = $derived(theta / 2);
  const a = $derived(Math.cos(half));
  const s = $derived(Math.sin(half));
  const ax: [number, number, number] = $derived(
    axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1],
  );
  // Quaternion (a, b, c, d) — vector part (b, c, d) = sin(θ/2)·n̂
  const q = $derived<[number, number, number, number]>([
    a,
    s * ax[0],
    s * ax[1],
    s * ax[2],
  ]);
  // Posición a graficar dentro de la bola.
  const pos: [number, number, number] = $derived([q[1], q[2], q[3]]);

  // Color del punto: interpola entre azul (a=+1), verde (a=0), rojo (a=-1).
  const pointColor = $derived.by(() => {
    const t = a; // -1..+1
    if (t > 0) {
      // Azul -> verde
      const k = t;
      const r = Math.round((1 - k) * 0x4a);
      const g = Math.round((1 - k) * 0xde + k * 0x7d);
      const b = Math.round((1 - k) * 0x80 + k * 0xd3);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Verde -> rojo
      const k = -t;
      const r = Math.round((1 - k) * 0x4a + k * 0xf8);
      const g = Math.round((1 - k) * 0xde + k * 0x71);
      const b = Math.round((1 - k) * 0x80 + k * 0x71);
      return `rgb(${r}, ${g}, ${b})`;
    }
  });

  // Cubo físico: cuaternión rotacional.
  const cubeQuat = $derived<[number, number, number, number]>([q[1], q[2], q[3], q[0]]);

  // Etiqueta del estado: +q (a > 0), -q (a < 0), o ecuador (a ≈ 0).
  const sideLabel = $derived(
    Math.abs(a) < 0.02
      ? 'ecuador (a = 0)'
      : a > 0
        ? `+q (a = ${a.toFixed(2)})`
        : `−q (a = ${a.toFixed(2)})`,
  );

  const r = (x: number) => x.toFixed(2);
</script>

<div class="dc-root">
  <div class="grid">
    <div class="canvas-block">
      <div class="caption">Cuaternión sobre S³ (proyectado a la bola unidad)</div>
      <div class="canvas-wrap">
        <Canvas>
          <T.PerspectiveCamera position={[2.5, 1.6, 2.5]} fov={45} makeDefault>
            <OrbitControls enableDamping enablePan={false} minDistance={2.2} maxDistance={6} target={[0, 0, 0]} />
          </T.PerspectiveCamera>
          <T.AmbientLight intensity={0.55} />
          <T.DirectionalLight position={[4, 6, 3]} intensity={1.0} />

          <!-- bola unidad -->
          <T.Mesh>
            <T.SphereGeometry args={[1, 36, 24]} />
            <T.MeshStandardMaterial color="#1a2230" transparent opacity={0.1} />
          </T.Mesh>
          <T.Mesh>
            <T.SphereGeometry args={[1.001, 18, 9]} />
            <T.MeshBasicMaterial color="#2c3140" wireframe />
          </T.Mesh>

          <!-- ejes -->
          {#each [
            { dir: [1, 0, 0], color: '#f87171' },
            { dir: [0, 1, 0], color: '#4ade80' },
            { dir: [0, 0, 1], color: '#60a5fa' },
          ] as eje}
            <T.Mesh
              position={[eje.dir[0] * 0.6, eje.dir[1] * 0.6, eje.dir[2] * 0.6]}
              rotation={[
                eje.dir[1] === 1 ? 0 : eje.dir[2] === 1 ? Math.PI / 2 : 0,
                eje.dir[0] === 1 ? 0 : eje.dir[2] === 1 ? 0 : Math.PI / 2,
                eje.dir[0] === 1 ? -Math.PI / 2 : 0,
              ]}
            >
              <T.CylinderGeometry args={[0.005, 0.005, 1.2, 8]} />
              <T.MeshBasicMaterial color={eje.color} />
            </T.Mesh>
          {/each}

          <!-- diámetro a lo largo del eje seleccionado -->
          <T.Mesh
            position={[ax[0] * 0, ax[1] * 0, ax[2] * 0]}
            rotation={[
              axis === 'y' ? 0 : axis === 'z' ? Math.PI / 2 : 0,
              axis === 'x' ? 0 : 0,
              axis === 'x' ? -Math.PI / 2 : 0,
            ]}
          >
            <T.CylinderGeometry args={[0.004, 0.004, 2.0, 6]} />
            <T.MeshBasicMaterial color="#475569" />
          </T.Mesh>

          <!-- punto en S³ -->
          <T.Mesh position={pos}>
            <T.SphereGeometry args={[0.07, 24, 24]} />
            <T.MeshStandardMaterial
              color={pointColor}
              emissive={pointColor}
              emissiveIntensity={0.5}
            />
          </T.Mesh>
        </Canvas>
      </div>
    </div>

    <div class="canvas-block">
      <div class="caption">Cubo físico bajo SO(3)</div>
      <div class="canvas-wrap">
        <Canvas>
          <T.PerspectiveCamera position={[2.4, 1.8, 2.4]} fov={45} makeDefault>
            <OrbitControls enableDamping enablePan={false} minDistance={2.4} maxDistance={6} target={[0, 0, 0]} />
          </T.PerspectiveCamera>
          <T.AmbientLight intensity={0.6} />
          <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />
          <T.DirectionalLight position={[-3, -2, -4]} intensity={0.4} />

          <!-- ejes de referencia -->
          {#each [
            { dir: [1, 0, 0], color: '#f87171' },
            { dir: [0, 1, 0], color: '#4ade80' },
            { dir: [0, 0, 1], color: '#60a5fa' },
          ] as eje}
            <T.Mesh
              position={[eje.dir[0] * 0.85, eje.dir[1] * 0.85, eje.dir[2] * 0.85]}
              rotation={[
                eje.dir[1] === 1 ? 0 : eje.dir[2] === 1 ? Math.PI / 2 : 0,
                eje.dir[0] === 1 ? 0 : eje.dir[2] === 1 ? 0 : Math.PI / 2,
                eje.dir[0] === 1 ? -Math.PI / 2 : 0,
              ]}
            >
              <T.CylinderGeometry args={[0.005, 0.005, 1.7, 8]} />
              <T.MeshBasicMaterial color={eje.color} />
            </T.Mesh>
          {/each}

          <T.Group quaternion={cubeQuat}>
            <T.Mesh>
              <T.BoxGeometry args={[0.95, 0.95, 0.95]} />
              <T.MeshStandardMaterial color="#fcd34d" metalness={0.2} roughness={0.55} />
            </T.Mesh>
            <!-- marca de orientación: una flecha pequeña en una cara -->
            <T.Mesh position={[0, 0, 0.49]}>
              <T.ConeGeometry args={[0.16, 0.32, 16]} />
              <T.MeshStandardMaterial color="#3a1e1e" />
            </T.Mesh>
          </T.Group>
        </Canvas>
      </div>
    </div>
  </div>

  <div class="controls">
    <div class="axis-row">
      <span class="lbl">Eje de rotación n̂:</span>
      <div class="btn-group">
        {#each ['x', 'y', 'z'] as A}
          <button class:active={axis === A} onclick={() => (axis = A as Axis)}>{A}</button>
        {/each}
      </div>
    </div>
    <label class="slider">
      <span>θ: <strong>{thetaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="720" step="1" bind:value={thetaDeg} />
      <div class="ticks">
        <span>0°</span><span>360°</span><span>720°</span>
      </div>
    </label>
  </div>

  <div class="readout">
    <div class="row"><span class="lbl">q = (a, b, c, d)</span><span class="val mono">({r(q[0])}, {r(q[1])}, {r(q[2])}, {r(q[3])})</span></div>
    <div class="row"><span class="lbl">|sin(θ/2)|</span><span class="val">{Math.abs(s).toFixed(2)} (radio en la bola)</span></div>
    <div class="row"><span class="lbl">Posición en S³</span><span class="val">{sideLabel}</span></div>
    <div class="row"><span class="lbl">Rotación SO(3)</span><span class="val">θ mod 360° = <strong>{(((thetaDeg % 360) + 360) % 360).toFixed(0)}°</strong></span></div>
  </div>

  <div class="legend">
    <strong>Lectura.</strong> Mueve el slider de 0° a 720° y observa: en θ = 360° el cubo
    vuelve a su sitio (SO(3) ha cerrado un lazo), pero el punto en la bola está al fondo
    (a = −1, color rojo): es el antípoda en S³, distinto de la identidad. Solo en θ = 720°
    el punto vuelve también al inicio (color azul). Esa diferencia es el doble cubrimiento.
  </div>
</div>

<style>
  .dc-root {
    display: grid;
    gap: 1rem;
  }
  .grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 720px) {
    .grid { grid-template-columns: 1fr 1fr; }
  }
  .canvas-block {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .caption {
    color: var(--fg-mute);
    font-size: 0.82rem;
  }
  .canvas-wrap {
    height: 280px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .controls {
    display: grid;
    gap: 0.7rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 600px) {
    .controls { grid-template-columns: auto 1fr; align-items: center; }
  }
  .axis-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.92rem;
  }
  .axis-row .lbl { color: var(--fg-mute); }
  .btn-group {
    display: inline-flex;
    border: 1px solid var(--rule);
    border-radius: 4px;
    overflow: hidden;
  }
  .btn-group button {
    background: #1a1f2c;
    color: var(--fg);
    border: 0;
    padding: 0.35rem 0.8rem;
    font-family: var(--font-mono);
    cursor: pointer;
    border-right: 1px solid var(--rule);
  }
  .btn-group button:last-child { border-right: 0; }
  .btn-group button.active {
    background: var(--rule);
    color: var(--accent);
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
  .ticks {
    display: flex;
    justify-content: space-between;
    color: var(--fg-mute);
    font-size: 12px;
    font-family: var(--font-mono);
  }
  .readout {
    display: grid;
    gap: 0.25rem;
    font-size: 0.9rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    border-bottom: 1px dashed #2c3140;
    padding: 0.2rem 0;
  }
  .row .lbl { color: var(--fg-mute); }
  .row .val { font-variant-numeric: tabular-nums; }
  .mono { font-family: var(--font-mono); font-size: 0.88em; }
  .legend {
    border-left: 3px solid var(--accent);
    padding: 0.5rem 0.75rem;
    background: #0e1622;
    border-radius: 0 4px 4px 0;
    color: #cbd5e1;
    font-size: 0.92rem;
  }
</style>

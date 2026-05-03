<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { DoubleSide } from 'three';
  import { rotZ, blochDirection, fmtC, type Spinor } from '../../lib/spinor';

  let thetaDeg = $state(0);

  // ψ₀ = |+x⟩ = (1, 1) / √2  (estado real, fácil de seguir)
  const psi0: Spinor = [
    [1 / Math.SQRT2, 0],
    [1 / Math.SQRT2, 0],
  ];

  const psi = $derived(rotZ(psi0, (thetaDeg * Math.PI) / 180));
  const bloch = $derived(blochDirection(psi));
  // El espinor "rota" a θ/2; tras 360° físicos su componente real cambia de signo.
  const signFlipped = $derived(thetaDeg > 180 && thetaDeg <= 540);

  const phaseAngleRad = $derived((thetaDeg * Math.PI) / 180);
  const flagAngleRad = $derived(((thetaDeg / 2) * Math.PI) / 180);

  const r = (x: number) => x.toFixed(2);
</script>

<div class="bloch-widget">
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

      <!-- esfera traslúcida -->
      <T.Mesh>
        <T.SphereGeometry args={[1, 48, 32]} />
        <T.MeshStandardMaterial color="#1f2937" transparent opacity={0.18} />
      </T.Mesh>
      <!-- malla wireframe encima -->
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
          <T.CylinderGeometry args={[0.006, 0.006, 1.4, 8]} />
          <T.MeshBasicMaterial color={ax.color} />
        </T.Mesh>
      {/each}

      <!-- flagpole + flag, rotando alrededor de z al ángulo θ -->
      <T.Group rotation.z={phaseAngleRad}>
        <!-- flagpole (cilindro a lo largo de +x, longitud 1) -->
        <T.Mesh position={[0.5, 0, 0]} rotation.z={-Math.PI / 2}>
          <T.CylinderGeometry args={[0.014, 0.014, 1, 16]} />
          <T.MeshStandardMaterial color="#7dd3fc" />
        </T.Mesh>
        <!-- punta -->
        <T.Mesh position={[1, 0, 0]}>
          <T.SphereGeometry args={[0.045, 16, 16]} />
          <T.MeshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.4} />
        </T.Mesh>
        <!-- flag: rectángulo unido a la punta, rota a θ/2 alrededor del flagpole (local +x) -->
        <T.Group position={[1, 0, 0]} rotation.x={flagAngleRad}>
          <T.Mesh position={[-0.18, 0.085, 0]}>
            <T.PlaneGeometry args={[0.34, 0.17]} />
            <T.MeshStandardMaterial color="#fcd34d" side={DoubleSide} />
          </T.Mesh>
          <!-- borde superior para acentuar la orientación -->
          <T.Mesh position={[-0.18, 0.165, 0]}>
            <T.BoxGeometry args={[0.34, 0.012, 0.012]} />
            <T.MeshStandardMaterial color="#f59e0b" />
          </T.Mesh>
        </T.Group>
      </T.Group>
    </Canvas>
  </div>

  <div class="controls">
    <label class="slider">
      <span>θ <em>(rotación física)</em>: <strong>{thetaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="720" step="1" bind:value={thetaDeg} />
      <div class="ticks">
        <span>0°</span><span>360°</span><span>720°</span>
      </div>
    </label>

    <div class="readout">
      <div class="row">
        <span class="lbl">Ángulo del espinor (θ/2)</span>
        <span class="val">{(thetaDeg / 2).toFixed(0)}°</span>
      </div>
      <div class="row">
        <span class="lbl">Dirección de Bloch</span>
        <span class="val">({r(bloch[0])}, {r(bloch[1])}, {r(bloch[2])})</span>
      </div>
      <div class="row">
        <span class="lbl">α</span>
        <span class="val mono">{fmtC(psi[0])}</span>
      </div>
      <div class="row">
        <span class="lbl">β</span>
        <span class="val mono">{fmtC(psi[1])}</span>
      </div>
      <div class="row sign-row">
        <span class="lbl">Signo del espinor</span>
        <span class="val sign-badge" class:flipped={signFlipped}>{signFlipped ? '−' : '+'}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .bloch-widget {
    display: grid;
    gap: 1rem;
  }
  .canvas-wrap {
    height: 380px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .controls {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 600px) {
    .controls {
      grid-template-columns: 1fr 1fr;
    }
  }
  .slider {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.95rem;
  }
  .slider em {
    color: var(--fg-mute);
    font-style: normal;
    font-size: 0.85em;
  }
  .slider input[type='range'] {
    width: 100%;
    height: 28px;
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
    font-size: 0.9rem;
    display: grid;
    gap: 0.25rem;
    align-content: start;
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
  .sign-row .sign-badge {
    display: inline-block;
    min-width: 1.6em;
    padding: 0 0.4em;
    text-align: center;
    border-radius: 3px;
    background: #1e3a23;
    color: #86efac;
    font-weight: 700;
  }
  .sign-row .sign-badge.flipped {
    background: #3a1e1e;
    color: #fca5a5;
  }
</style>

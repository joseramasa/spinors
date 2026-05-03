<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { Quaternion, Vector3 } from 'three';
  import katex from 'katex';
  import {
    spinorFromAngles,
    blochDirection,
    rotZ,
    pauliMatrix,
    outerProduct,
    sandwichRotZ,
    type Spinor,
    type Complex,
  } from '../../lib/spinor';

  let thetaDeg = $state(60);
  let phiDeg = $state(40);
  let thetaRotDeg = $state(0);

  const theta = $derived((thetaDeg * Math.PI) / 180);
  const phi = $derived((phiDeg * Math.PI) / 180);
  const thetaRot = $derived((thetaRotDeg * Math.PI) / 180);

  // Estado inicial, sin rotación.
  const psi0 = $derived(spinorFromAngles(theta, phi));
  const v0 = $derived(blochDirection(psi0));
  const V0 = $derived(pauliMatrix(v0));

  // Tras aplicar la rotación.
  const psi: Spinor = $derived(rotZ(psi0, thetaRot));
  const V = $derived(sandwichRotZ(V0, thetaRot));
  const v = $derived(blochDirection(psi));
  const ppd = $derived(outerProduct(psi));

  const signFlipped = $derived(thetaRotDeg > 180 && thetaRotDeg <= 540);

  const UP_Y = new Vector3(0, 1, 0);
  const arrowQuat = $derived.by(() => {
    const t = new Vector3(v[0], v[1], v[2]);
    if (t.lengthSq() < 1e-8) return [0, 0, 0, 1] as [number, number, number, number];
    t.normalize();
    const q = new Quaternion().setFromUnitVectors(UP_Y, t);
    return [q.x, q.y, q.z, q.w] as [number, number, number, number];
  });

  // KaTeX helpers
  function fmtCTeX(c: Complex, prec = 2): string {
    const r = c[0].toFixed(prec);
    const i = c[1];
    if (Math.abs(i) < 10 ** -prec) return r;
    const sign = i >= 0 ? '+' : '-';
    return `${r}\\,${sign}\\,${Math.abs(i).toFixed(prec)}i`;
  }
  function tex2x2(M: [Complex, Complex, Complex, Complex]): string {
    return `\\begin{pmatrix}${fmtCTeX(M[0])} & ${fmtCTeX(M[1])} \\\\ ${fmtCTeX(M[2])} & ${fmtCTeX(M[3])}\\end{pmatrix}`;
  }
  function texCol(psi: Spinor): string {
    return `\\begin{pmatrix}${fmtCTeX(psi[0])} \\\\ ${fmtCTeX(psi[1])}\\end{pmatrix}`;
  }
  const tex = (s: string) =>
    katex.renderToString(s, { displayMode: true, throwOnError: false });

  const r = (x: number) => x.toFixed(2);
</script>

<div class="widget-root">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[2.6, 1.8, 2.6]} fov={45} makeDefault>
        <OrbitControls enableDamping enablePan={false} minDistance={2.4} maxDistance={6} target={[0, 0, 0]} />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.55} />
      <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />

      <!-- esfera de referencia -->
      <T.Mesh>
        <T.SphereGeometry args={[1, 36, 24]} />
        <T.MeshStandardMaterial color="#1f2937" transparent opacity={0.1} />
      </T.Mesh>
      <T.Mesh>
        <T.SphereGeometry args={[1.001, 16, 8]} />
        <T.MeshBasicMaterial color="#2c3140" wireframe />
      </T.Mesh>

      <!-- ejes RGB -->
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

      <!-- flecha v -->
      <T.Group quaternion={arrowQuat}>
        <T.Mesh position={[0, 0.42, 0]}>
          <T.CylinderGeometry args={[0.022, 0.022, 0.85, 16]} />
          <T.MeshStandardMaterial color="#fcd34d" />
        </T.Mesh>
        <T.Mesh position={[0, 0.92, 0]}>
          <T.ConeGeometry args={[0.06, 0.16, 16]} />
          <T.MeshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.3} />
        </T.Mesh>
      </T.Group>
    </Canvas>
  </div>

  <div class="controls-grid">
    <label class="slider">
      <span>θ inicial: <strong>{thetaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="180" step="1" bind:value={thetaDeg} />
    </label>
    <label class="slider">
      <span>φ inicial: <strong>{phiDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={phiDeg} />
    </label>
    <label class="slider">
      <span>θ<sub>rot</sub> alrededor de z: <strong>{thetaRotDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="720" step="1" bind:value={thetaRotDeg} />
      <small>v rota con sandwich; ψ rota con U a la mitad de velocidad.</small>
    </label>
  </div>

  <div class="math-grid">
    <div class="cell">
      <div class="lbl">v en R³</div>
      <div class="val">({r(v[0])}, {r(v[1])}, {r(v[2])})</div>
    </div>
    <div class="cell">
      <div class="lbl">ψ ∈ C²</div>
      <div class="tex">{@html tex(`\\psi = ${texCol(psi)}`)}</div>
    </div>
    <div class="cell">
      <div class="lbl">V = x σ_x + y σ_y + z σ_z</div>
      <div class="tex">{@html tex(`V = ${tex2x2(V)}`)}</div>
    </div>
    <div class="cell">
      <div class="lbl">ψψ† (rango 1)</div>
      <div class="tex">{@html tex(`\\psi\\psi^{\\dagger} = ${tex2x2(ppd)}`)}</div>
    </div>
    <div class="cell sign">
      <div class="lbl">Signo de ψ relativo al inicial</div>
      <div class="val">
        <span class="badge" class:flipped={signFlipped}>{signFlipped ? '−' : '+'}</span>
        <small>v vuelve cada 360°; ψ cada 720°.</small>
      </div>
    </div>
    <div class="cell">
      <div class="lbl">Identidad clave</div>
      <div class="tex">{@html tex(`\\psi\\psi^{\\dagger} = \\tfrac{1}{2}(I + V)`)}</div>
      <small>Comprueba: las cuatro entradas de ψψ† arriba deben ser ½(I + V).</small>
    </div>
  </div>
</div>

<style>
  .widget-root {
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
  .controls-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
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
  .math-grid {
    display: grid;
    gap: 0.6rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 720px) {
    .math-grid { grid-template-columns: 1fr 1fr; }
  }
  .cell {
    background: #11151e;
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.55rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .cell .lbl {
    color: var(--fg-mute);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cell .val {
    font-family: var(--font-mono);
    font-size: 1rem;
  }
  .cell .tex :global(.katex-display) {
    margin: 0.1rem 0;
    overflow-x: auto;
  }
  .cell.sign .badge {
    display: inline-block;
    min-width: 1.6em;
    padding: 0 0.4em;
    margin-right: 0.4rem;
    text-align: center;
    border-radius: 3px;
    background: #1e3a23;
    color: #86efac;
    font-weight: 700;
    font-size: 1.1em;
  }
  .cell.sign .badge.flipped {
    background: #3a1e1e;
    color: #fca5a5;
  }
  .cell small {
    color: var(--fg-mute);
    font-size: 0.78em;
  }
</style>

<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import katex from 'katex';
  import {
    sl2cMatrix,
    applyMatrix,
    normalize,
    blochDirection,
    fmtC,
    type Complex,
    type Spinor,
  } from '../../lib/spinor';

  type Axis = 'x' | 'y' | 'z';
  let axisName = $state<Axis>('x');
  let betaDeg = $state(0); // rotación
  let alpha = $state(0); // rapidez

  const axis: [number, number, number] = $derived(
    axisName === 'x' ? [1, 0, 0] : axisName === 'y' ? [0, 1, 0] : [0, 0, 1],
  );
  const beta = $derived((betaDeg * Math.PI) / 180);

  // Estado inicial fijo: |+z⟩
  const psi0: Spinor = [
    [1, 0],
    [0, 0],
  ];

  // L: ψ_L = (A†)⁻¹ ψ₀ = exp((−α − iβ)/2 σ·n̂) ψ₀ ;  R: ψ_R = A ψ₀
  // Convención estándar: bajo boost α en +n̂, L decrece y R crece sobre el
  // autoestado de σ·n̂ con autovalor +1 (M5).
  const A_L = $derived(sl2cMatrix(-alpha, beta, axis));
  const A_R = $derived(sl2cMatrix(alpha, beta, axis));

  const psi_L_raw = $derived(applyMatrix(A_L, psi0));
  const psi_R_raw = $derived(applyMatrix(A_R, psi0));

  const psi_L_norm = $derived(normalize(psi_L_raw));
  const psi_R_norm = $derived(normalize(psi_R_raw));

  // Posiciones en la esfera
  const blochL = $derived(blochDirection(psi_L_norm));
  const blochR = $derived(blochDirection(psi_R_norm));

  // Helpers de presentación
  const r = (x: number) => x.toFixed(2);
  function fmtCTeX(c: Complex, prec = 2): string {
    const re = c[0].toFixed(prec);
    const i = c[1];
    if (Math.abs(i) < 10 ** -prec) return re;
    const sign = i >= 0 ? '+' : '-';
    return `${re}\\,${sign}\\,${Math.abs(i).toFixed(prec)}i`;
  }
  function texCol(psi: Spinor): string {
    return `\\begin{pmatrix}${fmtCTeX(psi[0])} \\\\ ${fmtCTeX(psi[1])}\\end{pmatrix}`;
  }
  function texDirac(L: Spinor, R: Spinor): string {
    return `\\begin{pmatrix}${fmtCTeX(L[0])} \\\\ ${fmtCTeX(L[1])} \\\\ ${fmtCTeX(R[0])} \\\\ ${fmtCTeX(R[1])}\\end{pmatrix}`;
  }
  const tex = (s: string) =>
    katex.renderToString(s, { displayMode: true, throwOnError: false });

  function reset() {
    betaDeg = 0;
    alpha = 0;
  }

  const separated = $derived(Math.abs(alpha) > 0.02);
</script>

<div class="st-root">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[2.6, 1.8, 2.6]} fov={45} makeDefault>
        <OrbitControls enableDamping enablePan={false} minDistance={2.4} maxDistance={6} target={[0, 0, 0]} />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.55} />
      <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />

      <T.Mesh>
        <T.SphereGeometry args={[1, 36, 24]} />
        <T.MeshStandardMaterial color="#1f2937" transparent opacity={0.16} />
      </T.Mesh>
      <T.Mesh>
        <T.SphereGeometry args={[1.001, 18, 9]} />
        <T.MeshBasicMaterial color="#3f4658" wireframe />
      </T.Mesh>

      {#each [
        { dir: [1, 0, 0], color: '#f87171' },
        { dir: [0, 1, 0], color: '#4ade80' },
        { dir: [0, 0, 1], color: '#60a5fa' },
      ] as eje}
        <T.Mesh
          position={[eje.dir[0] * 0.7, eje.dir[1] * 0.7, eje.dir[2] * 0.7]}
          rotation={[
            eje.dir[1] === 1 ? 0 : eje.dir[2] === 1 ? Math.PI / 2 : 0,
            eje.dir[0] === 1 ? 0 : eje.dir[2] === 1 ? 0 : Math.PI / 2,
            eje.dir[0] === 1 ? -Math.PI / 2 : 0,
          ]}
        >
          <T.CylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
          <T.MeshBasicMaterial color={eje.color} />
        </T.Mesh>
      {/each}

      <!-- Eje de transformación n̂ resaltado -->
      <T.Mesh
        position={[axis[0] * 0, axis[1] * 0, axis[2] * 0]}
        rotation={[
          axisName === 'y' ? 0 : axisName === 'z' ? Math.PI / 2 : 0,
          axisName === 'x' ? 0 : 0,
          axisName === 'x' ? -Math.PI / 2 : 0,
        ]}
      >
        <T.CylinderGeometry args={[0.003, 0.003, 2.2, 6]} />
        <T.MeshBasicMaterial color="#a3a3a3" transparent opacity={0.6} />
      </T.Mesh>

      <!-- L: ligeramente menor para ver siempre R debajo cuando coinciden -->
      <T.Mesh position={blochL}>
        <T.SphereGeometry args={[0.06, 24, 24]} />
        <T.MeshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.45} />
      </T.Mesh>
      <T.Mesh position={blochR}>
        <T.SphereGeometry args={[0.075, 24, 24]} />
        <T.MeshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.35} transparent opacity={0.8} />
      </T.Mesh>
    </Canvas>
  </div>

  <div class="legend-row">
    <div class="legend-item"><span class="dot l"></span> L (magenta)</div>
    <div class="legend-item"><span class="dot r"></span> R (cian)</div>
    <div class="legend-item">{separated ? 'separados' : 'coincidiendo'}</div>
  </div>

  <div class="controls">
    <div class="axis-row">
      <span class="lbl">Eje n̂:</span>
      <div class="btn-group">
        {#each ['x', 'y', 'z'] as A}
          <button class:active={axisName === A} onclick={() => (axisName = A as Axis)}>{A}</button>
        {/each}
      </div>
      <button class="reset" onclick={reset}>reset</button>
    </div>
    <label class="slider">
      <span>β (rotación): <strong>{betaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={betaDeg} />
      <small>Mueve L y R juntos.</small>
    </label>
    <label class="slider">
      <span>α (rapidez del boost): <strong>{alpha.toFixed(2)}</strong></span>
      <input type="range" min="-2" max="2" step="0.02" bind:value={alpha} />
      <small>Empuja L hacia −n̂ y R hacia +n̂.</small>
    </label>
  </div>

  <div class="readout-grid">
    <div class="cell">
      <div class="lbl">ψ_L = (A†)⁻¹ ψ₀</div>
      <div class="tex">{@html tex(`\\psi_L = ${texCol(psi_L_raw)}`)}</div>
    </div>
    <div class="cell">
      <div class="lbl">ψ_R = A ψ₀</div>
      <div class="tex">{@html tex(`\\psi_R = ${texCol(psi_R_raw)}`)}</div>
    </div>
    <div class="cell">
      <div class="lbl">Bloch L</div>
      <div class="val">({r(blochL[0])}, {r(blochL[1])}, {r(blochL[2])})</div>
    </div>
    <div class="cell">
      <div class="lbl">Bloch R</div>
      <div class="val">({r(blochR[0])}, {r(blochR[1])}, {r(blochR[2])})</div>
    </div>
    <div class="cell wide">
      <div class="lbl">Espinor de Dirac (base quiral, sin normalizar)</div>
      <div class="tex">{@html tex(`\\psi_D = ${texDirac(psi_L_raw, psi_R_raw)}`)}</div>
    </div>
  </div>

  <div class="legend-text">
    <strong>Lectura.</strong> Empieza en α = 0, β = 0: L y R coinciden en
    |+z⟩. Mueve solo β: ambos puntos rotan al unísono. Mueve solo α: L
    desliza hacia −n̂, R hacia +n̂. Eso es la diferencia entre las dos
    representaciones (½, 0) y (0, ½) de SL(2,C), y la asociación física
    estándar para partículas sin masa: L = helicidad negativa,
    R = helicidad positiva.
  </div>
</div>

<style>
  .st-root { display: grid; gap: 1rem; }
  .canvas-wrap {
    height: 360px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .legend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--fg-mute);
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.l { background: #e879f9; }
  .dot.r { background: #22d3ee; }
  .controls {
    display: grid;
    gap: 0.7rem;
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
  .reset {
    margin-left: auto;
    background: transparent;
    color: var(--fg-mute);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
    cursor: pointer;
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
  .readout-grid {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 720px) {
    .readout-grid {
      grid-template-columns: 1fr 1fr;
    }
    .readout-grid .wide { grid-column: 1 / -1; }
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
    font-variant-numeric: tabular-nums;
  }
  .cell .tex :global(.katex-display) {
    margin: 0.1rem 0;
    overflow-x: auto;
  }
  .legend-text {
    border-left: 3px solid var(--accent);
    padding: 0.5rem 0.75rem;
    background: #0e1622;
    border-radius: 0 4px 4px 0;
    color: #cbd5e1;
    font-size: 0.92rem;
  }
</style>

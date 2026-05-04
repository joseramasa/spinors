<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import katex from 'katex';
  import { fmtC, type Complex, type Spinor } from '../../lib/spinor';

  type DiracType = 'u' | 'v';
  let type = $state<DiracType>('u');
  let spinUp = $state(true);
  let pz = $state(0); // |p|/m, slider de -3 a 3 (signo del momento)

  const m = 1; // unidades de masa de reposo
  const E = $derived(Math.sqrt(pz * pz + m * m));

  // Para momento a lo largo de +z, autovectores de σ·p = pz σz son (1,0) y (0,1).
  // p·σ = E I − pz σz = diag(E − pz, E + pz)
  // p·σ̄ = E I + pz σz = diag(E + pz, E − pz)

  // u(p, ↑) = (√(p·σ) ξ↑, √(p·σ̄) ξ↑) con ξ↑ = (1,0):  L = (√(E−pz), 0), R = (√(E+pz), 0)
  // u(p, ↓) = (√(p·σ) ξ↓, √(p·σ̄) ξ↓) con ξ↓ = (0,1):  L = (0, √(E+pz)), R = (0, √(E−pz))
  // v cambia el signo del bloque R.

  const psi = $derived.by(() => {
    const sP_aligned = Math.sqrt(Math.max(E - pz, 0));
    const sPbar_aligned = Math.sqrt(Math.max(E + pz, 0));
    let L: Spinor, R: Spinor;
    if (spinUp) {
      L = [[sP_aligned, 0], [0, 0]];
      R = [[sPbar_aligned, 0], [0, 0]];
    } else {
      L = [[0, 0], [sPbar_aligned, 0]];
      R = [[0, 0], [sP_aligned, 0]];
    }
    if (type === 'v') {
      R = [[-R[0][0], -R[0][1]], [-R[1][0], -R[1][1]]];
    }
    return { L, R };
  });

  const Lmag2 = $derived(psi.L[0][0] ** 2 + psi.L[0][1] ** 2 + psi.L[1][0] ** 2 + psi.L[1][1] ** 2);
  const Rmag2 = $derived(psi.R[0][0] ** 2 + psi.R[0][1] ** 2 + psi.R[1][0] ** 2 + psi.R[1][1] ** 2);
  const total = $derived(Lmag2 + Rmag2);
  const Lfrac = $derived(total > 1e-9 ? Lmag2 / total : 0.5);
  const Rfrac = $derived(total > 1e-9 ? Rmag2 / total : 0.5);

  // Bilineal Lorentz-invariante ψ̄ψ = ψ_L† ψ_R + ψ_R† ψ_L  en base quiral
  // Ambos componentes son reales con el patrón aquí, así que es escalar:
  const psiBarPsi = $derived.by(() => {
    const reLR =
      psi.L[0][0] * psi.R[0][0] + psi.L[0][1] * psi.R[0][1] +
      psi.L[1][0] * psi.R[1][0] + psi.L[1][1] * psi.R[1][1];
    return 2 * reLR; // simétrico, por construcción aquí
  });

  // Helicidad +1 si spin paralelo a p
  const helicity = $derived(spinUp ? (pz >= 0 ? '+1' : '−1') : (pz >= 0 ? '−1' : '+1'));

  // Bloch direction de cada componente normalizado
  function blochOf(s: Spinor): [number, number, number] {
    const a = s[0], b = s[1];
    const norm2 = a[0] ** 2 + a[1] ** 2 + b[0] ** 2 + b[1] ** 2;
    if (norm2 < 1e-9) return [0, 0, 0];
    const x = 2 * (a[0] * b[0] + a[1] * b[1]);
    const y = 2 * (a[0] * b[1] - a[1] * b[0]);
    const z = a[0] * a[0] + a[1] * a[1] - b[0] * b[0] - b[1] * b[1];
    return [x / norm2, y / norm2, z / norm2];
  }
  const blochL = $derived(blochOf(psi.L));
  const blochR = $derived(blochOf(psi.R));

  // Tamaño de las esferas de visualización: proporcional a la raíz de la magnitud
  const sizeBase = 0.05;
  const sizeMax = 0.13;
  const sizeL = $derived(sizeBase + (sizeMax - sizeBase) * Math.sqrt(Lfrac));
  const sizeR = $derived(sizeBase + (sizeMax - sizeBase) * Math.sqrt(Rfrac));

  function fmtCTeX(c: Complex, prec = 2): string {
    const re = c[0].toFixed(prec);
    const i = c[1];
    if (Math.abs(i) < 10 ** -prec) return re;
    const sign = i >= 0 ? '+' : '-';
    return `${re}\\,${sign}\\,${Math.abs(i).toFixed(prec)}i`;
  }
  function texDirac(L: Spinor, R: Spinor): string {
    return `\\psi_D = \\begin{pmatrix}${fmtCTeX(L[0])} \\\\ ${fmtCTeX(L[1])} \\\\ ${fmtCTeX(R[0])} \\\\ ${fmtCTeX(R[1])}\\end{pmatrix}`;
  }
  const tex = (s: string) =>
    katex.renderToString(s, { displayMode: true, throwOnError: false });
  const r = (x: number) => x.toFixed(2);
</script>

<div class="dirac-root">
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

      <!-- Flecha del momento a lo largo de +z (escala con |pz|) -->
      {#if Math.abs(pz) > 0.01}
        <T.Mesh position={[0, 0, Math.sign(pz) * 1.1]} rotation.x={Math.sign(pz) * Math.PI / 2}>
          <T.ConeGeometry args={[0.07, 0.18, 16]} />
          <T.MeshBasicMaterial color="#a3a3a3" />
        </T.Mesh>
      {/if}

      <!-- L (magenta) y R (cian) en sus direcciones de Bloch, escalados por magnitud -->
      <T.Mesh position={blochL}>
        <T.SphereGeometry args={[sizeL, 24, 24]} />
        <T.MeshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.45} />
      </T.Mesh>
      <T.Mesh position={blochR}>
        <T.SphereGeometry args={[sizeR, 24, 24]} />
        <T.MeshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} transparent opacity={0.85} />
      </T.Mesh>
    </Canvas>
  </div>

  <div class="controls">
    <div class="row-buttons">
      <span class="lbl">Tipo:</span>
      <div class="btn-group">
        <button class:active={type === 'u'} onclick={() => (type = 'u')}>u (materia)</button>
        <button class:active={type === 'v'} onclick={() => (type = 'v')}>v (antimateria)</button>
      </div>
    </div>
    <div class="row-buttons">
      <span class="lbl">Spin:</span>
      <div class="btn-group">
        <button class:active={spinUp} onclick={() => (spinUp = true)}>↑ (+z)</button>
        <button class:active={!spinUp} onclick={() => (spinUp = false)}>↓ (−z)</button>
      </div>
    </div>
    <label class="slider">
      <span>p<sub>z</sub> / m: <strong>{pz.toFixed(2)}</strong></span>
      <input type="range" min="-3" max="3" step="0.02" bind:value={pz} />
      <small>E/m = {(E / m).toFixed(2)}; helicidad = <strong>{helicity}</strong></small>
    </label>
  </div>

  <div class="bars">
    <div class="bar-row">
      <span class="bar-lbl">|ψ_L|² / total</span>
      <div class="bar"><div class="bar-fill l" style:width={`${Lfrac * 100}%`}></div></div>
      <span class="bar-val">{(Lfrac * 100).toFixed(0)}%</span>
    </div>
    <div class="bar-row">
      <span class="bar-lbl">|ψ_R|² / total</span>
      <div class="bar"><div class="bar-fill r" style:width={`${Rfrac * 100}%`}></div></div>
      <span class="bar-val">{(Rfrac * 100).toFixed(0)}%</span>
    </div>
  </div>

  <div class="readout-grid">
    <div class="cell wide">
      <div class="lbl">Espinor de Dirac (base quiral)</div>
      <div class="tex">{@html tex(texDirac(psi.L, psi.R))}</div>
    </div>
    <div class="cell">
      <div class="lbl">|L|² &nbsp;·&nbsp; |R|²</div>
      <div class="val">{r(Lmag2)} &nbsp;·&nbsp; {r(Rmag2)}</div>
    </div>
    <div class="cell">
      <div class="lbl">Bilineal ψ̄ψ</div>
      <div class="val">{r(psiBarPsi)} <small>(invariante: ±2m en reposo, varía con la convención)</small></div>
    </div>
  </div>

  <div class="legend-text">
    <strong>Lectura.</strong> En reposo (p<sub>z</sub> = 0), las componentes
    L y R tienen el mismo módulo: una partícula masiva NO es puramente
    quiral. Al boostar a lo largo del momento aparece la asimetría: para
    spin paralelo a p (helicidad +1), R domina y |L|² → 0 cuando p ≫ m;
    para spin antiparalelo, L domina. La diferencia entre <em>u</em>
    (materia) y <em>v</em> (antimateria) es el signo del bloque R: en la
    representación visual, las dos esferas señalan a la misma dirección de
    Bloch para u, opuestas para v cuando hay momento.
  </div>
</div>

<style>
  .dirac-root { display: grid; gap: 1rem; }
  .canvas-wrap {
    height: 320px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .controls {
    display: grid;
    gap: 0.7rem;
  }
  .row-buttons {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.92rem;
    flex-wrap: wrap;
  }
  .row-buttons .lbl { color: var(--fg-mute); min-width: 3rem; }
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
  .slider small {
    color: var(--fg-mute);
    font-size: 0.78em;
  }
  .bars {
    display: grid;
    gap: 0.4rem;
  }
  .bar-row {
    display: grid;
    grid-template-columns: 110px 1fr 50px;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;
  }
  .bar-lbl { color: var(--fg-mute); }
  .bar {
    height: 12px;
    background: #11151e;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--rule);
  }
  .bar-fill { height: 100%; transition: width 80ms linear; }
  .bar-fill.l { background: linear-gradient(90deg, #c026d3, #e879f9); }
  .bar-fill.r { background: linear-gradient(90deg, #0891b2, #22d3ee); }
  .bar-val { font-variant-numeric: tabular-nums; text-align: right; color: var(--fg-mute); }
  .readout-grid {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 720px) {
    .readout-grid { grid-template-columns: 1fr 1fr; }
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
  .cell .val { font-variant-numeric: tabular-nums; }
  .cell small { color: var(--fg-mute); font-size: 0.78em; }
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

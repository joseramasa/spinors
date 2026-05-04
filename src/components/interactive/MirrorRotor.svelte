<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { DoubleSide } from 'three';
  import katex from 'katex';

  let alphaDeg = $state(45);
  const alpha = $derived((alphaDeg * Math.PI) / 180);
  const finalRot = $derived(2 * alpha);

  const cosA = $derived(Math.cos(alpha));
  const sinA = $derived(Math.sin(alpha));

  const tex = (s: string) =>
    katex.renderToString(s, { displayMode: true, throwOnError: false });
  const r = (x: number) => x.toFixed(2);
</script>

{#snippet lShape(color: string, opacity: number, basic: boolean)}
  <T.Mesh position={[0, 0.2, 0]}>
    <T.BoxGeometry args={[0.06, 0.4, 0.04]} />
    {#if basic}
      <T.MeshBasicMaterial {color} transparent={opacity < 1} {opacity} side={DoubleSide} />
    {:else}
      <T.MeshStandardMaterial {color} transparent={opacity < 1} {opacity} side={DoubleSide} />
    {/if}
  </T.Mesh>
  <T.Mesh position={[0.1, 0, 0]}>
    <T.BoxGeometry args={[0.2, 0.06, 0.04]} />
    {#if basic}
      <T.MeshBasicMaterial {color} transparent={opacity < 1} {opacity} side={DoubleSide} />
    {:else}
      <T.MeshStandardMaterial {color} transparent={opacity < 1} {opacity} side={DoubleSide} />
    {/if}
  </T.Mesh>
{/snippet}

<div class="mirror-root">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[1.4, 2.4, 2.4]} fov={45} makeDefault>
        <OrbitControls enableDamping enablePan={false} minDistance={2} maxDistance={6} target={[0, 0, 0]} />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.6} />
      <T.DirectionalLight position={[3, 5, 2]} intensity={1.0} />

      <!-- Plano xy -->
      <T.Mesh rotation.x={-Math.PI / 2}>
        <T.PlaneGeometry args={[3, 3]} />
        <T.MeshBasicMaterial color="#0d1117" side={DoubleSide} />
      </T.Mesh>
      <T.GridHelper args={[3, 18, '#3f4658', '#252b39']} />

      <!-- Ejes RGB -->
      {#each [
        { dir: [1, 0, 0], color: '#f87171' },
        { dir: [0, 1, 0], color: '#4ade80' },
        { dir: [0, 0, 1], color: '#60a5fa' },
      ] as eje}
        <T.Mesh
          position={[eje.dir[0] * 0.65, eje.dir[1] * 0.65, eje.dir[2] * 0.65]}
          rotation={[
            eje.dir[1] === 1 ? 0 : eje.dir[2] === 1 ? Math.PI / 2 : 0,
            eje.dir[0] === 1 ? 0 : eje.dir[2] === 1 ? 0 : Math.PI / 2,
            eje.dir[0] === 1 ? -Math.PI / 2 : 0,
          ]}
        >
          <T.CylinderGeometry args={[0.005, 0.005, 1.3, 8]} />
          <T.MeshBasicMaterial color={eje.color} />
        </T.Mesh>
      {/each}

      <!-- Espejo 1: plano normal a +x, contiene eje z -->
      <T.Mesh rotation.y={Math.PI / 2}>
        <T.PlaneGeometry args={[1.6, 0.55]} />
        <T.MeshBasicMaterial color="#60a5fa" transparent opacity={0.18} side={DoubleSide} />
      </T.Mesh>

      <!-- Espejo 2: rotado alrededor de z por α -->
      <T.Group rotation.z={alpha}>
        <T.Mesh rotation.y={Math.PI / 2}>
          <T.PlaneGeometry args={[1.6, 0.55]} />
          <T.MeshBasicMaterial color="#fcd34d" transparent opacity={0.2} side={DoubleSide} />
        </T.Mesh>
      </T.Group>

      <!-- L original (faint, gris) -->
      <T.Group position={[0.6, 0.2, 0]} rotation.x={Math.PI / 2}>
        {@render lShape('#94a3b8', 0.4, true)}
      </T.Group>

      <!-- L intermedia: tras reflejar por espejo 1 (x → -x) -->
      <T.Group scale={[-1, 1, 1]}>
        <T.Group position={[0.6, 0.2, 0]} rotation.x={Math.PI / 2}>
          {@render lShape('#fb923c', 0.4, true)}
        </T.Group>
      </T.Group>

      <!-- L final: rotación de 2α aplicada al original -->
      <T.Group rotation.z={finalRot}>
        <T.Group position={[0.6, 0.2, 0]} rotation.x={Math.PI / 2}>
          {@render lShape('#fcd34d', 1.0, false)}
        </T.Group>
      </T.Group>
    </Canvas>
  </div>

  <div class="legend-row">
    <div class="legend-item"><span class="dot" style="background:#94a3b8"></span> L original</div>
    <div class="legend-item"><span class="dot" style="background:#fb923c"></span> tras espejo 1</div>
    <div class="legend-item"><span class="dot" style="background:#fcd34d"></span> tras espejo 2 = rotación</div>
  </div>

  <label class="slider">
    <span>α (ángulo entre espejos): <strong>{alphaDeg.toFixed(0)}°</strong></span>
    <input type="range" min="0" max="180" step="1" bind:value={alphaDeg} />
    <div class="ticks">
      <span>0°</span><span>90°</span><span>180°</span>
    </div>
  </label>

  <div class="result">
    Rotación final = <strong>{(2 * alphaDeg).toFixed(0)}°</strong>
    <small>(= 2α, el doble del ángulo entre espejos)</small>
  </div>

  <div class="readout-grid">
    <div class="cell">
      <div class="lbl">Espejos (vectores normales)</div>
      <div class="val mono">u₁ = (1, 0, 0)</div>
      <div class="val mono">u₂ = ({r(cosA)}, {r(sinA)}, 0)</div>
    </div>
    <div class="cell">
      <div class="lbl">Producto interior y exterior</div>
      <div class="val">u₁ · u₂ = cos α = {r(cosA)}</div>
      <div class="val">u₁ ∧ u₂ = sin α · e₁₂ = {r(sinA)} · e₁₂</div>
    </div>
    <div class="cell wide">
      <div class="lbl">Rotor (producto geométrico de Clifford)</div>
      <div class="tex">{@html tex(`R = u_2\\, u_1 = u_2\\!\\cdot\\!u_1 + u_2 \\wedge u_1 = \\cos\\alpha + \\sin\\alpha\\, e_{12}`)}</div>
      <div class="tex">{@html tex(`R = \\exp(\\alpha\\, e_{12}) \\quad (\\text{con } e_{12}^{2} = -1)`)}</div>
    </div>
  </div>

  <div class="legend-text">
    <strong>Lectura.</strong> El producto geométrico de los dos vectores
    unitarios <em>u₂ u₁</em> es exactamente el rotor que rota
    <em>2α</em> en el plano de los dos espejos. Esa es la receta universal:
    el plano de rotación se codifica como un <em>bivector</em> y el rotor es
    su exponencial. Funciona idéntico en cualquier dimensión.
  </div>
</div>

<style>
  .mirror-root { display: grid; gap: 1rem; }
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
  .result {
    background: #11151e;
    border-left: 3px solid var(--accent-warm);
    padding: 0.55rem 0.9rem;
    font-size: 1rem;
    border-radius: 0 4px 4px 0;
  }
  .result small { color: var(--fg-mute); margin-left: 0.5rem; font-size: 0.85em; }
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
    gap: 0.25rem;
  }
  .cell .lbl {
    color: var(--fg-mute);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cell .val { font-variant-numeric: tabular-nums; }
  .mono { font-family: var(--font-mono); font-size: 0.9em; }
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

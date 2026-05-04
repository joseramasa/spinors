<script lang="ts">
  import katex from 'katex';

  // ===== Estado: representación irreducible =====
  const Js = [0.5, 1, 1.5, 2, 2.5, 3];
  let J = $state(1);
  let mSel = $state(1);

  $effect(() => {
    if (mSel > J) mSel = J;
    if (mSel < -J) mSel = -J;
  });

  const ladderMs = $derived.by(() => {
    const arr: number[] = [];
    for (let m = J; m >= -J - 1e-6; m -= 1) arr.push(m);
    return arr;
  });
  const dim = $derived(Math.round(2 * J + 1));

  const cPlus = $derived(Math.sqrt(Math.max(0, J * (J + 1) - mSel * (mSel + 1))));
  const cMinus = $derived(Math.sqrt(Math.max(0, J * (J + 1) - mSel * (mSel - 1))));

  function jPlus() {
    if (mSel < J - 1e-6) mSel += 1;
  }
  function jMinus() {
    if (mSel > -J + 1e-6) mSel -= 1;
  }

  // ===== Estado: producto tensorial =====
  let J1 = $state(0.5);
  let J2 = $state(0.5);
  const decomp = $derived.by(() => {
    const min = Math.abs(J1 - J2);
    const max = J1 + J2;
    const arr: number[] = [];
    for (let j = max; j >= min - 1e-6; j -= 1) arr.push(j);
    return arr;
  });
  const tpInDim = $derived(Math.round((2 * J1 + 1) * (2 * J2 + 1)));
  const tpOutDim = $derived(decomp.reduce((s, j) => s + Math.round(2 * j + 1), 0));

  // ===== Helpers =====
  function fmtJTeX(j: number): string {
    if (Math.abs(j - Math.round(j)) < 1e-6) return Math.round(j).toString();
    const map: Record<string, string> = {
      '0.5': '\\tfrac{1}{2}',
      '1.5': '\\tfrac{3}{2}',
      '2.5': '\\tfrac{5}{2}',
      '3.5': '\\tfrac{7}{2}',
    };
    return map[j.toString()] ?? j.toString();
  }
  function fmtMTeX(m: number): string {
    if (Math.abs(m - Math.round(m)) < 1e-6) return Math.round(m).toString();
    const sign = m < 0 ? '-' : '';
    const abs = Math.abs(m);
    const map: Record<string, string> = {
      '0.5': '\\tfrac{1}{2}',
      '1.5': '\\tfrac{3}{2}',
      '2.5': '\\tfrac{5}{2}',
    };
    return `${sign}${map[abs.toString()] ?? abs.toString()}`;
  }
  function fmtJSimple(j: number): string {
    if (Math.abs(j - Math.round(j)) < 1e-6) return Math.round(j).toString();
    const num = Math.round(j * 2);
    return `${num}/2`;
  }
  function fmtMSimple(m: number): string {
    if (Math.abs(m - Math.round(m)) < 1e-6) return Math.round(m).toString();
    const sign = m < 0 ? '−' : '';
    const num = Math.round(Math.abs(m) * 2);
    return `${sign}${num}/2`;
  }

  const tex = (s: string) =>
    katex.renderToString(s, { displayMode: true, throwOnError: false });
  const r = (x: number) => x.toFixed(3);
</script>

<div class="ll-root">
  <section class="block">
    <h3>1. Representación irreducible de SU(2)</h3>
    <div class="row-buttons">
      <span class="lbl">J:</span>
      <div class="btn-group">
        {#each Js as j}
          <button class:active={J === j} onclick={() => (J = j)}>{fmtJSimple(j)}</button>
        {/each}
      </div>
      <span class="dim">dim = 2J+1 = {dim}</span>
    </div>

    <div class="ladder-wrap">
      <svg viewBox="0 0 260 {dim * 48 + 20}" class="ladder">
        <defs>
          <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
            <polygon points="0 6, 3 0, 6 6" fill="#7dd3fc" />
          </marker>
          <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
            <polygon points="0 0, 3 6, 6 0" fill="#fb923c" />
          </marker>
        </defs>
        <line x1="80" y1="14" x2="80" y2={(dim - 1) * 48 + 18} stroke="#3f4658" stroke-width="1.5" />

        {#each ladderMs as m, idx}
          {@const cy = idx * 48 + 16}
          {@const isSel = Math.abs(m - mSel) < 1e-6}
          <text x="58" y={cy + 4} text-anchor="end" fill="#9ca3af" font-family="ui-monospace" font-size="13">
            m = {fmtMSimple(m)}
          </text>
          <circle
            cx="80"
            cy={cy}
            r={isSel ? 13 : 8}
            fill={isSel ? '#fcd34d' : '#475569'}
            stroke={isSel ? '#fef3c7' : 'none'}
            stroke-width="2"
            onclick={() => (mSel = m)}
            style="cursor: pointer; transition: r 180ms, fill 180ms"
          />
          <text x="100" y={cy + 4} fill="#cbd5e1" font-family="ui-monospace" font-size="12.5">
            |{fmtJSimple(J)}, {fmtMSimple(m)}⟩
          </text>
        {/each}

        {#if mSel < J - 1e-6}
          {@const idxSel = ladderMs.findIndex((m) => Math.abs(m - mSel) < 1e-6)}
          {@const cyBot = idxSel * 48 + 16}
          {@const cyTop = (idxSel - 1) * 48 + 16}
          <line x1="220" y1={cyBot - 14} x2="220" y2={cyTop + 14} stroke="#7dd3fc" stroke-width="2" marker-end="url(#arrowUp)" />
          <text x="230" y={(cyTop + cyBot) / 2 + 4} fill="#7dd3fc" font-family="ui-monospace" font-size="12">J+</text>
        {/if}
        {#if mSel > -J + 1e-6}
          {@const idxSel = ladderMs.findIndex((m) => Math.abs(m - mSel) < 1e-6)}
          {@const cyTop = idxSel * 48 + 16}
          {@const cyBot = (idxSel + 1) * 48 + 16}
          <line x1="190" y1={cyTop + 14} x2="190" y2={cyBot - 14} stroke="#fb923c" stroke-width="2" marker-end="url(#arrowDown)" />
          <text x="200" y={(cyTop + cyBot) / 2 + 4} fill="#fb923c" font-family="ui-monospace" font-size="12">J−</text>
        {/if}
      </svg>
    </div>

    <div class="op-buttons">
      <button onclick={jMinus} disabled={mSel <= -J + 1e-6}>J− (bajar)</button>
      <button onclick={jPlus} disabled={mSel >= J - 1e-6}>J+ (subir)</button>
    </div>

    <div class="readout-grid">
      <div class="cell">
        <div class="lbl">Operador escalera (subir)</div>
        <div class="tex">{@html tex(`J^{+}\\,|${fmtJTeX(J)},\\,${fmtMTeX(mSel)}\\rangle = \\sqrt{J(J{+}1) - m(m{+}1)}\\;|${fmtJTeX(J)},\\,${fmtMTeX(mSel + 1)}\\rangle = ${cPlus.toFixed(3)}\\;|${fmtJTeX(J)},\\,${fmtMTeX(mSel + 1)}\\rangle`)}</div>
      </div>
      <div class="cell">
        <div class="lbl">Operador escalera (bajar)</div>
        <div class="tex">{@html tex(`J^{-}\\,|${fmtJTeX(J)},\\,${fmtMTeX(mSel)}\\rangle = ${cMinus.toFixed(3)}\\;|${fmtJTeX(J)},\\,${fmtMTeX(mSel - 1)}\\rangle`)}</div>
      </div>
      <div class="cell">
        <div class="lbl">J_z y Casimir J²</div>
        <div class="tex">{@html tex(`J_{z}\\,|${fmtJTeX(J)},\\,${fmtMTeX(mSel)}\\rangle = ${fmtMTeX(mSel)}\\,|${fmtJTeX(J)},\\,${fmtMTeX(mSel)}\\rangle`)}</div>
        <div class="tex">{@html tex(`\\mathbf{J}^2\\,|${fmtJTeX(J)},\\,${fmtMTeX(mSel)}\\rangle = ${fmtJTeX(J)}\\,(${fmtJTeX(J)}{+}1)\\,|\\,\\rangle = ${(J * (J + 1)).toFixed(2)}\\,|\\,\\rangle`)}</div>
      </div>
    </div>

    <div class="legend-text">
      <strong>Lectura.</strong> En la cima (m = +J), el operador J+
      <em>aniquila</em> al estado: el coeficiente √(J(J+1)−m(m+1)) se anula.
      Lo mismo abajo con J−. Por eso una representación de espín J tiene
      exactamente 2J+1 estados, ni uno más. Con esto se construyen las irreps
      de SU(2) en cualquier dimensión.
    </div>
  </section>

  <section class="block">
    <h3>2. Producto tensorial: regla de Clebsch–Gordan</h3>
    <div class="tp-controls">
      <div class="row-buttons">
        <span class="lbl">J₁:</span>
        <div class="btn-group">
          {#each [0.5, 1, 1.5, 2] as j}
            <button class:active={J1 === j} onclick={() => (J1 = j)}>{fmtJSimple(j)}</button>
          {/each}
        </div>
      </div>
      <div class="row-buttons">
        <span class="lbl">J₂:</span>
        <div class="btn-group">
          {#each [0.5, 1, 1.5, 2] as j}
            <button class:active={J2 === j} onclick={() => (J2 = j)}>{fmtJSimple(j)}</button>
          {/each}
        </div>
      </div>
    </div>

    <div class="tp-formula">
      {@html tex(`${fmtJTeX(J1)} \\otimes ${fmtJTeX(J2)} = ${decomp.map(j => fmtJTeX(j)).join(' \\;\\oplus\\; ')}`)}
    </div>

    <div class="tp-decomp">
      {#each decomp as j}
        <div class="tp-irrep">
          <div class="tp-irrep-lbl">J = {fmtJSimple(j)}</div>
          <svg viewBox="0 0 60 {Math.round(2 * j + 1) * 24 + 10}" class="mini-ladder">
            <line x1="20" y1="6" x2="20" y2={Math.round(2 * j + 1) * 24 - 18 + 6} stroke="#3f4658" stroke-width="1" />
            {#each Array.from({ length: Math.round(2 * j + 1) }, (_, i) => j - i) as m, idx}
              <circle cx="20" cy={idx * 24 + 8} r="6" fill="#7dd3fc" />
              <text x="32" y={idx * 24 + 12} fill="#9ca3af" font-family="ui-monospace" font-size="10">{fmtMSimple(m)}</text>
            {/each}
          </svg>
          <div class="tp-irrep-dim">dim {Math.round(2 * j + 1)}</div>
        </div>
      {/each}
    </div>

    <div class="tp-check">
      Suma de dimensiones: {decomp.map(j => Math.round(2 * j + 1)).join(' + ')} = {tpOutDim} =
      ({Math.round(2 * J1 + 1)})({Math.round(2 * J2 + 1)}) = {tpInDim} ✓
    </div>

    <div class="legend-text">
      Caso emblemático: <strong>½ ⊗ ½ = 1 ⊕ 0</strong>. Dos espines ½ se
      combinan en un triplete (J = 1, simétrico) y un singlete (J = 0,
      antisimétrico). El singlete es el estado |↑↓⟩ − |↓↑⟩ que aparece como
      par EPR. Bajo SL(2,C), las representaciones de Lorentz se etiquetan
      por (J_L, J_R): (½, 0) y (0, ½) son los Weyl, (½, ½) es el cuadrivector,
      (1, 0) ⊕ (0, 1) es el tensor electromagnético.
    </div>
  </section>
</div>

<style>
  .ll-root {
    display: grid;
    gap: 1.5rem;
  }
  .block {
    display: grid;
    gap: 0.9rem;
  }
  .block h3 {
    margin: 0;
    color: var(--accent);
    font-size: 1rem;
    letter-spacing: 0.02em;
  }
  .row-buttons {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    font-size: 0.92rem;
  }
  .row-buttons .lbl { color: var(--fg-mute); min-width: 2rem; }
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
    padding: 0.35rem 0.7rem;
    cursor: pointer;
    border-right: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 0.88em;
  }
  .btn-group button:last-child { border-right: 0; }
  .btn-group button.active {
    background: var(--rule);
    color: var(--accent);
  }
  .dim {
    color: var(--fg-mute);
    font-size: 0.85rem;
    margin-left: auto;
  }
  .ladder-wrap {
    display: flex;
    justify-content: center;
    background: #0a0c12;
    padding: 0.75rem 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--rule);
  }
  .ladder {
    width: 100%;
    max-width: 320px;
    height: auto;
  }
  .op-buttons {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
  }
  .op-buttons button {
    background: #1a1f2c;
    color: var(--fg);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.5rem 1.1rem;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.92em;
  }
  .op-buttons button:hover:not(:disabled) {
    border-color: var(--accent);
  }
  .op-buttons button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
  }
  .cell {
    background: #11151e;
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.55rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .cell .lbl {
    color: var(--fg-mute);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cell .tex :global(.katex-display) {
    margin: 0.05rem 0;
    overflow-x: auto;
    font-size: 0.9em;
  }
  .legend-text {
    border-left: 3px solid var(--accent);
    padding: 0.5rem 0.75rem;
    background: #0e1622;
    border-radius: 0 4px 4px 0;
    color: #cbd5e1;
    font-size: 0.92rem;
  }
  .tp-controls {
    display: grid;
    gap: 0.5rem;
  }
  .tp-formula {
    text-align: center;
    background: #11151e;
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
  }
  .tp-formula :global(.katex-display) {
    margin: 0;
    font-size: 1.1em;
  }
  .tp-decomp {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    justify-content: center;
    background: #0a0c12;
    padding: 0.9rem 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--rule);
  }
  .tp-irrep {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }
  .tp-irrep-lbl {
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
  .mini-ladder {
    width: 60px;
    height: auto;
  }
  .tp-irrep-dim {
    color: var(--fg-mute);
    font-size: 0.78rem;
  }
  .tp-check {
    color: var(--fg-mute);
    font-size: 0.85rem;
    text-align: center;
    font-family: var(--font-mono);
  }
</style>

<script lang="ts">
  let answer = $state('');
  let checked = $state(false);

  // For ultrarelativistic electron with spin parallel to momentum (+z),
  // helicity = +1, so R chirality dominates.
  const correct = 'R';
  const ok = $derived(checked && answer === correct);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Un electrón ultrarelativista (p ≫ m) viaja en la dirección +z
    con espín ↑ (paralelo a su momento). ¿Qué componente quiral
    del espinor de Dirac domina en magnitud?
  </p>

  <div class="options">
    <label class:selected={answer === 'L'}>
      <input type="radio" name="m5" value="L" bind:group={answer} disabled={ok} />
      <span class="dot l"></span> ψ_L (quiralidad izquierda)
    </label>
    <label class:selected={answer === 'R'}>
      <input type="radio" name="m5" value="R" bind:group={answer} disabled={ok} />
      <span class="dot r"></span> ψ_R (quiralidad derecha)
    </label>
    <label class:selected={answer === 'equal'}>
      <input type="radio" name="m5" value="equal" bind:group={answer} disabled={ok} />
      Ambas son iguales
    </label>
  </div>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!answer}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. Para p ≫ m la quiralidad converge a la helicidad. Espín
      paralelo a p ⇒ helicidad +1 ⇒ R domina. Las componentes escalan
      como √(E ± p): la componente L lleva √(E − p) → 0 cuando p → E.
      Por eso la fuerza débil, que solo acopla con L, no "ve" a un neutrino
      ultrarelativista de helicidad +1.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: en el límite ultrarelativista, quiralidad ≈
      helicidad. ¿Qué helicidad tiene un electrón con espín paralelo a p?
    </div>
  {/if}
</div>

<style>
  .exercise {
    margin-top: 1.5rem; padding: 1rem;
    border: 1px solid var(--rule); border-radius: 8px;
    background: var(--bg-elev);
  }
  .exercise h3 { margin: 0 0 0.5rem; color: var(--accent-warm); font-size: 1rem; }
  .options { display: grid; gap: 0.4rem; margin: 0.75rem 0; }
  .options label {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--rule); border-radius: 4px;
    cursor: pointer; font-size: 0.92rem;
  }
  .options label:hover { border-color: var(--accent); }
  .options label.selected { border-color: var(--accent); background: #161e2e; }
  .options input { accent-color: var(--accent); }
  .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .dot.l { background: #e879f9; }
  .dot.r { background: #22d3ee; }
  .check-btn {
    margin-top: 0.5rem; padding: 0.4rem 1.2rem;
    background: var(--rule); color: var(--fg);
    border: 1px solid var(--accent); border-radius: 4px;
    cursor: pointer; font-size: 0.9rem;
  }
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .feedback {
    margin-top: 0.75rem; padding: 0.6rem 0.8rem;
    border-radius: 4px; font-size: 0.9rem; line-height: 1.5;
  }
  .feedback.ok { background: #1e3a23; color: #86efac; border-left: 3px solid #4ade80; }
  .feedback.wrong { background: #3a1e1e; color: #fca5a5; border-left: 3px solid #f87171; }
</style>

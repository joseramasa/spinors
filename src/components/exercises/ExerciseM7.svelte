<script lang="ts">
  let answer = $state('');
  let checked = $state(false);

  // At rest (p=0), E=m, so √(E−p)=√(E+p)=√m → |L|=|R|
  const correct = 'equal';
  const ok = $derived(checked && answer === correct);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Una partícula de Dirac tipo <em>u</em> (materia) está en reposo
    (p = 0). En la base quiral, el espinor tiene componentes L y R.
    ¿Cómo se comparan sus magnitudes?
  </p>

  <div class="options">
    <label class:selected={answer === 'Lbig'}>
      <input type="radio" name="m7" value="Lbig" bind:group={answer} disabled={ok} />
      |ψ_L| &gt; |ψ_R|
    </label>
    <label class:selected={answer === 'Rbig'}>
      <input type="radio" name="m7" value="Rbig" bind:group={answer} disabled={ok} />
      |ψ_L| &lt; |ψ_R|
    </label>
    <label class:selected={answer === 'equal'}>
      <input type="radio" name="m7" value="equal" bind:group={answer} disabled={ok} />
      |ψ_L| = |ψ_R|
    </label>
  </div>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!answer}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. En reposo E = m, p = 0, así que √(E − p) = √(E + p) = √m.
      Las dos componentes quirales son iguales. Una partícula masiva en
      reposo NO tiene quiralidad definida. La asimetría L/R solo aparece
      al boostar: prueba moviendo el slider p_z en el widget de arriba.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: las componentes escalan como √(E ± p).
      ¿Cuánto vale p en reposo?
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

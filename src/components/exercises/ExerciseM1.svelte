<script lang="ts">
  let ansVector = $state('');
  let ansSpinor = $state('');
  let checked = $state(false);

  const correctV = 360;
  const correctS = 720;

  const okV = $derived(checked && parseInt(ansVector) === correctV);
  const okS = $derived(checked && parseInt(ansSpinor) === correctS);
  const allCorrect = $derived(okV && okS);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Un objeto rota continuamente alrededor de un eje. Completa:
  </p>

  <div class="field">
    <label>
      Un <strong>vector</strong> en R³ vuelve a su estado original tras
      <input type="number" bind:value={ansVector} min="0" max="1440" step="1" class="num-input" disabled={allCorrect} />
      grados.
    </label>
    {#if checked}
      <span class="mark">{okV ? '✓' : '✗'}</span>
    {/if}
  </div>

  <div class="field">
    <label>
      Un <strong>espinor</strong> en C² vuelve a su estado original tras
      <input type="number" bind:value={ansSpinor} min="0" max="1440" step="1" class="num-input" disabled={allCorrect} />
      grados.
    </label>
    {#if checked}
      <span class="mark">{okS ? '✓' : '✗'}</span>
    {/if}
  </div>

  {#if !allCorrect}
    <button class="check-btn" onclick={() => (checked = true)}>Comprobar</button>
  {/if}

  {#if checked && allCorrect}
    <div class="feedback ok">
      Correcto. El vector rota a velocidad θ y cierra en 360°.
      El espinor rota a θ/2, así que necesita 720° para cerrar.
      Werner et al. (1975) confirmaron esto midiendo la periodicidad
      de 720° en interferometría de neutrones.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Revisa tus respuestas. Pista: la matriz de rotación del espinor
      es U(θ) = exp(−iθσ_z/2). ¿Para qué θ vale U = +I?
    </div>
  {/if}
</div>

<style>
  .exercise {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--bg-elev);
  }
  .exercise h3 {
    margin: 0 0 0.5rem;
    color: var(--accent-warm);
    font-size: 1rem;
  }
  .field {
    margin: 0.6rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .num-input {
    width: 5rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--rule);
    border-radius: 4px;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 0.95rem;
    text-align: center;
  }
  .mark { font-size: 1.2rem; }
  .check-btn {
    margin-top: 0.5rem;
    padding: 0.4rem 1.2rem;
    background: var(--rule);
    color: var(--fg);
    border: 1px solid var(--accent);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .feedback {
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    border-radius: 4px;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .feedback.ok { background: #1e3a23; color: #86efac; border-left: 3px solid #4ade80; }
  .feedback.wrong { background: #3a1e1e; color: #fca5a5; border-left: 3px solid #f87171; }
</style>

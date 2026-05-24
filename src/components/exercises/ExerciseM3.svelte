<script lang="ts">
  let ansV = $state('');
  let ansPsi = $state('');
  let checked = $state(false);

  // UVU† with U(360°) = −I: (−I)V(−I)† = (−1)(−1)V = V
  // U(360°)ψ = −Iψ = −ψ
  const okV = $derived(checked && ansV === 'v');
  const okPsi = $derived(checked && ansPsi === 'neg');
  const allCorrect = $derived(okV && okPsi);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Aplicas una rotación de 360° alrededor de z.
    La matriz SU(2) correspondiente es U(360°) = −I.
  </p>

  <div class="question">
    <p><strong>1.</strong> ¿Qué le pasa al vector V tras el sandwich U V U†?</p>
    <div class="options">
      <label class:selected={ansV === 'v'}><input type="radio" name="q1" value="v" bind:group={ansV} disabled={allCorrect} /> V (sin cambio)</label>
      <label class:selected={ansV === 'neg'}><input type="radio" name="q1" value="neg" bind:group={ansV} disabled={allCorrect} /> −V</label>
      <label class:selected={ansV === 'zero'}><input type="radio" name="q1" value="zero" bind:group={ansV} disabled={allCorrect} /> 0</label>
    </div>
    {#if checked}<span class="mark">{okV ? '✓' : '✗'}</span>{/if}
  </div>

  <div class="question">
    <p><strong>2.</strong> ¿Qué le pasa al espinor ψ tras aplicar U?</p>
    <div class="options">
      <label class:selected={ansPsi === 'psi'}><input type="radio" name="q2" value="psi" bind:group={ansPsi} disabled={allCorrect} /> ψ (sin cambio)</label>
      <label class:selected={ansPsi === 'neg'}><input type="radio" name="q2" value="neg" bind:group={ansPsi} disabled={allCorrect} /> −ψ</label>
      <label class:selected={ansPsi === 'zero'}><input type="radio" name="q2" value="zero" bind:group={ansPsi} disabled={allCorrect} /> 0</label>
    </div>
    {#if checked}<span class="mark">{okPsi ? '✓' : '✗'}</span>{/if}
  </div>

  {#if !allCorrect}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!ansV || !ansPsi}>Comprobar</button>
  {/if}

  {#if checked && allCorrect}
    <div class="feedback ok">
      Correcto. El sandwich (−I)V(−I)† = (−1)²V = V: los dos signos se
      cancelan. El vector no nota la diferencia entre +I y −I. Pero el
      espinor recibe (−I)ψ = −ψ directamente. Esta es la esencia de
      "espinor = raíz cuadrada de vector": el signo que el sandwich
      esconde, el espinor lo lleva.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Revisa. Pista: calcula (−I) V (−I)† expandiendo los signos. Para
      el espinor, simplemente aplica (−I)ψ.
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
  .exercise h3 { margin: 0 0 0.5rem; color: var(--accent-warm); font-size: 1rem; }
  .question { margin: 0.75rem 0; }
  .question p { margin: 0 0 0.3rem; }
  .options { display: grid; gap: 0.3rem; }
  .options label {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--rule); border-radius: 4px;
    cursor: pointer; font-size: 0.92rem;
  }
  .options label:hover { border-color: var(--accent); }
  .options label.selected { border-color: var(--accent); background: #161e2e; }
  .options input { accent-color: var(--accent); }
  .mark { font-size: 1.2rem; margin-left: 0.5rem; }
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

<script lang="ts">
  let answer = $state('');
  let checked = $state(false);

  // 1 ⊗ 1/2 = 3/2 ⊕ 1/2
  const correct = 'a';
  const ok = $derived(checked && answer === correct);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    ¿Cuál es la descomposición en representaciones irreducibles del
    producto tensorial <strong>1 ⊗ ½</strong>?
  </p>

  <div class="options">
    <label class:selected={answer === 'a'}>
      <input type="radio" name="m8" value="a" bind:group={answer} disabled={ok} />
      <strong>3/2 ⊕ 1/2</strong> — dims: 4 + 2 = 6
    </label>
    <label class:selected={answer === 'b'}>
      <input type="radio" name="m8" value="b" bind:group={answer} disabled={ok} />
      <strong>1 ⊕ 0</strong> — dims: 3 + 1 = 4
    </label>
    <label class:selected={answer === 'c'}>
      <input type="radio" name="m8" value="c" bind:group={answer} disabled={ok} />
      <strong>2 ⊕ 1</strong> — dims: 5 + 3 = 8
    </label>
    <label class:selected={answer === 'd'}>
      <input type="radio" name="m8" value="d" bind:group={answer} disabled={ok} />
      <strong>3/2</strong> — dim: 4
    </label>
  </div>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!answer}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. La regla de Clebsch–Gordan: J₁ ⊗ J₂ = (J₁+J₂) ⊕ (J₁+J₂−1) ⊕ … ⊕ |J₁−J₂|.
      Para 1 ⊗ ½: J_max = 3/2, J_min = 1/2.
      Check: dim(3/2) + dim(1/2) = 4 + 2 = 6 = 3 × 2 = dim(1) × dim(1/2). ✓
      Ejemplo físico: un electrón (spin 1/2) en un orbital p (L=1) puede
      tener J = 3/2 o J = 1/2 — el famoso desdoblamiento spin-órbita.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: J va de |J₁ − J₂| a J₁ + J₂ en pasos de 1.
      Y la suma de dimensiones debe ser (2J₁+1)(2J₂+1). Prueba con el
      widget de arriba: selecciona J₁ = 1, J₂ = 1/2.
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

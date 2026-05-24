<script lang="ts">
  let answer = $state('');
  let checked = $state(false);

  // |+x⟩ = (1/√2, 1/√2) apunta a (1, 0, 0) en la esfera de Bloch
  const correct = 'a';
  const ok = $derived(checked && answer === correct);

  const options = [
    { id: 'a', label: '(1, 0, 0)  — polo +x', detail: 'Ecuador, dirección +x' },
    { id: 'b', label: '(0, 0, 1)  — polo norte', detail: 'Polo norte (+z)' },
    { id: 'c', label: '(0, 1, 0)  — polo +y', detail: 'Ecuador, dirección +y' },
    { id: 'd', label: '(1/√2, 1/√2, 0)', detail: 'Dirección a 45° en el plano xy' },
  ];
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    El estado <code>|+x⟩ = (1/√2,  1/√2)</code> corresponde a un autoestado
    de σ_x con autovalor +1. ¿A qué punto de la esfera de Bloch apunta?
  </p>

  <div class="options">
    {#each options as opt}
      <label class="option" class:selected={answer === opt.id}>
        <input type="radio" name="m2q" value={opt.id} bind:group={answer} disabled={ok} />
        <code>{opt.label}</code>
      </label>
    {/each}
  </div>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!answer}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. La dirección de Bloch es ⟨ψ|σ|ψ⟩.
      Para ψ = (1/√2, 1/√2): ⟨σ_x⟩ = 2 Re(α*β) = 1, ⟨σ_y⟩ = 0, ⟨σ_z⟩ = 0.
      El punto está en el ecuador en la dirección +x, coherente con ser
      autoestado de σ_x.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: calcula ⟨ψ|σ_x|ψ⟩, ⟨ψ|σ_y|ψ⟩, ⟨ψ|σ_z|ψ⟩
      con α = β = 1/√2.
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
  .options { display: grid; gap: 0.4rem; margin: 0.75rem 0; }
  .option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--rule);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.92rem;
  }
  .option:hover { border-color: var(--accent); }
  .option.selected { border-color: var(--accent); background: #161e2e; }
  .option input { accent-color: var(--accent); }
  .option code { font-family: var(--font-mono); font-size: 0.9em; }
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
  .check-btn:disabled { opacity: 0.4; cursor: not-allowed; }
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

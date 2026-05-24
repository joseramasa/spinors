<script lang="ts">
  let ansAngle = $state('');
  let checked = $state(false);

  // Two mirrors at 30° → rotation = 2 × 30° = 60°
  const correct = 60;
  const ok = $derived(checked && parseInt(ansAngle) === correct);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Dos espejos planos pasan por el mismo eje y forman un ángulo de
    <strong>30°</strong> entre sí. Un objeto se refleja primero por
    el espejo 1 y luego por el espejo 2.
  </p>
  <p>
    La transformación compuesta equivale a una rotación de
    <input type="number" bind:value={ansAngle} min="0" max="360" step="1" class="num-input" disabled={ok} />
    grados.
  </p>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. La composición de dos reflexiones siempre da una rotación
      cuyo ángulo es el <em>doble</em> del ángulo entre los espejos.
      Es la regla fundamental: el rotor R = u₂u₁ = cos α + sin α · e₁₂
      codifica una rotación de 2α. Mueve el slider del widget de arriba
      a α = 30° para verificarlo visualmente.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: ¿cuál es la relación entre el ángulo entre
      espejos y el ángulo de la rotación compuesta? Experimenta con
      el widget de arriba.
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
  .num-input {
    width: 5rem; padding: 0.3rem 0.5rem;
    border: 1px solid var(--rule); border-radius: 4px;
    background: var(--bg); color: var(--fg);
    font-family: var(--font-mono); font-size: 0.95rem;
    text-align: center;
  }
  .check-btn {
    margin-top: 0.5rem; padding: 0.4rem 1.2rem;
    background: var(--rule); color: var(--fg);
    border: 1px solid var(--accent); border-radius: 4px;
    cursor: pointer; font-size: 0.9rem;
  }
  .feedback {
    margin-top: 0.75rem; padding: 0.6rem 0.8rem;
    border-radius: 4px; font-size: 0.9rem; line-height: 1.5;
  }
  .feedback.ok { background: #1e3a23; color: #86efac; border-left: 3px solid #4ade80; }
  .feedback.wrong { background: #3a1e1e; color: #fca5a5; border-left: 3px solid #f87171; }
</style>

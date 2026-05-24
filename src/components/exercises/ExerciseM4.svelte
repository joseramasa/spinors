<script lang="ts">
  let answer = $state('');
  let checked = $state(false);

  // q and -q produce the same rotation via sandwich qvq*
  const correct = 'same';
  const ok = $derived(checked && answer === correct);
</script>

<div class="exercise">
  <h3>Ejercicio</h3>
  <p>
    Considera los cuaterniones unitarios
    <code>q = (0.5, 0.5, 0.5, 0.5)</code> y
    <code>q' = (−0.5, −0.5, −0.5, −0.5)</code>.
  </p>
  <p>¿Qué relación tienen las rotaciones que producen?</p>

  <div class="options">
    <label class:selected={answer === 'same'}>
      <input type="radio" name="m4" value="same" bind:group={answer} disabled={ok} />
      Producen la <strong>misma</strong> rotación
    </label>
    <label class:selected={answer === 'opposite'}>
      <input type="radio" name="m4" value="opposite" bind:group={answer} disabled={ok} />
      Producen rotaciones <strong>opuestas</strong> (una deshace la otra)
    </label>
    <label class:selected={answer === 'perp'}>
      <input type="radio" name="m4" value="perp" bind:group={answer} disabled={ok} />
      Producen rotaciones <strong>perpendiculares</strong>
    </label>
  </div>

  {#if !ok}
    <button class="check-btn" onclick={() => (checked = true)} disabled={!answer}>Comprobar</button>
  {/if}

  {#if checked && ok}
    <div class="feedback ok">
      Correcto. q' = −q, y el sandwich qvq* = (−q)v(−q)* porque los
      dos signos se cancelan. Esta es exactamente la redundancia 2:1 del
      doble cubrimiento: ±q ∈ SU(2) representan la misma rotación en SO(3).
      La 3-esfera tiene dos puntos por cada rotación.
    </div>
  {:else if checked}
    <div class="feedback wrong">
      Incorrecto. Pista: calcula q'vq'* sabiendo que q' = −q.
      ¿Qué pasa con el signo en el sandwich?
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

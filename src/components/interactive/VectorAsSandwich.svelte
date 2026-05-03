<script lang="ts">
  import katex from 'katex';
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { DoubleSide } from 'three';
  import {
    pauliVector,
    spinorOuter,
    mat2Mul,
    mat2Dagger,
    mat2Scale,
    mat2Add,
    mat2Apply,
    I2,
    uZ,
    mat2ToTeX,
    spinorToTeX,
    blochAnglesToSpinor,
    fmtR,
    type Mat2,
    type Spinor,
  } from '../../lib/spinor';

  // ------- Estado de entrada -------
  let vx = $state(0.6);
  let vy = $state(0.4);
  let vz = $state(0.7);
  let gammaDeg = $state(0);
  let alphaDeg = $state(0);

  const gamma = $derived((gammaDeg * Math.PI) / 180);
  const alpha = $derived((alphaDeg * Math.PI) / 180);

  // ------- Derivadas -------
  const v = $derived<[number, number, number]>([vx, vy, vz]);
  const vmag = $derived(Math.hypot(vx, vy, vz));
  const nhat = $derived<[number, number, number]>(
    vmag > 1e-9 ? [vx / vmag, vy / vmag, vz / vmag] : [0, 0, 1],
  );

  // V = σ · v (matriz hermítica de traza nula)
  const V: Mat2 = $derived(pauliVector(v));

  // Espinor +eigenvector de σ·n̂, con fase global γ del usuario.
  const theta = $derived(Math.acos(Math.max(-1, Math.min(1, nhat[2]))));
  const phi = $derived(Math.atan2(nhat[1], nhat[0]));
  const psi: Spinor = $derived(blochAnglesToSpinor(theta, phi, gamma));

  // Producto externo y verificación |v|(2ψψ† − I) = V.
  const outer = $derived(spinorOuter(psi));
  const verify: Mat2 = $derived(
    mat2Scale(mat2Add(mat2Scale(outer, 2), mat2Scale(I2, -1)), vmag),
  );

  // Rotación U_z(α) y matrices conjugadas.
  const U: Mat2 = $derived(uZ(alpha));
  const Udag: Mat2 = $derived(mat2Dagger(U));
  const Vrot: Mat2 = $derived(mat2Mul(mat2Mul(U, V), Udag));
  const psiRot: Spinor = $derived(mat2Apply(U, psi));

  // Para el viz 3D: dirección rotada de v y ángulo de fase de ψ rotado.
  const vRotated = $derived<[number, number, number]>([
    vmag * Math.sin(theta) * Math.cos(phi + alpha),
    vmag * Math.sin(theta) * Math.sin(phi + alpha),
    vmag * Math.cos(theta),
  ]);
  // Quaternion que envía +z → dirección de v rotado (radio cualquiera).
  const blochQuat = $derived<[number, number, number, number]>(((): [
    number,
    number,
    number,
    number,
  ] => {
    const t = theta;
    const p = phi + alpha;
    const cy = Math.cos(t / 2);
    const sy = Math.sin(t / 2);
    const cz = Math.cos(p / 2);
    const sz = Math.sin(p / 2);
    return [-sz * sy, cz * sy, cy * sz, cz * cy];
  })());
  // Rotación del flag relativa al asta = γ − α/2 (el ψ acumula −α/2 de fase global efectiva).
  const flagRot = $derived(gamma - alpha / 2);
  // Indicador de signo: ψ_α=2π·n flips de signo cuando |α/2| pasa por π.
  const signFlipped = $derived(
    Math.cos(alpha / 2) < 0,
  );

  // ------- KaTeX helpers -------
  const tex = (s: string, d = false) =>
    katex.renderToString(s, { displayMode: d, throwOnError: false });

  const Vtex = $derived(tex(`V \\;=\\; ${mat2ToTeX(V)}`, true));
  const psiTex = $derived(tex(`\\psi_+ \\;=\\; ${spinorToTeX(psi)}`, true));
  const verifyTex = $derived(
    tex(
      `|\\mathbf v|\\,\\bigl(2\\,\\psi_+ \\psi_+^\\dagger - \\mathbb{1}\\bigr) \\;=\\; ${mat2ToTeX(verify)} \\;\\equiv\\; V`,
      true,
    ),
  );
  const Utex = $derived(
    tex(
      `U_z(\\alpha) \\;=\\; ${mat2ToTeX(U)} \\;=\\; \\exp\\!\\bigl(\\!-i\\,\\tfrac{\\alpha}{2}\\,\\sigma_z\\bigr)`,
      true,
    ),
  );
  const VrotTex = $derived(tex(`U V U^\\dagger \\;=\\; ${mat2ToTeX(Vrot)}`, true));
  const psiRotTex = $derived(tex(`U \\psi_+ \\;=\\; ${spinorToTeX(psiRot)}`, true));
  const summaryTex = $derived(
    tex(
      `|\\mathbf v|^2 = ${fmtR(vmag * vmag)} \\quad\\Longrightarrow\\quad \\det V = -|\\mathbf v|^2 = ${fmtR(-vmag * vmag)}`,
      true,
    ),
  );

  // ------- Presets -------
  type Preset = { label: string; v: [number, number, number] };
  const presets: Preset[] = [
    { label: '+x̂', v: [1, 0, 0] },
    { label: '+ŷ', v: [0, 1, 0] },
    { label: '+ẑ', v: [0, 0, 1] },
    { label: 'diagonal', v: [0.6, 0.4, 0.7] },
  ];
  const setPreset = (p: Preset) => {
    [vx, vy, vz] = p.v;
  };
</script>

<div class="vas">
  <div class="canvas-wrap">
    <Canvas>
      <T.PerspectiveCamera position={[2.6, 1.8, 2.6]} fov={45} makeDefault>
        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={2.2}
          maxDistance={6}
          target={[0, 0, 0]}
        />
      </T.PerspectiveCamera>
      <T.AmbientLight intensity={0.55} />
      <T.DirectionalLight position={[4, 6, 3]} intensity={1.1} />

      <!-- esfera de referencia de radio 1 -->
      <T.Mesh>
        <T.SphereGeometry args={[1, 32, 24]} />
        <T.MeshBasicMaterial color="#3f4658" wireframe transparent opacity={0.35} />
      </T.Mesh>

      <!-- ejes -->
      {#each [
        { dir: [1, 0, 0], color: '#f87171' },
        { dir: [0, 1, 0], color: '#4ade80' },
        { dir: [0, 0, 1], color: '#60a5fa' },
      ] as ax}
        <T.Mesh
          position={[ax.dir[0] * 0.7, ax.dir[1] * 0.7, ax.dir[2] * 0.7]}
          rotation={[
            ax.dir[1] === 1 ? 0 : ax.dir[2] === 1 ? Math.PI / 2 : 0,
            ax.dir[0] === 1 ? 0 : ax.dir[2] === 1 ? 0 : Math.PI / 2,
            ax.dir[0] === 1 ? -Math.PI / 2 : 0,
          ]}
        >
          <T.CylinderGeometry args={[0.005, 0.005, 1.4, 8]} />
          <T.MeshBasicMaterial color={ax.color} />
        </T.Mesh>
      {/each}

      <!-- Vector v y flag agrupados con quaternion que apunta a la dirección rotada. -->
      <T.Group quaternion={blochQuat}>
        <!-- Asta cilíndrica de longitud |v| a lo largo de +z local -->
        <T.Group rotation.x={Math.PI / 2}>
          <T.Mesh position={[0, vmag / 2, 0]}>
            <T.CylinderGeometry args={[0.018, 0.018, Math.max(vmag, 0.001), 16]} />
            <T.MeshStandardMaterial color="#7dd3fc" />
          </T.Mesh>
        </T.Group>
        <!-- Cabeza de flecha (cono) -->
        <T.Mesh position={[0, 0, vmag]} rotation.x={Math.PI / 2}>
          <T.ConeGeometry args={[0.06, 0.18, 16]} />
          <T.MeshStandardMaterial color="#7dd3fc" />
        </T.Mesh>
        <!-- Bandera unida a la punta, rota con γ − α/2 -->
        <T.Group position={[0, 0, vmag]} rotation.z={flagRot}>
          <T.Mesh position={[0.18, 0, -0.085]} rotation={[Math.PI / 2, 0, 0]}>
            <T.PlaneGeometry args={[0.34, 0.17]} />
            <T.MeshStandardMaterial color="#fcd34d" side={DoubleSide} />
          </T.Mesh>
          <T.Mesh position={[0.18, 0, -0.005]}>
            <T.BoxGeometry args={[0.34, 0.012, 0.012]} />
            <T.MeshStandardMaterial color="#f59e0b" />
          </T.Mesh>
        </T.Group>
      </T.Group>
    </Canvas>
  </div>

  <div class="controls">
    <div class="presets">
      {#each presets as p}
        <button type="button" onclick={() => setPreset(p)}>{p.label}</button>
      {/each}
    </div>

    <label class="slider">
      <span>v_x: <strong>{fmtR(vx)}</strong></span>
      <input type="range" min="-1" max="1" step="0.02" bind:value={vx} />
    </label>
    <label class="slider">
      <span>v_y: <strong>{fmtR(vy)}</strong></span>
      <input type="range" min="-1" max="1" step="0.02" bind:value={vy} />
    </label>
    <label class="slider">
      <span>v_z: <strong>{fmtR(vz)}</strong></span>
      <input type="range" min="-1" max="1" step="0.02" bind:value={vz} />
    </label>
    <label class="slider">
      <span>γ <em>(fase del espinor)</em>: <strong>{gammaDeg.toFixed(0)}°</strong></span>
      <input type="range" min="0" max="360" step="1" bind:value={gammaDeg} />
    </label>
    <label class="slider rotation">
      <span>
        α <em>(rotación física en torno a ẑ)</em>:
        <strong>{alphaDeg.toFixed(0)}°</strong>
        <span class="sign" class:flipped={signFlipped}>{signFlipped ? 'ψ → −ψ' : 'ψ regular'}</span>
      </span>
      <input type="range" min="0" max="720" step="1" bind:value={alphaDeg} />
      <div class="ticks"><span>0°</span><span>360°</span><span>720°</span></div>
    </label>
  </div>

  <div class="board">
    <div class="bcell summary">{@html summaryTex}</div>
    <div class="bcell">{@html Vtex}</div>
    <div class="bcell">{@html psiTex}</div>
    <div class="bcell wide">{@html verifyTex}</div>
    <div class="bcell wide">{@html Utex}</div>
    <div class="bcell">{@html VrotTex}</div>
    <div class="bcell">{@html psiRotTex}</div>
  </div>
</div>

<style>
  .vas {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    grid-template-areas:
      'scene'
      'controls'
      'board';
  }
  @media (min-width: 760px) {
    .vas {
      grid-template-columns: 1.05fr 0.95fr;
      grid-template-areas:
        'scene controls'
        'board board';
    }
  }
  .canvas-wrap {
    grid-area: scene;
    height: 380px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c12;
    touch-action: none;
  }
  .controls {
    grid-area: controls;
    display: grid;
    gap: 0.55rem;
    align-content: start;
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .presets button {
    background: #1a1f2c;
    border: 1px solid var(--rule);
    color: var(--fg);
    border-radius: 4px;
    padding: 0.35rem 0.7rem;
    font-family: var(--font-mono);
    font-size: 13px;
    cursor: pointer;
  }
  .presets button:hover {
    border-color: var(--accent);
  }
  .slider {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.95rem;
  }
  .slider em {
    color: var(--fg-mute);
    font-style: normal;
    font-size: 0.85em;
  }
  .slider input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  .rotation {
    margin-top: 0.4rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--rule);
  }
  .ticks {
    display: flex;
    justify-content: space-between;
    color: var(--fg-mute);
    font-size: 12px;
    font-family: var(--font-mono);
  }
  .sign {
    margin-left: 0.5rem;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 0.05rem 0.4rem;
    border-radius: 3px;
    background: #1e3a23;
    color: #86efac;
  }
  .sign.flipped {
    background: #3a1e1e;
    color: #fca5a5;
  }
  .board {
    grid-area: board;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.7rem;
    background: #0a0c12;
    border: 1px solid var(--rule);
    border-radius: 6px;
    padding: 1rem;
  }
  @media (min-width: 760px) {
    .board {
      grid-template-columns: 1fr 1fr;
    }
  }
  .bcell {
    overflow-x: auto;
    padding: 0.2rem;
  }
  .bcell.wide {
    grid-column: 1 / -1;
  }
  .bcell.summary {
    grid-column: 1 / -1;
    color: var(--fg-mute);
    font-size: 0.95em;
  }
</style>

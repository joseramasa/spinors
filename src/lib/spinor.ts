/**
 * Mínimo de álgebra de espinores para los widgets.
 * Convención: ψ = (α, β) ∈ C², representado como [reα, imα, reβ, imβ].
 */

export type Complex = [number, number]; // [re, im]
export type Spinor = [Complex, Complex];

export const C0: Complex = [0, 0];
export const C1: Complex = [1, 0];

export function cmul(a: Complex, b: Complex): Complex {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
}

export function cscale(a: Complex, s: number): Complex {
  return [a[0] * s, a[1] * s];
}

export function cphase(theta: number): Complex {
  return [Math.cos(theta), Math.sin(theta)];
}

/**
 * U_z(φ) ψ — rotación del espinor por ángulo físico φ alrededor de z.
 * U_z = exp(-i φ σ_z / 2) = diag(e^{-iφ/2}, e^{+iφ/2})
 * Cada componente acumula la mitad del ángulo.
 */
export function rotZ(psi: Spinor, phi: number): Spinor {
  const half = phi / 2;
  return [cmul(cphase(-half), psi[0]), cmul(cphase(+half), psi[1])];
}

/**
 * Dirección de Bloch ⟨ψ|σ|ψ⟩ para ψ normalizado.
 * Devuelve [x, y, z] en la 2-esfera.
 */
export function blochDirection(psi: Spinor): [number, number, number] {
  const [a, b] = psi;
  // ⟨ψ|σ_x|ψ⟩ = 2 Re(a* b)
  const x = 2 * (a[0] * b[0] + a[1] * b[1]);
  // ⟨ψ|σ_y|ψ⟩ = 2 Im(a* b)
  const y = 2 * (a[0] * b[1] - a[1] * b[0]);
  // ⟨ψ|σ_z|ψ⟩ = |a|² − |b|²
  const z = a[0] * a[0] + a[1] * a[1] - b[0] * b[0] - b[1] * b[1];
  return [x, y, z];
}

/** Formatea un complejo como string con 2 decimales y signo explícito en la parte imaginaria. */
export function fmtC(c: Complex, prec = 2): string {
  const r = c[0].toFixed(prec);
  const i = c[1];
  if (Math.abs(i) < 10 ** -prec) return r;
  const sign = i >= 0 ? '+' : '−';
  return `${r} ${sign} ${Math.abs(i).toFixed(prec)}i`;
}

/**
 * Espinor parametrizado por ángulos polares (θ, φ) sobre la esfera de Bloch
 * y una fase global γ. Convención estándar:
 *   ψ(θ, φ, γ) = e^{iγ} ( cos(θ/2),  e^{iφ} sin(θ/2) )
 * Da ⟨σ⟩ = ( sin θ cos φ, sin θ sin φ, cos θ ).
 */
export function blochAnglesToSpinor(theta: number, phi: number, gamma = 0): Spinor {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const eg = cphase(gamma);
  const ep = cphase(phi);
  return [cscale(eg, c), cmul(eg, cscale(ep, s))];
}

/**
 * Recupera (θ, φ) de un espinor (ignora fase y norma).
 * φ se calcula como arg(β) − arg(α). θ ∈ [0, π], φ ∈ (−π, π].
 */
export function spinorToBlochAngles(psi: Spinor): { theta: number; phi: number } {
  const [a, b] = psi;
  const ra = Math.hypot(a[0], a[1]);
  const rb = Math.hypot(b[0], b[1]);
  const norm = Math.hypot(ra, rb);
  if (norm === 0) return { theta: 0, phi: 0 };
  const theta = 2 * Math.atan2(rb, ra);
  const phi = ra === 0 || rb === 0 ? 0 : Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]);
  // Normaliza φ a (−π, π]
  let p = phi;
  while (p > Math.PI) p -= 2 * Math.PI;
  while (p <= -Math.PI) p += 2 * Math.PI;
  return { theta, phi: p };
}

/** Multiplica el espinor por una fase global e^{iγ} (no cambia el punto de Bloch). */
export function applyGlobalPhase(psi: Spinor, gamma: number): Spinor {
  const eg = cphase(gamma);
  return [cmul(eg, psi[0]), cmul(eg, psi[1])];
}

/**
 * Trayectoria del campo eléctrico para el vector de Jones (α, β):
 *   E(t) = Re[ (α, β) · e^{−iωt} ]
 * Devuelve N puntos (Ex, Ey) sobre un periodo completo (ωt ∈ [0, 2π)).
 */
export function jonesEllipse(psi: Spinor, n = 96): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let k = 0; k < n; k++) {
    const wt = (2 * Math.PI * k) / n;
    const ph: Complex = [Math.cos(wt), -Math.sin(wt)];
    const ex = cmul(psi[0], ph)[0];
    const ey = cmul(psi[1], ph)[0];
    out.push([ex, ey]);
  }
  return out;
}

/**
 * Clasifica cualitativamente la polarización de un espinor leído como Jones.
 * Devuelve un nombre corto: "lineal H", "circular R", "elíptica L", etc.
 */
export function polarizationLabel(psi: Spinor): string {
  const ra = Math.hypot(psi[0][0], psi[0][1]);
  const rb = Math.hypot(psi[1][0], psi[1][1]);
  if (ra < 1e-6) return 'lineal V';
  if (rb < 1e-6) return 'lineal H';
  // diferencia de fase Δ = arg(β) − arg(α)
  const dp = Math.atan2(psi[1][1], psi[1][0]) - Math.atan2(psi[0][1], psi[0][0]);
  let d = dp;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d <= -Math.PI) d += 2 * Math.PI;
  const balanced = Math.abs(ra - rb) < 0.05 * Math.max(ra, rb);
  const ratio = rb / ra;
  // Casi en fase / contrafase → lineal
  if (Math.abs(d) < 0.05 || Math.abs(Math.abs(d) - Math.PI) < 0.05) {
    const ang = Math.atan(ratio) * (180 / Math.PI);
    const sign = Math.abs(d) < Math.PI / 2 ? '+' : '−';
    return `lineal ${sign}${ang.toFixed(0)}°`;
  }
  // Δ ≈ ±π/2 y módulos iguales → circular
  if (balanced && Math.abs(Math.abs(d) - Math.PI / 2) < 0.05) {
    return d > 0 ? 'circular L' : 'circular R';
  }
  return d > 0 ? 'elíptica L' : 'elíptica R';
}

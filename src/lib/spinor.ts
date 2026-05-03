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

/* ------------------------------------------------------------------ */
/*  Matrices 2×2 complejas — soporte para M3 y posteriores            */
/* ------------------------------------------------------------------ */

/** Matriz 2×2 compleja en orden row-major: [a, b, c, d] = [[a, b], [c, d]]. */
export type Mat2 = [Complex, Complex, Complex, Complex];

export const I2: Mat2 = [
  [1, 0],
  [0, 0],
  [0, 0],
  [1, 0],
];

/** Conjugado complejo. */
export function cconj(z: Complex): Complex {
  return [z[0], -z[1]];
}

/** Suma matricial. */
export function mat2Add(A: Mat2, B: Mat2): Mat2 {
  return [
    [A[0][0] + B[0][0], A[0][1] + B[0][1]],
    [A[1][0] + B[1][0], A[1][1] + B[1][1]],
    [A[2][0] + B[2][0], A[2][1] + B[2][1]],
    [A[3][0] + B[3][0], A[3][1] + B[3][1]],
  ];
}

/** Escalado real. */
export function mat2Scale(A: Mat2, s: number): Mat2 {
  return [cscale(A[0], s), cscale(A[1], s), cscale(A[2], s), cscale(A[3], s)];
}

/** Producto A · B. */
export function mat2Mul(A: Mat2, B: Mat2): Mat2 {
  const [a, b, c, d] = A;
  const [e, f, g, h] = B;
  return [
    [a[0] * e[0] - a[1] * e[1] + b[0] * g[0] - b[1] * g[1], a[0] * e[1] + a[1] * e[0] + b[0] * g[1] + b[1] * g[0]],
    [a[0] * f[0] - a[1] * f[1] + b[0] * h[0] - b[1] * h[1], a[0] * f[1] + a[1] * f[0] + b[0] * h[1] + b[1] * h[0]],
    [c[0] * e[0] - c[1] * e[1] + d[0] * g[0] - d[1] * g[1], c[0] * e[1] + c[1] * e[0] + d[0] * g[1] + d[1] * g[0]],
    [c[0] * f[0] - c[1] * f[1] + d[0] * h[0] - d[1] * h[1], c[0] * f[1] + c[1] * f[0] + d[0] * h[1] + d[1] * h[0]],
  ];
}

/** Daga (transpuesta conjugada). */
export function mat2Dagger(A: Mat2): Mat2 {
  return [cconj(A[0]), cconj(A[2]), cconj(A[1]), cconj(A[3])];
}

/** Aplica una matriz a un espinor columna. */
export function mat2Apply(A: Mat2, psi: Spinor): Spinor {
  return [
    [
      A[0][0] * psi[0][0] - A[0][1] * psi[0][1] + A[1][0] * psi[1][0] - A[1][1] * psi[1][1],
      A[0][0] * psi[0][1] + A[0][1] * psi[0][0] + A[1][0] * psi[1][1] + A[1][1] * psi[1][0],
    ],
    [
      A[2][0] * psi[0][0] - A[2][1] * psi[0][1] + A[3][0] * psi[1][0] - A[3][1] * psi[1][1],
      A[2][0] * psi[0][1] + A[2][1] * psi[0][0] + A[3][0] * psi[1][1] + A[3][1] * psi[1][0],
    ],
  ];
}

/**
 * Vector de Pauli: V = v_x σ_x + v_y σ_y + v_z σ_z.
 *   V = [[ v_z, v_x − i v_y ], [ v_x + i v_y, −v_z ]]
 * Hermítica, traza nula, det V = −|v|².
 */
export function pauliVector(v: [number, number, number]): Mat2 {
  return [
    [v[2], 0],
    [v[0], -v[1]],
    [v[0], v[1]],
    [-v[2], 0],
  ];
}

/** Producto externo |ψ⟩⟨ψ| como matriz 2×2 (cuando ψ está normalizado, es un proyector). */
export function spinorOuter(psi: Spinor): Mat2 {
  const [a, b] = psi;
  return [
    cmul(a, cconj(a)),
    cmul(a, cconj(b)),
    cmul(b, cconj(a)),
    cmul(b, cconj(b)),
  ];
}

/** Norma cuadrada de un espinor. */
export function spinorNorm2(psi: Spinor): number {
  return psi[0][0] ** 2 + psi[0][1] ** 2 + psi[1][0] ** 2 + psi[1][1] ** 2;
}

/** Normaliza un espinor (devuelve [0,0,0,0] si la norma es nula). */
export function normalize(psi: Spinor): Spinor {
  const n = Math.sqrt(spinorNorm2(psi));
  if (n < 1e-12) return [[0, 0], [0, 0]];
  return [cscale(psi[0], 1 / n), cscale(psi[1], 1 / n)];
}

/**
 * Matriz SU(2) de rotación física de ángulo α alrededor del eje z:
 *   U_z(α) = exp(−i α σ_z / 2) = diag(e^{−iα/2}, e^{+iα/2}).
 */
export function uZ(alpha: number): Mat2 {
  const c = Math.cos(alpha / 2);
  const s = Math.sin(alpha / 2);
  return [
    [c, -s],
    [0, 0],
    [0, 0],
    [c, s],
  ];
}

/** Formatea un número con 2 decimales y signo unicode. */
export function fmtR(x: number, prec = 2): string {
  if (Math.abs(x) < 0.5 * 10 ** -prec) return (0).toFixed(prec);
  return x.toFixed(prec).replace('-', '−');
}

/** Formatea un complejo dentro de matriz LaTeX (sin paréntesis cuando es real). */
export function fmtCTeX(c: Complex, prec = 2): string {
  const i = c[1];
  if (Math.abs(i) < 0.5 * 10 ** -prec) return fmtR(c[0], prec);
  if (Math.abs(c[0]) < 0.5 * 10 ** -prec) {
    return `${fmtR(i, prec)}\\,i`;
  }
  const sign = i >= 0 ? '+' : '−';
  return `${fmtR(c[0], prec)} ${sign} ${fmtR(Math.abs(i), prec)}\\,i`;
}

/** Renderiza una Mat2 como cuerpo de bmatrix LaTeX. */
export function mat2ToTeX(M: Mat2, prec = 2): string {
  const [a, b, c, d] = M;
  return `\\begin{pmatrix} ${fmtCTeX(a, prec)} & ${fmtCTeX(b, prec)} \\\\ ${fmtCTeX(c, prec)} & ${fmtCTeX(d, prec)} \\end{pmatrix}`;
}

/** Renderiza un espinor (columna) como pmatrix LaTeX. */
export function spinorToTeX(psi: Spinor, prec = 2): string {
  return `\\begin{pmatrix} ${fmtCTeX(psi[0], prec)} \\\\ ${fmtCTeX(psi[1], prec)} \\end{pmatrix}`;
}

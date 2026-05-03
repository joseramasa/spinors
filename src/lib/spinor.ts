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
 * Espinor parametrizado por ángulos esféricos:
 *   ψ(θ, φ) = (cos(θ/2), e^{iφ} sin(θ/2))
 * Más una fase global γ (e^{iγ} multiplicando ambos componentes).
 */
export function spinorFromAngles(theta: number, phi: number, gamma = 0): Spinor {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // primera componente: c · e^{iγ}
  const a: Complex = [c * Math.cos(gamma), c * Math.sin(gamma)];
  // segunda componente: s · e^{i(γ+φ)}
  const b: Complex = [s * Math.cos(gamma + phi), s * Math.sin(gamma + phi)];
  return [a, b];
}

/** Norma cuadrada de ψ (= ⟨ψ|ψ⟩). Para uso de validación. */
export function normSq(psi: Spinor): number {
  return psi[0][0] ** 2 + psi[0][1] ** 2 + psi[1][0] ** 2 + psi[1][1] ** 2;
}

export type PolarizationKind =
  | 'horizontal'
  | 'vertical'
  | 'diagonal'
  | 'anti-diagonal'
  | 'right-circular'
  | 'left-circular'
  | 'elliptical'
  | 'lineal';

/** Clasifica la polarización. Tolerancia ε para detectar casos puros. */
export function polarizationKind(psi: Spinor, eps = 0.04): PolarizationKind {
  const [a, b] = psi;
  const ax = a[0], ay = a[1], bx = b[0], by = b[1];
  const absA = Math.hypot(ax, ay);
  const absB = Math.hypot(bx, by);
  if (absB < eps) return 'horizontal';
  if (absA < eps) return 'vertical';
  // Diferencia de fase entre β y α
  const phaseDiff = Math.atan2(by * ax - bx * ay, bx * ax + by * ay); // arg(β/α)
  // Linear si phaseDiff ≈ 0 o ±π
  const isLinear = Math.abs(Math.sin(phaseDiff)) < eps;
  if (isLinear) {
    if (Math.abs(absA - absB) < eps) {
      return Math.cos(phaseDiff) > 0 ? 'diagonal' : 'anti-diagonal';
    }
    return 'lineal';
  }
  // Circular si |α| ≈ |β| y phaseDiff ≈ ±π/2
  if (Math.abs(absA - absB) < eps && Math.abs(Math.cos(phaseDiff)) < eps) {
    return phaseDiff > 0 ? 'right-circular' : 'left-circular';
  }
  return 'elliptical';
}

/**
 * Matriz de Pauli V = x σ_x + y σ_y + z σ_z, devuelta como 4 complejos
 * en orden [V₀₀, V₀₁, V₁₀, V₁₁]. Hermítica: V₀₁* = V₁₀.
 */
export function pauliMatrix(v: [number, number, number]): [Complex, Complex, Complex, Complex] {
  const [x, y, z] = v;
  return [
    [z, 0],
    [x, -y], // x − i y
    [x, y], //  x + i y
    [-z, 0],
  ];
}

/** Producto exterior ψψ†, devuelto como [M₀₀, M₀₁, M₁₀, M₁₁]. Hermítica de rango 1. */
export function outerProduct(psi: Spinor): [Complex, Complex, Complex, Complex] {
  const [a, b] = psi;
  const aSq: Complex = [a[0] * a[0] + a[1] * a[1], 0];
  const bSq: Complex = [b[0] * b[0] + b[1] * b[1], 0];
  // ab̄ = (a₀ + i a₁)(b₀ − i b₁) = a₀b₀ + a₁b₁ + i(a₁b₀ − a₀b₁)
  const abBar: Complex = [a[0] * b[0] + a[1] * b[1], a[1] * b[0] - a[0] * b[1]];
  const baBar: Complex = [abBar[0], -abBar[1]];
  return [aSq, abBar, baBar, bSq];
}

/** Aplica la matriz SU(2) U_z(θ) a la matriz V por sandwich U V U†. */
export function sandwichRotZ(
  V: [Complex, Complex, Complex, Complex],
  theta: number,
): [Complex, Complex, Complex, Complex] {
  // U_z(θ) = diag(e^{−iθ/2}, e^{+iθ/2})  ⇒  U V U† modifica solo los off-diagonales:
  //   V'₀₀ = V₀₀, V'₁₁ = V₁₁
  //   V'₀₁ = e^{−iθ} V₀₁,   V'₁₀ = e^{+iθ} V₁₀
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const v01: Complex = [V[1][0] * c + V[1][1] * s, -V[1][0] * s + V[1][1] * c];
  const v10: Complex = [V[2][0] * c - V[2][1] * s, V[2][0] * s + V[2][1] * c];
  return [V[0], v01, v10, V[3]];
}

/**
 * Genera puntos de la elipse de polarización trazada por el campo E real.
 * E(t) = (Re(α e^{-iωt}), Re(β e^{-iωt}))
 * Devuelve `n` muestras parametrizadas en ωt ∈ [0, 2π).
 */
export function polarizationEllipse(psi: Spinor, n = 96): [number, number][] {
  const [a, b] = psi;
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const t = (k / n) * 2 * Math.PI;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    // Re(α e^{-it}) = ax · ct + ay · st
    const ex = a[0] * ct + a[1] * st;
    const ey = b[0] * ct + b[1] * st;
    pts.push([ex, ey]);
  }
  return pts;
}

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

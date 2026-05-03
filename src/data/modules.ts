export interface ModuleEntry {
  slug: string;
  title: string;
  hook: string;
}

export const MODULES: ModuleEntry[] = [
  {
    slug: '01-giro-doble',
    title: 'La pista del giro doble',
    hook: '¿Por qué algunos objetos necesitan 720°?',
  },
  {
    slug: '02-bloch-cp1',
    title: 'La esfera como espacio de estados',
    hook: 'Bloch, Poincaré, CP¹.',
  },
  {
    slug: '03-vector-como-sandwich',
    title: 'Un vector es un sándwich de dos espinores',
    hook: 'Espinor = raíz cuadrada de vector.',
  },
  {
    slug: '04-su2-cubre-so3',
    title: 'SU(2) cubre SO(3)',
    hook: 'Cuaterniones, doble cubrimiento, topología.',
  },
  {
    slug: '05-spacetime-weyl',
    title: 'Espacio-tiempo: SL(2,C) y Weyl',
    hook: 'Boosts, quiralidad y van der Waerden.',
  },
  {
    slug: '06-clifford',
    title: 'Álgebras de Clifford',
    hook: 'La receta universal: reflexiones, bivectores y rotores.',
  },
  {
    slug: '07-dirac',
    title: 'Dirac libre',
    hook: 'Materia, antimateria y el pago físico.',
  },
  {
    slug: '08-lie-representaciones',
    title: 'Lie, representaciones y ladders',
    hook: 'Por qué hay una irrep por dimensión.',
  },
];

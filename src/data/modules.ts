export interface ModuleEntry {
  slug: string;
  title: string;
  hook: string;
}

export const MODULES: ModuleEntry[] = [
  {
    slug: '01-giro-doble',
    title: 'Por qué hace falta un espinor',
    hook: 'Lo que un vector no puede hacer.',
  },
  {
    slug: '02-bloch-cp1',
    title: 'Dónde vive un espinor',
    hook: 'C² es demasiado grande; lo que sobra es una esfera.',
  },
  {
    slug: '03-vector-como-sandwich',
    title: 'Cómo se asocia un espinor con un vector',
    hook: 'La factorización ψψ† y el origen del factor 2.',
  },
  {
    slug: '04-su2-cubre-so3',
    title: 'Por qué hay dos por cada rotación',
    hook: 'La topología de SO(3) que justifica el espinor.',
  },
  {
    slug: '05-spacetime-weyl',
    title: 'Por qué la relatividad parte el espinor',
    hook: 'Boosts, dos quiralidades, paridad rota.',
  },
  {
    slug: '06-clifford',
    title: 'Una receta para cualquier dimensión',
    hook: 'Álgebras de Clifford: reflexiones y bivectores.',
  },
  {
    slug: '07-dirac',
    title: 'Cómo se mueve un electrón libre',
    hook: 'Klein-Gordon falla, Dirac arregla, aparece la antimateria.',
  },
  {
    slug: '08-lie-representaciones',
    title: 'El catálogo de espines',
    hook: 'Una irrep por dimensión: escaleras y Clebsch-Gordan.',
  },
];

# Outline didáctico — Espinores

Curso interactivo destinado a alumnos de últimos años de grado o early-graduate de física/matemáticas. Asumimos: álgebra lineal sólida (autovalores, matrices hermíticas, productos internos complejos), variable compleja básica, mecánica cuántica introductoria (notación bra-ket, regla de Born), y nociones de relatividad especial (transformaciones de Lorentz, métrica de Minkowski). NO cubriremos: cuantización canónica de campos, diagramas de Feynman, renormalización, ni álgebras de Lie clásicas a nivel de teorema de Cartan. La idea es construir intuición geométrica y operativa: qué es un espinor, por qué necesita dos vueltas, cómo se factoriza un vector, y cómo aparece en el Dirac libre.

## Mapa de dependencias

```
M1 (Fenomenología y rotación doble)
 ├── M2 (Esfera de Bloch / CP1 / proyección complejo)
 │    └── M3 (Vector como matriz: factorización en espinores)
 │         ├── M4 (Cuaterniones, SU(2), doble cubrimiento de SO(3))
 │         │    └── M5 (Lorentz: SL(2,C), espinores Weyl, quiralidad)
 │         │         └── M7 (Dirac libre: ondas, espín, antimateria)
 │         └── M6 (Álgebra de Clifford: receta universal)
 │              └── (alimenta M5 con la noción geométrica de bivector y boost)
M8 [opcional / avanzado] (Lie, representaciones, ladders, Clebsch-Gordan)
```

M1 → M2 → M3 son la espina dorsal mínima. M4 y M5 son la generalización a SU(2) y a Lorentz. M6 es el "puente abstracto" que da una receta universal y reinterpreta todo lo anterior (orden didáctico flexible: puede ir antes o después de M5). M7 es el pago físico: Dirac libre con todas las piezas. M8 es opcional para quien quiera entender por qué estas representaciones son únicas.

## Módulos

### Módulo 1 — La pista del giro doble: ¿qué es un espinor?

- **Pregunta de partida:** ¿Por qué algunos objetos en física necesitan dos vueltas completas (720°) para volver a su estado original?
- **Intuición clave:** En espacios "proyectados" donde una fase global es invisible, una rotación física de 360° en el espacio externo solo se ve como media vuelta interna; el objeto interno necesita rotar 720° para cerrar el ciclo.
- **Contenido conceptual:**
  - Truco del cinturón de Dirac y truco del plato/taza: demostraciones físicas del giro doble.
  - Stern–Gerlach: la cuantización del momento angular intrínseco da solo dos resultados (↑, ↓), 180° aparte físicamente pero ortogonales en el espacio de estados.
  - Polarización de la luz como ejemplo clásico: H y V son perpendiculares en el espacio físico (90°) pero diametralmente opuestas en la esfera de Poincaré (180°).
  - Definición operativa provisional: un espinor es un par de números complejos donde una fase global y un escalado global se ignoran.
  - Anuncio del recorrido: 5 escalones (ejemplos físicos → factorización → Clifford → Lie → QFT).
- **Visual / interactivo central:** Animación 3D de una flecha rotando en R³ acoplada a una flecha en una esfera (Bloch/Poincaré) que rota al doble de velocidad. El usuario controla el ángulo θ con un slider de 0 a 720°; ve simultáneamente la flecha externa (vuelta cada 360°) y la flecha interna (vuelta cada 720°), con marcador de signo (+/–) cuando el espinor cambia de signo.
- **Ejercicio sugerido:** Dado un slider de θ y dos checkboxes "vector" / "espinor", el alumno predice cuántos grados se necesitan para que cada uno vuelva al estado inicial. Feedback inmediato al avanzar el slider.
- **Fuentes:** idx 01, 02, 04
- **Pre-requisitos:** ninguno.

### Módulo 2 — La esfera como espacio de estados: Bloch, Poincaré, CP¹

- **Pregunta de partida:** Si solo importa el cociente entre dos números complejos, ¿qué espacio describe en realidad un espinor?
- **Intuición clave:** Un espinor vive en la línea proyectiva compleja CP¹, que es topológicamente una esfera (esfera de Riemann); fase y escala son invisibles, así que la información geométrica está en un punto de la esfera más una "asta de bandera" que recuerda la fase.
- **Contenido conceptual:**
  - Vector de Jones para polarizaciones de luz (H, V, D, A, L, R) y su mapeo a la esfera de Poincaré.
  - Estados de espín cuántico (|+z⟩, |−z⟩, |+x⟩, |−x⟩, |+y⟩, |−y⟩) en la esfera de Bloch: misma matemática, distinto contexto físico.
  - Por qué la fase global y la escala se pueden ignorar (regla de Born normalizada; polarización física no cambia con factor complejo común).
  - Construcción algebraica: cualquier espinor (α, β) con α≠0 está caracterizado por β/α ∈ C ∪ {∞} = CP¹.
  - Visualización tipo "asta de bandera" (flagpole): el punto en la esfera + el ángulo de la bandera codifica la información completa, pero la bandera no afecta al espinor proyectado.
  - Conexión con relación de doblado angular: movimientos en la esfera son la mitad de los movimientos en el espacio físico.
- **Visual / interactivo central:** Esfera de Bloch interactiva con dos vistas acopladas. Vista A: campo eléctrico oscilando (o spin físico) con su orientación física θ. Vista B: punto en la esfera con asta y bandera; el usuario arrastra el punto en la esfera y ve en tiempo real (1) los componentes (α, β) actualizándose, (2) la onda física correspondiente (lineal/elíptica/circular), (3) la flecha "asta de bandera" cuya rotación de fase no mueve el punto.
- **Ejercicio sugerido:** Dada una elipse de polarización dibujada, el alumno arrastra el punto en la esfera para reproducirla. O: dado un espinor (α, β) en formato algebraico, predecir el punto en la esfera antes de visualizar.
- **Fuentes:** idx 02, 03, 04, 05
- **Pre-requisitos:** M1.

### Módulo 3 — Un vector es un sándwich de dos espinores

- **Pregunta de partida:** ¿En qué sentido es un espinor "la raíz cuadrada de un vector"?
- **Intuición clave:** Reescribir un vector 3D como matriz 2×2 (vector de Pauli) revela que esa matriz se puede factorizar (cuando es null) en un espinor columna por un espinor fila. Cada espinor "lleva la mitad" de la información geométrica del vector.
- **Contenido conceptual:**
  - Las matrices de Pauli σ_x, σ_y, σ_z como base de "vectores": traza nula, hermíticas, cuadran a I, anticonmutan.
  - Definición del vector de Pauli V = xσ_x + yσ_y + zσ_z; det(V) = −|v|².
  - Reflexión como conjugación negativa V ↦ −uVu⁻¹; rotación como dos reflexiones, conjugación con producto u₂u₁.
  - Factorización V = ψ ψ† cuando det(V) = 0 (vector null/isótropo); para vectores reales no nulos, descomposición en suma de productos columna-fila.
  - Por qué un espinor rota con UNA matriz SU(2) y un vector con DOS (sandwich U V U†): cada U lleva la mitad del ángulo.
  - Dualidad espinor / dual-espinor (filas vs columnas, índices arriba vs abajo).
- **Visual / interactivo central:** Visualizador de "factorización": el usuario introduce un vector 3D (x, y, z) con tres sliders. Se muestra (1) la matriz de Pauli 2×2 resultante, (2) los componentes del espinor ψ que la factoriza (con la indeterminación visible: aparece un slider extra de fase para ψ), (3) cómo el sandwich U V U† produce la rotación 3D mientras que U ψ produce la mitad de la rotación. Toggle: rotar V vs rotar ψ y ver que ψ tarda el doble en cerrar el ciclo.
- **Ejercicio sugerido:** Dado un vector v y una rotación de 90° en el plano xy, calcular el espinor antes y después y verificar el factor de fase. O: factorizar a mano un vector null como (1, i, 0) en sus dos espinores.
- **Fuentes:** idx 06, 07, 08, 09
- **Pre-requisitos:** M1, M2.

### Módulo 4 — SU(2) cubre SO(3): cuaterniones, doble cubrimiento, topología

- **Pregunta de partida:** ¿Por qué hay dos matrices SU(2) por cada matriz de rotación SO(3)? ¿Qué forma tiene el espacio de rotaciones?
- **Intuición clave:** SU(2) es topológicamente la 3-esfera S³; SO(3) es S³ con puntos antipodales identificados (RP³). Un lazo en SO(3) que parece cerrado es en realidad un camino entre +U y −U en SU(2): por eso el espinor "ve" un signo extra tras una vuelta de 360°.
- **Contenido conceptual:**
  - SO(3) como matrices ortogonales 3×3 con det = +1; su Lie álgebra so(3) (matrices antisimétricas).
  - SU(2) explícita: matrices de la forma (α, β; −β*, α*) con |α|² + |β|² = 1 → 3-esfera.
  - Equivalencia con cuaterniones unitarios: i, j, k corresponden a bivectores σ_yσ_z, σ_zσ_x, σ_xσ_y. Las reglas i²=j²=k²=ijk=−1 emergen.
  - El doble cubrimiento como "RP³ es la mitad de S³": una rotación física tiene dos representantes en SU(2) (±U) que dan el mismo sandwich.
  - Topología: SU(2) (= S³) es simplemente conexo; SO(3) (= RP³) no lo es. Esto explica por qué los espinores existen.
  - Comparación con ángulos de Euler (que dan T³, no RP³, y por eso causan gimbal lock).
- **Visual / interactivo central:** Visualización de doble cubrimiento. Pantalla dividida: izquierda muestra una esfera (representando S³ proyectada) con un punto +U y su antipodal −U; derecha muestra el cuaterniones / SU(2) actuando sobre un cubo o flecha 3D. El usuario rota la flecha 0° → 360° → 720°; ve cómo el punto en S³ recorre la mitad de la esfera tras 360° (llegando al antípoda), y cierra el lazo solo tras 720°. Toggle adicional para mostrar la "trampa del cinturón" como visualización topológica del lazo no contraíble.
- **Ejercicio sugerido:** Dado un par de cuaterniones (q, q'), determinar si rotan el mismo vector o no (¿son ±q?). O: implementar la rotación de un vector usando q v q* y comparar con la matriz SO(3) equivalente.
- **Fuentes:** idx 06, 07, 11
- **Pre-requisitos:** M3.

### Módulo 5 — Espacio-tiempo: SL(2,C), espinores Weyl, quiralidad

- **Pregunta de partida:** ¿Cómo se generaliza todo esto a la relatividad especial, donde además de rotaciones tenemos boosts?
- **Intuición clave:** En espacio-tiempo, la matriz 2×2 que representa un cuadrivector se transforma con SL(2,C) (no SU(2)); rotaciones siguen siendo unitarias pero los boosts no. Aparecen DOS representaciones espinoriales no equivalentes — quiralidad izquierda y derecha — relacionadas por reflexión en un espejo.
- **Contenido conceptual:**
  - Vectores de espacio-tiempo como matrices 2×2 hermíticas con σ_t = I; det = intervalo s².
  - SL(2,C) como doble cubrimiento de SO⁺(1,3): 6 generadores (3 rotaciones + 3 boosts).
  - Boosts como rotaciones hiperbólicas; matrices L hermíticas (no unitarias) con cosh, sinh.
  - Espinores Weyl izquierdos y derechos: rotan igual, boostan al revés. No se pueden intercambiar por cambio de base.
  - Notación van der Waerden con índices punteados para diferenciar L y R.
  - Producto interno con la matriz ε antisimétrica (forma simpléctica) en lugar de daga.
  - El espinor de Dirac como suma directa L ⊕ R: 4 componentes, transforma con matriz block-diagonal.
  - Transformación de paridad: invierte X, Y, Z → cambia signo en boosts → intercambia L ↔ R.
- **Visual / interactivo central:** Esfera de Bloch en relatividad. El usuario aplica una rotación o un boost en la dirección de su elección. Las rotaciones giran la esfera como antes; los boosts deforman el flujo en la esfera (los puntos +n y −n son fijos, los meridianos se desplazan hacia −n). Visualizar SIMULTÁNEAMENTE el espinor L y el R bajo la misma transformación: las rotaciones los mantienen alineados pero los boosts los separan. Toggle de paridad que intercambia L ↔ R.
- **Ejercicio sugerido:** Dado un espinor Weyl izquierdo en reposo, boostarlo en dirección +z y verificar que los componentes de espín up/down escalan con e^(±φ/2). O: comprobar que aplicar paridad dos veces es la identidad.
- **Fuentes:** idx 09, 10, 11
- **Pre-requisitos:** M3, M4.

### Módulo 6 — Álgebras de Clifford: la receta universal

- **Pregunta de partida:** ¿Hay una manera sistemática de construir espinores en cualquier dimensión, no solo en 3D y 4D?
- **Intuición clave:** Una álgebra de Clifford es un álgebra donde los símbolos básicos cuadran a ±1 y anticonmutan. Reflexiones y rotaciones se vuelven operaciones algebraicas naturales (sándwiches), y los espinores aparecen como elementos de ideales mínimos por la izquierda.
- **Contenido conceptual:**
  - Producto wedge (Grassmann) y producto geométrico (Clifford): combinación de producto escalar y wedge.
  - Multivectores: escalares, vectores, bivectores (planos orientados), trivectores. Bivectores como representación natural del momento angular y rotaciones.
  - Reflexión como −uVu⁻¹ y rotación como producto de dos reflexiones; el ángulo de rotación es el doble del ángulo entre los espejos.
  - Bivectores que cuadran a −1 generan rotaciones (vía exponencial estilo Euler); bivectores que cuadran a +1 generan boosts (cosh/sinh).
  - Grupos Spin(n) y Spin(p,q) como exponenciales de bivectores: generalización de cuaterniones a cualquier dimensión.
  - Definición de espinor vía ideales mínimos por la izquierda y proyectores idempotentes (½(1+u) con u² = 1).
  - Mención breve de nilpotentes y subespacios isótropos máximos como receta para construir el proyector.
  - Mapeo entre cl(3,0) y matrices de Pauli; entre cl(1,3) y matrices gamma; entre cuaterniones y subálgebra par de cl(3,0).
- **Visual / interactivo central:** "Compositor de transformaciones geométricas". El usuario coloca dos espejos (vectores unitarios) en una escena 3D y ve un objeto reflejado primero por uno y luego por el otro; la composición resulta en una rotación cuyo eje y ángulo se calculan en vivo. Slider para cambiar el ángulo entre espejos y ver cómo el ángulo de rotación es el doble. Extensión: en una pestaña separada, mismo widget en espacio-tiempo, mostrando que espejos timelike producen boosts.
- **Ejercicio sugerido:** Calcular el bivector que rota +x hacia +y por 90°, exponenciarlo y aplicarlo a un vector. O: verificar que (σ_xσ_y)² = −1 y deducir su analogía con i.
- **Fuentes:** idx 12, 13, 14, 15, 16
- **Pre-requisitos:** M3 (idealmente M4 también, pero puede ir en paralelo).

### Módulo 7 — Dirac libre: el pago físico

- **Pregunta de partida:** ¿Cómo se usan los espinores para describir un electrón libre relativista, y qué significan las cuatro componentes del espinor de Dirac?
- **Intuición clave:** La ecuación de Dirac es la "raíz cuadrada" de la ecuación de Klein-Gordon: para sacar la raíz necesitamos coeficientes que anticonmuten — las matrices gamma. Las cuatro componentes codifican espín up/down × materia/antimateria, organizadas según quiralidad L/R.
- **Contenido conceptual:**
  - Klein-Gordon como cuantización canónica de E² = p² + m²; problema de la densidad de probabilidad negativa.
  - Construcción heurística de Dirac: factorizar (□ + m²) en dos piezas lineales requiere coeficientes con γ_μγ_ν + γ_νγ_μ = 2η_μν → álgebra de Clifford cl(1,3).
  - Bases comunes: chiral (Weyl) y mass (Dirac). Cambio de base con matriz unitaria.
  - Soluciones de onda plana ψ = u(p) e^(−ip·x) y ψ = v(p) e^(+ip·x): dos signos de exponencial → cuatro spinores básicos (u₁, u₂, v₁, v₂).
  - Interpretación moderna: u = materia con energía positiva, v = antimateria; chirality se mezcla bajo boost (un electrón masivo no puede ser puramente L o R en ningún frame).
  - Espinor adjunto ψ̄ = ψ†γ_t y el bilineal Lorentz-invariante ψ̄ψ; corriente conservada j^μ = ψ̄γ^μψ.
  - Proyectores P_L, P_R con γ_5 para extraer las partes quirales.
  - Por qué la fuerza débil solo "ve" partículas left-chiral (anuncio, no derivación).
- **Visual / interactivo central:** Visualizador de soluciones de Dirac. El usuario elige (a) signo de energía (materia/antimateria), (b) espín (up/down), (c) momento p (slider en magnitud y dirección). Se muestran las cuatro componentes complejas del espinor en tiempo real, descompuestas en parte L y parte R. Al boostar, animación que muestra cómo las partes L y R "se separan" (sus magnitudes relativas cambian) mientras que en reposo eran iguales (caso u) u opuestas (caso v). Opción de mostrar el bilineal ψ̄ψ y verificar que es invariante.
- **Ejercicio sugerido:** Para una partícula en reposo, escribir los 4 espinores básicos en la base masa y verificar que son autoestados de γ_t. O: aplicar P_L a un espinor de Dirac general y obtener su parte left-chiral.
- **Fuentes:** idx 22, 23, 24, 25, 26
- **Pre-requisitos:** M5, M6.

### Módulo 8 [opcional / avanzado] — Lie, representaciones, ladders

- **Pregunta de partida:** ¿Por qué hay exactamente una representación irreducible de SU(2) por cada dimensión, y cómo construyo las de espín mayor?
- **Intuición clave:** El álgebra de Lie es el espacio tangente al grupo en la identidad; las representaciones se clasifican por el "peso máximo" (= valor de espín), y los operadores escalera (raising/lowering) generan la base de cada representación irreducible.
- **Contenido conceptual:**
  - Álgebras y grupos de Lie; generadores como derivadas en θ=0; corchete de Lie = conmutador.
  - so(3), su(2), sl(2,C): mismas relaciones de conmutación para so(3) y su(2), por eso son "lo mismo a nivel local".
  - Operadores escalera J⁺, J⁻, J_z; valor del operador de Casimir J(J+1).
  - Construcción de la representación de espín J en dimensión 2J+1.
  - SO(3) solo admite representaciones de dimensión impar (espín entero); por eso las partículas de espín semi-entero requieren su doble cubrimiento SU(2).
  - Producto tensorial de representaciones y coeficientes de Clebsch-Gordan; suma de momentos angulares.
  - Para SL(2,C): representaciones se etiquetan por (J_L, J_R); el cuadrivector es (½, ½), el tensor electromagnético es (1,0) ⊕ (0,1).
- **Visual / interactivo central:** "Constructor de representaciones". El usuario elige un valor de espín J (½, 1, 3/2, 2, ...) y obtiene una visualización de los 2J+1 estados base como puntos en una escalera vertical, con los operadores J⁺ y J⁻ animados como flechas que mueven entre estados. Para producto tensorial: dos escaleras se combinan y el widget muestra cómo los estados se redistribuyen en irreps menores (ej. ½ ⊗ ½ = 1 ⊕ 0, ilustrando triplete + singlete).
- **Ejercicio sugerido:** Calcular ⟨1, 0 | ½ ½, ½ −½⟩ usando la tabla de Clebsch-Gordan. O: verificar que los generadores de su(2) en la representación 3×3 satisfacen las relaciones de conmutación esperadas.
- **Fuentes:** idx 17, 18, 19, 20, 21
- **Pre-requisitos:** M4 (M5 si se incluye Lorentz).

## Prototipos prioritarios (orden de construcción sugerido)

1. **Esfera de Bloch / Poincaré con asta de bandera acoplada al espacio físico** — Es el corazón de M2 y aparece en M1, M5, M7. Demuestra el doblado angular en vivo. Complejidad: media. Librerías candidatas: three.js + custom shader para la asta, o MathBox para mejor anotación matemática. Esto es lo que justifica que el proyecto sea web y no PDF: ningún diagrama estático transmite el "click" del giro doble como un slider sincronizado entre dos espacios.

2. **Visualizador de doble cubrimiento SU(2) → SO(3)** — Sostiene M4, complementa M1. El usuario rota una flecha 360°/720° y ve simultáneamente (a) la flecha en R³ rotando, (b) un punto en una "S³ proyectada" cruzando al antípoda, (c) la trampa del cinturón animada. Complejidad: media-alta (la S³ proyectada requiere proyección estereográfica cuidadosa). Librerías: three.js. Sin esto, "doble cubrimiento" queda como palabras.

3. **Compositor de reflexiones → rotación / boost** — Núcleo de M6, también aparece en M3 y M5. El usuario coloca dos vectores unitarios (espejos) en R³ o en espacio-tiempo 2D, ve un objeto reflejado dos veces, y en la pantalla aparece la rotación/boost equivalente con su ángulo (= doble del ángulo entre espejos). Complejidad: baja-media. Librerías: three.js para 3D, canvas plano para la versión espacio-tiempo. Es la mejor manera de hacer "click" la naturaleza geométrica del álgebra de Clifford.

4. **Factorizador interactivo vector ↔ espinor** — Núcleo de M3. El usuario introduce un vector 3D, ve la matriz de Pauli, ve los espinores que la factorizan (con un slider explícito de fase para mostrar la indeterminación), y aplica una rotación SU(2) para verificar que el espinor rota con UNA matriz mientras el vector rota con DOS. Complejidad: baja. Librerías: plain canvas + KaTeX para mostrar matrices en vivo. Es donde el alumno interioriza "espinor = raíz cuadrada de vector".

5. **Visualizador de soluciones de Dirac (u, v, espín, boost)** — Pago físico de M7. El usuario elige tipo (materia/antimateria), espín, y momento; ve las cuatro componentes complejas, sus partes L y R, y cómo el boost mezcla L con R. Complejidad: alta (requiere mostrar números complejos de manera comprensible y animar la mezcla L/R). Librerías: three.js + canvas adicional para los componentes. Es el widget más ambicioso pero el que conecta toda la maquinaria con un electrón real.

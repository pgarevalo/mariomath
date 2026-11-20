# 🍄 Super Mario Mates

Juego web educativo en español inspirado en **Super Mario Bros**, diseñado para que dos hermanos (por ejemplo, de **12 años** y **6 años**) compitan juntos por turnos practicando las matemáticas de su curso.

## ✨ Características

- **Modo 1 Jugador o 2 Jugadores**: elige al empezar entre jugar en solitario (con **3 vidas ❤️** y vida extra al superar cada mundo) o competir por turnos entre dos hermanos.
- **6 personajes jugables**: Mario, Luigi, Yoshi, Peach, Toad y Wario.
- **Competición estilo Super Mario clásico**:
  - **Dificultad progresiva (⭐ a ⭐⭐⭐⭐)**: las operaciones empiezan muy sencillas al inicio y suben de nivel poco a poco conforme avanza la partida.
  - **Muerte real en juego y en mates**: si te choca un enemigo, caes por un agujero, fallas una operación o se agotan los **30 segundos**, el personaje muere (vuelve al inicio o bandera de control intermedia) y **pasa el turno al otro jugador**.
  - **Si acierta**, ¡mantiene el mando y **sigue jugando**!
- **Momentos matemáticos en partida** (tipo test de 4 opciones con cuenta atrás de 30 s):
  1. **Bloques `?`**: otorgan +250 puntos, monedas y Super Estrella si aciertas (y sigues jugando).
  2. **Llave del Castillo Final**: desbloquea la bandera del castillo (+500 puntos) y avanza al siguiente Mundo.
- **Temario adaptado por jugador**:
  - **Nivel 12 años**: Máximo Común Divisor (**M.C.D.**), Mínimo Común Múltiplo (**m.c.m.**) y **operaciones con fracciones** (`+`, `−`, `×`, `:`) simplificadas a la fracción irreducible, con explicación paso a paso.
  - **Nivel 6 años**: **Sumas con llevadas** y **Restas sin llevadas**, presentadas en formato vertical escolar con columnas de **Decenas (rojo)** y **Unidades (azul)**.

## 🚀 Probar en local

Con **Node.js**:

```bash
npm start
```

O con **Python 3**:

```bash
python3 -m http.server 8080
```

Después abre en el navegador: **http://localhost:8080**

## 🌐 Publicar gratis en GitHub Pages

El juego no requiere base de datos ni compilación externa (funciona 100% en el navegador con HTML5 Canvas + Web Audio API):

1. Sube todos los archivos de esta carpeta a un repositorio de GitHub.
2. En GitHub entra en **Settings → Pages**.
3. En **Source** elige `Deploy from a branch`, selecciona la rama `main` y la carpeta `/ (root)`, y pulsa **Save**.
4. ¡En unos segundos tendrás una URL pública para jugar desde cualquier ordenador o tablet!

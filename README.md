# 🏁 LIGHTS OUT — Plataforma Oficial de Quiz & Minijuegos de F1

Lights Out es una plataforma interactiva de Fórmula 1 inspirada en los diseños más vanguardistas de Dribbble, F1 TV y telemetría de carrera.

---

## 🚀 Características Principales

1. **⚡ F1 Quiz Master (Motor AI Local)**
   - Generación en tiempo real de preguntas complejas basadas en plantillas (títulos, telemetría, récords, radios históricas).
   - Generación de hashes criptográficos SHA-256 por cada pregunta.
   - Verificación de histórico para **garantizar 0 repeticiones por usuario**.

2. **🕵️ F1 Driverle**
   - Adivina el piloto misterioso en 6 intentos.
   - Comparación instantánea: Escudería, Nacionalidad, Dorsal, Debut y Títulos Mundiales.

3. **🗺️ Circuit GeoGuessr**
   - Identificación de circuitos mundiales a partir de trazados SVG de telemetría pura.
   - Sistema de pistas dinámicas con penalización de puntuación.

4. **🪙 Economía de PitCoins & Cosméticos**
   - Gana PitCoins compitiendo en pista.
   - Compra avatares legendarios, insignias de paddock y marcos de telemetría.

5. **🏆 Clasificación & Superlicencia**
   - Sistema de rangos dinámico (desde *Rookie F3* hasta *All-Time Legend*).
   - Leaderboard global en vivo.

6. **👤 Perfil & Subida de Avatares**
   - Subida de avatares directamente desde el dispositivo con preview en vivo.
   - Edición de biografía y país de piloto.

---

## 🛠️ Cómo Ejecutar en Local

### Opción Rápida (Sin dependencias externas)
Puedes servir los archivos de la carpeta `frontend/` con cualquier servidor HTTP local:

```bash
npx serve frontend
# O con Python:
python -m http.server 8080 --directory frontend
```
Abre en tu navegador: `http://localhost:8080`

### Opción Docker Compose (Stack Completo)
```bash
docker compose up --build
```
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

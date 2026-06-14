# VetCardioSIM

Simulador ECG veterinario interactivo, enfocado en el estudio de ritmos cardiacos caninos. Expandible a largo plazo a ritmos felinos.
Proyecto en desarrollo activo como parte de portafolio de Desarrollo Web.

**Demo actual en vivo: ** [vetcardiosim.netlify.app](https://vetcardiosim.netlify.app)

## Características

- Render continuo de ECG mediante Canvas API
- 11 ritmos cardiacos entre regulares y patológicos
- Control de velocidad del barrido
- Control de ganancia/amplitud de onda
- Frecuencia cardiaca ajustable en tiempo real
- Interpretación clínica dinámica según el ritmo
- Visualización estilo ECG real

## Tecnologías

- HTML/CSS/JS puro
- Canvas API
- Datos en JSON
- Hosting estático en Netlify

## Para correr localmente:

Este proyecto usa ```fetch()``` para cargar los datos desde un archivo JSON, por lo que requiere un servidor local (no funciona abriendo `index.html` directamente como archivo).

Con la extensión **Live Server** de VS Code:

1. Clona el repositorio
2. Abre la carpeta en VS Code
3. Click derecho en `index.html` -> **Open with Live Server**

## Roadmap

- [ ] Control de bloqueo de rama (izquierda/derecha/ambas)
- [ ] Vista de aprendizaje separada al simulador
- [ ] Ampliar biblioteca de trazados (15+)
- [ ] Soporte para felinos

## Autor
Diego Nicolás Vílchez Gustavson - UCSP
Todos los derechos reservados.
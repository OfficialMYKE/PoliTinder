# PoliTinder

<p align="center">
  <img src="client/src/assets/logo.png" alt="Identidad PoliTinder" width="180px">
  <br>
  <b>Plataforma de Networking y Matchmaking Académico para la Comunidad EPN</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En_Desarrollo-FF8C00?style=flat-square" alt="Estado">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

## Descripción

PoliTinder es una aplicación web full-stack diseñada para optimizar el networking académico dentro de la Escuela Politécnica Nacional (EPN). La plataforma emplea un algoritmo de emparejamiento basado en afinidad para conectar estudiantes con el propósito de formar grupos de estudio, colaborar en proyectos y ofrecer mentoría entre pares, operando bajo un acceso restringido estrictamente a dominios institucionales (`@epn.edu.ec`).
El sistema sigue una estricta metodología de Separación de Preocupaciones (SoC) utilizando un modelo cliente-servidor, respaldado por una infraestructura Backend-as-a-Service (Supabase) para la sincronización de datos en tiempo real.

## Diseño UI/UX

El prototipo de alta fidelidad de **PoliTinder** fue desarrollado en Figma. Manteniendo una estetica limpia e intuitiva con el usuario. Puedes revisar el prototipo con las pantallas de login y registro en el link adjunto.

[Ver Proyecto en Figma](https://www.figma.com/design/vV9GeAyl9bsATQKDAfl5iU/Politinder?node-id=0-1&p=f&t=244RtCMEasoOLu0R-0)

## Instalación
Para ejecutar este proyecto localmente, necesitas tener instalado [Node.js](https://nodejs.org/) (v18.x o superior) y acceso a una instancia de [Supabase](https://supabase.com/).
1. **Clonar el repositorio y preparar el cliente:**
   ```bash
   git clone [https://github.com/OfficialMYKE/PoliTinder.git](https://github.com/OfficialMYKE/PoliTinder.git)
   cd politinder-workspace/client
   npm install

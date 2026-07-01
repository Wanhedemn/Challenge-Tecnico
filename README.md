# DonaVida 🩸

DonaVida es una plataforma web desarrollada como Challenge Técnico para el proceso de selección de desarrollador Full Stack. La aplicación está diseñada para optimizar y agilizar el proceso de donación de sangre, conectando donantes voluntarios con centros de salud y hospitales en tiempo real.

**Desarrollado por:** Santiago Javier Falconi

---

## Características Principales (Features)

- **Gestión de Turnos:** Reserva de turnos rápida e intuitiva para donantes.
- **Alertas de Urgencias:** Carrusel en tiempo real mostrando las necesidades críticas de sangre por hospital y grupo sanguíneo.
- **Mapa Interactivo:** Visualización geolocalizada de los centros de donación cercanos utilizando Leaflet.
- **Autenticación Segura:** Registro e inicio de sesión integrados nativamente mediante Supabase Auth.
- **Pre-Triage Dinámico:** Cuestionario previo para evaluar la aptitud del donante antes de proceder a la reserva.
- **Panel de Control (Dashboard):** Vista personalizada para visualizar historiales de turnos y urgencias activas.

---

## Tecnologías Utilizadas

Este proyecto adopta un enfoque Full-Stack moderno impulsado por las siguientes tecnologías:

- **Next.js (App Router):** Framework principal para el renderizado SSR, optimización y enrutamiento.
- **React:** Construcción robusta de interfaces de usuario interactivas.
- **Supabase:** Backend-as-a-Service (BaaS) utilizado para autenticación, base de datos PostgreSQL y políticas de seguridad (RLS).
- **Tailwind CSS:** Estilización ágil mediante clases utilitarias para lograr una UI limpia, minimalista y profesional.
- **Leaflet:** Biblioteca principal para la renderización y gestión de mapas interactivos.

---

## Desarrollo Asistido por IA (AI-Assisted Development)

El desarrollo de esta plataforma fue orquestado utilizando asistentes de IA generativa bajo una metodología de Arquitecto y Auditor de QA. La IA funcionó como un copiloto experto para:

- Maquetación y estilización eficiente de componentes.
- Refactorización de la estructura del proyecto y optimización de rutas.

El desarrollador se mantuvo en todo momento como responsable de la calidad, validación de la lógica, seguridad y auditoría técnica final.

---

## Estructura del Proyecto

El código fuente está modularizado siguiendo buenas prácticas para asegurar su escalabilidad:

- `app/` : Rutas de la aplicación (páginas, layouts globales).
- `components/` : Componentes de interfaz reutilizables segregados por dominio.
- `lib/` : Utilidades globales y configuración de clientes (SDK de Supabase).
- `database/` : Directorio centralizado que almacena todas las migraciones, esquemas y triggers de SQL.

---

## Instalación y Configuración Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Wanhedemn/Challenge-Tecnico.git
cd Challenge-Tecnico
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Clona el archivo de configuración de ejemplo:
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus claves de proyecto de Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 4. Inicializar la Base de Datos
Ejecuta los scripts encontrados en la carpeta `/database` en el SQL Editor de tu panel de Supabase en el siguiente orden:

1. `schema.sql` (Creación de tablas y políticas).
2. Scripts de migración y datos iniciales (ej. `centros_donacion.sql`).
3. Triggers de automatización (ej. `trigger_auth.sql`).

### 5. Iniciar el Servidor
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

> Construido con precisión técnica para demostrar capacidades Full-Stack. ¡Donar sangre es donar vida! 🩸

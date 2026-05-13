# 🐾 Adopta Zulia

Bienvenido al repositorio oficial de **Adopta Zulia**.

> [!IMPORTANT]
> **Este proyecto no es una plantilla.** Este es el código fuente de la plataforma activa **Adopta Zulia**. El objetivo de este repositorio es permitir que la comunidad de desarrolladores colabore, mejore y mantenga la plataforma existente. Si deseas apoyar la causa, ¡tu ayuda es bienvenida!

## 🤝 Cómo Contribuir

Queremos que seas parte de este proyecto. Aquí hay algunas formas en las que puedes ayudar:

1.  **Reportar problemas**: Si encuentras un bug, abre un "Issue".
2.  **Sugerir mejoras**: Tienes ideas para nuevas funcionalidades? Compártelas en los "Issues".
3.  **Enviar código**: Haz un fork del repositorio, crea una rama con tus cambios y envía un Pull Request.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno y eficiente:

- **Framework**: [Nuxt 4](https://nuxt.com) (Vue 3)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com)
- **Backend/BaaS**: [Firebase](https://firebase.google.com) (Auth, Firestore, Hosting)
- **Almacenamiento**: AWS S3 (para imágenes optimizadas)
- **Validación**: Zod / VeeValidate (si aplica)

## 🚀 Requisitos Previos

Para colaborar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18+ recomendada)
- [pnpm](https://pnpm.io/)

## ⚙️ Configuración del Entorno de Desarrollo

Para correr el proyecto localmente y probar tus cambios, necesitas configurar las variables de entorno.
Crea un archivo `.env` en la raíz del proyecto basándote en las variables requeridas en `nuxt.config.ts`.
_(Nota: Pide acceso a los mantenedores para obtener las credenciales de desarrollo si es necesario, o usa tu propio proyecto de Firebase/AWS para pruebas)_

```bash
# AWS S3 Configuration
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key
AWS_S3_BUCKET_NAME=tu_bucket_name
AWS_S3_BUCKET_DOMAIN=tu_bucket_domain

# Firebase Configuration
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_APP_ID=tu_app_id
FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_MEASUREMENT_ID=tu_measurement_id
FIREBASE_DATABASE_URL=tu_database_url

# General
BASE_URL=http://localhost:3000
RECAPTCHA_SITE_KEY=tu_recaptcha_key
ADMIN_EMAILS=admin@example.com
```

## 🏃‍♂️ Ejecutar Localmente

1.  **Instalar dependencias**:

    ```bash
    pnpm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    pnpm run dev
    ```
    Visita `http://localhost:3000` en tu navegador.

## 🧪 Testing

Asegúrate de que tus cambios no rompan nada ejecutando las pruebas:

```bash
pnpm run test
```

## 📦 Construcción (Build)

Si necesitas verificar la construcción final:

```bash
pnpm run build
pnpm run preview
```

# 🐾 Adopta Zulia

Bienvenido al repositorio de **Adopta Zulia**, una plataforma para facilitar la adopción de mascotas en la región del Zulia.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno y eficiente:

- **Framework**: [Nuxt 4](https://nuxt.com) (Vue 3)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com)
- **Backend/BaaS**: [Firebase](https://firebase.google.com) (Auth, Firestore, Hosting)
- **Almacenamiento**: AWS S3 (para imágenes optimizadas)
- **Validación**: Zod / VeeValidate (si aplica)

## 🚀 Requisitos Previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18+ recomendada)
- [NPM](https://www.npmjs.com/)

## ⚙️ Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en las variables requeridas en `nuxt.config.ts`:

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
    npm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Visita `http://localhost:3000` en tu navegador.

## 🧪 Testing

Este proyecto utiliza **Vitest** para pruebas unitarias.

```bash
npm run test
```

## 📦 Construcción y Despliegue

El proyecto está configurado para desplegarse con **SSR (Server Side Rendering)** habilitado.

```bash
npm run build
```

Para previsualizar la build localmente:

```bash
npm run preview
```

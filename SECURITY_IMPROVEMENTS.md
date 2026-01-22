# 🔒 Mejoras de Seguridad - AdoptaZulia

## Resumen de Cambios

Se han implementado múltiples mejoras de seguridad en la aplicación para proteger información sensible y evitar exposición de datos en producción.

### 1. **Logging Seguro (Debug Mode)**

#### Archivos Creados:
- `utils/debug.ts` - Configuración de logging seguro
- `utils/debugMode.ts` - Control de modo debug
- `composables/useSecureLogger.ts` - Composable para logging seguro

#### Funcionalidad:
- Los mensajes de `console.log/error/warn/debug` solo se envían a la consola en:
  - **Desarrollo**: Siempre se registran
  - **Producción**: Solo si se habilita manualmente el DEBUG flag
- Sanitización automática de datos sensibles (passwords, tokens, emails, etc.)

#### Cómo Usar en Consola:
```javascript
// Habilitar debug mode en navegador
localStorage.setItem('ADOPTA_DEBUG', 'true')
location.reload()

// Deshabilitar
localStorage.removeItem('ADOPTA_DEBUG')
location.reload()
```

#### Uso en Código:
```typescript
import { useSecureLogger } from '~/composables/useSecureLogger'

export function miComposable() {
  const { error, warn, debug, log } = useSecureLogger()
  
  try {
    // Tu código
  } catch (err) {
    // En producción solo se registra si DEBUG está habilitado
    error('Mensaje de error:', err)
  }
}
```

### 2. **Headers de Seguridad**

Se agregaron los siguientes headers HTTP en `nuxt.config.ts`:

```
X-Content-Type-Options: nosniff
  → Previene MIME type sniffing

X-Frame-Options: SAMEORIGIN
  → Previene clickjacking

X-XSS-Protection: 1; mode=block
  → Protección contra XSS

Referrer-Policy: strict-origin-when-cross-origin
  → Controla información de referrer

Permissions-Policy
  → Deshabilita: geolocalización, micrófono, cámara
```

### 3. **Content Security Policy (CSP)**

- **Desarrollo**: Permisivo (para facilitar debugging)
- **Producción**: Restrictivo con:
  - Default: 'self' (solo mismo origen)
  - Scripts: Solo de fuentes confiables
  - Estilos: Self + unsafe-inline + Google Fonts
  - Imágenes: Self + data + HTTPS + blobs
  - Conexiones: Self + Firebase + Google Analytics
  - Frames: PayPal (para pagos)

### 4. **Composables Actualizados**

Se reemplazó `console.*` con `useSecureLogger` en:
- ✅ `composables/useAuth.ts`
- ✅ `composables/useUsers.ts`
- ✅ `composables/useNotifications.ts`
- ✅ `composables/usePets.ts`
- ✅ `middleware/admin.ts`

### 5. **Middleware de Seguridad**

- `middleware/admin.ts` - Verificación de permisos de administrador
- Mensajes de acceso denegado solo en modo debug

---

## Mejores Prácticas Implementadas

### ✅ Nunca Registres:
```typescript
// ❌ MAL - Expone información sensible
console.error('Usuario:', user) // Contiene token, email, etc.
console.log('Password:', password)

// ✅ BIEN - Usa sanitización
const { error, sanitize } = useSecureLogger()
error('Error de usuario:', sanitize(user))
error('Error:', sanitize({ password }))
```

### ✅ Manejo Seguro de Errores:
```typescript
try {
  // código
} catch (err) {
  // Registra en producción solo si necesario
  logError('Mensaje descriptivo:', err)
  
  // Muestra mensaje amigable al usuario
  error.value = 'Ocurrió un error. Intenta de nuevo.'
}
```

### ✅ Verificación de Permisos:
```typescript
if (!isAdmin.value) {
  warn('Acceso denegado: sin permisos de administrador')
  return navigateTo('/')
}
```

---

## Testing de Seguridad

### Verificar Headers en Navegador:
```javascript
// Abre DevTools → Network → selecciona una respuesta → Headers
// Verifica que los headers de seguridad estén presentes
```

### Verificar CSP:
```javascript
// En consola, carga la página y verifica que no haya warnings de CSP
// Abre DevTools → Console
```

### Verificar Logging:
```javascript
// Desarrollo - los logs aparecen siempre
// Producción:
localStorage.setItem('ADOPTA_DEBUG', 'true')
// Ahora los logs deben aparecer
localStorage.removeItem('ADOPTA_DEBUG')
// Los logs no deben aparecer
```

---

## Configuración en `.env`

Asegúrate de que en producción NO tengas acceso públicamente a:
- `AWS_SECRET_ACCESS_KEY`
- `FIREBASE_API_KEY` (público pero sin datos sensibles)
- `RECAPTCHA_SITE_KEY` (público)

---

## Compatibilidad

- ✅ Nuxt 4+
- ✅ Vue 3+
- ✅ Firefox, Chrome, Safari, Edge
- ✅ Funcionamiento offline del logging

---

## Próximos Pasos Recomendados

1. **Rate Limiting**: Implementar límite de intentos en login
2. **CORS**: Configurar CORS restrictivo en el servidor
3. **Validación**: Validar entrada en cliente y servidor
4. **Auditoría**: Registrar acciones críticas en logs de servidor
5. **Secrets**: Usar variables de entorno para secretos

---

## Referencias

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)

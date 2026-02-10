export const getBaseEmailHtml = (
  title: string,
  content: string,
  cta?: { text: string; url: string }
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #10b981; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
    .content h2 { color: #065f46; font-size: 20px; margin-top: 0; margin-bottom: 16px; }
    .content p { margin-bottom: 16px; }
    .btn-container { text-align: center; margin-top: 24px; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
    .btn:hover { background-color: #059669; }
    .footer { background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <img src="https://i.imgur.com/n56taaM.png" alt="Adopta Zulia Logo" width="150" style="display: block; margin: 0 auto; max-width: 150px; height: auto;">
      </div>
      <div class="content">
        ${content}
        ${
          cta
            ? `
        <div class="btn-container">
          <a href="${cta.url}" class="btn">${cta.text}</a>
        </div>
        `
            : ''
        }
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Adopta Zulia. Todos los derechos reservados.</p>
        <p>¿Tienes dudas? Contáctanos en <a href="mailto:soporte@adoptazulia.com">soporte@adoptazulia.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export const getAdoptionUpdateEmail = (
  petName: string,
  status: string,
  notes: string | undefined,
  actionUrl: string
) => {
  const statusLabels: Record<string, string> = {
    approved: '¡Aprobada!',
    rejected: 'Actualizada',
    completed: 'Completada',
    pending: 'Pendiente',
  }

  const statusColors: Record<string, string> = {
    approved: '#10b981', // Emerald
    rejected: '#ef4444', // Red
    completed: '#3b82f6', // Blue
    pending: '#f59e0b', // Amber
  }

  const title = `Actualización de Solicitud: ${statusLabels[status] || 'Estado Actualizado'}`

  const content = `
    <h2>Hola,</h2>
    <p>El estado de tu solicitud de adopción para <strong>${petName}</strong> ha cambiado.</p>
    
    <div style="background-color: #f3f4f6; border-left: 4px solid ${statusColors[status] || '#9ca3af'}; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #1f2937;">Nuevo Estado: <span style="color: ${statusColors[status] || '#374151'}">${status.toUpperCase()}</span></p>
      ${notes ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #4b5563;">Nota: ${notes}</p>` : ''}
    </div>

    <p>Puedes ver los detalles completos de tu solicitud y los siguientes pasos en nuestra plataforma.</p>
  `

  return getBaseEmailHtml('Actualización de Adopción - Adopta Zulia', content, {
    text: 'Ver Mi Solicitud',
    url: actionUrl,
  })
}

export const getNewRequestEmail = (petName: string, message: string, actionUrl: string) => {
  const content = `
    <h2>¡Buenas noticias!</h2>
    <p>Has recibido una nueva solicitud de adopción para <strong>${petName}</strong>.</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #166534; text-transform: uppercase;">Mensaje del Solicitante</p>
      <p style="margin: 0; font-style: italic; color: #15803d;">"${message}"</p>
    </div>

    <p>Por favor, revisa la solicitud lo antes posible para dar una respuesta al interesado.</p>
  `

  return getBaseEmailHtml('Nueva Solicitud de Adopción - Adopta Zulia', content, {
    text: 'Gestionar Solicitudes',
    url: actionUrl,
  })
}

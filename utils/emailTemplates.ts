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

export const getAdoptionReminderEmail = (petName: string, actionUrl: string) => {
  const content = `
    <h2>Recordatorio de Adopción</h2>
    <p>La solicitud de adopción para <strong>${petName}</strong> fue aprobada hace más de una semana, pero aún no ha sido confirmada como completada.</p>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #92400e;">Por favor confirma si la adopción ya se realizó.</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350f;">Si la mascota ya fue entregada, marca la adopción como completada. De lo contrario, ignora este mensaje o contacta al otro involucrado.</p>
    </div>

    <p>Puedes gestionar la solicitud directamente desde la plataforma.</p>
  `

  return getBaseEmailHtml('Recordatorio de Adopción - Adopta Zulia', content, {
    text: 'Gestionar Adopción',
    url: actionUrl,
  })
}

export const getLostPetReminderEmail = (petName: string, actionUrl: string) => {
  const content = `
    <h2>¿Ya encontraste a ${petName}?</h2>
    <p>Hace tiempo que reportaste a <strong>${petName}</strong> como perdido/a y aún no has actualizado el estado.</p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #991b1b;">Por favor actualiza el estado si ya fue encontrado/a.</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #7f1d1d;">Esto ayuda a mantener la plataforma actualizada y a otros usuarios informados.</p>
    </div>

    <p>Si aún no has tenido noticias, considera actualizar la información o compartir el reporte en redes sociales.</p>
  `

  return getBaseEmailHtml('Recordatorio: Mascota Perdida - Adopta Zulia', content, {
    text: 'Actualizar Reporte',
    url: actionUrl,
  })
}

export const getStuckPetReminderEmail = (petName: string, actionUrl: string) => {
  const content = `
    <h2>¿Necesitas ayuda con ${petName}?</h2>
    <p><strong>${petName}</strong> lleva varias semanas publicado/a para adopción sin recibir solicitudes.</p>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">Sugerencias para aumentar visibilidad:</p>
      <ul style="margin: 8px 0 0 0; font-size: 14px; color: #1e3a8a; padding-left: 20px;">
        <li>Sube fotos más recientes o de mejor calidad.</li>
        <li>Actualiza la descripción con más detalles.</li>
        <li>Comparte el perfil en redes sociales.</li>
      </ul>
    </div>

    <p>Puedes editar la publicación directamente desde la plataforma.</p>
  `

  return getBaseEmailHtml('Sugerencia: Publicación de Adopción - Adopta Zulia', content, {
    text: 'Editar Publicación',
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

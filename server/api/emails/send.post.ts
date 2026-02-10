import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { to, subject, html } = body

  if (!to || !subject || !html) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan campos requeridos (to, subject, html)',
    })
  }

  // Verificar si tenemos API Key
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY no está configurada')
    throw createError({
      statusCode: 500,
      statusMessage: 'Error de configuración del servidor de correo',
    })
  }

  try {
    const data = await resend.emails.send({
      from: 'Adopta Zulia <onboarding@resend.dev>', // Usar dominio de prueba o verificado
      to: [to],
      subject: subject,
      html: html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error enviando email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al enviar el correo electrónico',
      data: error,
    })
  }
})

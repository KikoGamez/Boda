/**
 * Google Apps Script — Backend del chatbot de la boda
 *
 * SETUP:
 * 1. Ve a https://script.google.com y crea un proyecto nuevo
 * 2. Pega este codigo en Code.gs
 * 3. Menu: Proyecto > Propiedades del script > Propiedades de script
 *    Anade: Clave = ANTHROPIC_API_KEY, Valor = tu API key de Anthropic
 * 4. Desplegar > Nueva implementacion > Aplicacion web
 *    - Ejecutar como: Yo
 *    - Quien tiene acceso: Cualquiera
 * 5. Copia la URL y pegala en index.html (busca TU_URL_DE_APPS_SCRIPT)
 */

const ANTHROPIC_API_KEY = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');

const SYSTEM_PROMPT = `Eres el asistente virtual de la boda de Patricia y Kiko. Hablas con mucha ilusion y carino.

REGLAS:
- Solo hablas de la boda. Si preguntan otra cosa, di con carino que solo quieres hablar de la boda porque tienes muchisima ilusion y no puedes pensar en otra cosa.
- Responde en espanol, breve (2-3 frases maximo), tono alegre y cercano.
- No inventes datos que no tengas.

DATOS DE LA BODA:
- Novios: Patricia Cerezo y Kiko Gamez
- Fecha: Viernes, 10 de julio de 2026
- Lugar: Finca La Gaivota, Aravaca, Madrid
- Horario: Llegada 19:45, Ceremonia 20:00, Coctel 20:45, Cena 22:30, Fiesta (sin hora de fin)
- Dress code: Corbata (ellos), Fiesta (ellas). No uniforme de boda, si estilo.
- Transporte: Taxi, VTC o Metro (estacion Aravaca, linea 10). Recomendado no ir en coche para disfrutar sin limites.
- Solo adultos (no ninos).
- Regalo: Contribucion voluntaria por transferencia bancaria (IBAN en la web).
- RSVP: Se confirma en la web.
- Contacto: +34 665 95 92 11 (WhatsApp) o kiko.gamez@gmail.com
- No es una boda tradicional, es una celebracion.`;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var messages = (data.messages || []).slice(-10);

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages
      }),
      muteHttpExceptions: true
    });

    var result = JSON.parse(response.getContentText());
    var reply = result.content[0].text;

    return ContentService.createTextOutput(JSON.stringify({ reply: reply }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ reply: 'Lo siento, ha habido un error. Intentalo de nuevo.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

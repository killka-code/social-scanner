# Social Scanner

Analiza cualquier cuenta publica de Instagram con IA. Ingresa un username, obtiene los datos via scraping y genera un reporte completo de estrategia de contenido usando Claude.

## Como funciona

1. Ingresa un `@username` de Instagram
2. Se obtienen los ultimos 30 posts via [Apify](https://apify.com/) (Instagram Profile Scraper)
3. Se calculan metricas: engagement rate, content mix, mejores horarios
4. Claude analiza los datos y genera un reporte con puntuacion, categorias, puntos fuertes/debiles y recomendaciones accionables

## Reporte generado

- **Score general** (1-100) con gauge visual
- **Engagement rate** calculado sobre los ultimos posts
- **Mix de contenido** — imagenes, videos y carruseles
- **Mejores horarios** para publicar
- **Top posts** con enlaces directos y razon de exito
- **Categorias de contenido** (educativo, promocional, personal, etc.) con veredicto: mantener, aumentar o reducir
- **Puntos fuertes y areas de mejora**
- **Recomendaciones priorizadas** (alta, media, baja)

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | [Astro](https://astro.build/) (SSR) |
| Frontend | React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Iconos | Lucide React |
| IA | Claude API (`@anthropic-ai/sdk`) |
| Scraping | Apify (Instagram Profile Scraper) |
| Deploy | Vercel (`@astrojs/vercel`) |

## Estructura del proyecto

```
src/
├── components/
│   ├── ScanForm.tsx        # Formulario principal + estados de carga
│   └── Report.tsx          # Visualizacion completa del reporte
├── lib/
│   ├── instagram.ts        # Fetch de datos via Apify API
│   └── analyzer.ts         # Calculo de metricas + analisis con Claude
├── pages/
│   ├── index.astro         # Landing page
│   └── api/
│       └── analyze.ts      # Endpoint POST /api/analyze
└── styles/
    └── global.css          # Tailwind import
```

## Setup

### Requisitos previos

- Node.js 18+
- Cuenta en [Apify](https://apify.com/) (plan gratuito funciona)
- API Key de [Anthropic](https://console.anthropic.com/)

### Instalacion

```bash
git clone https://github.com/killka-code/social-scanner.git
cd social-scanner
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raiz:

```env
APIFY_TOKEN=tu_token_de_apify
ANTHROPIC_API_KEY=tu_api_key_de_anthropic
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321)

### Build y preview

```bash
npm run build
npm run preview
```

## API

### `POST /api/analyze`

**Body:**

```json
{
  "username": "nombre_de_usuario"
}
```

**Response (200):**

```json
{
  "report": {
    "overallScore": 72,
    "engagementRate": 3.45,
    "summary": "...",
    "topPosts": [...],
    "contentCategories": [...],
    "recommendations": [...],
    "bestPostingTimes": ["7:00 PM", "12:00 PM", "9:00 AM"],
    "contentMix": { "images": 12, "videos": 8, "carousels": 10 },
    "strongPoints": [...],
    "weakPoints": [...]
  },
  "profile": {
    "username": "nombre_de_usuario",
    "profilePicUrl": "https://..."
  }
}
```

**Errores:** `400` (username vacio), `422` (cuenta privada, sin posts, perfil no encontrado), `500` (config faltante o error interno)

## Deploy

Configurado para Vercel con `@astrojs/vercel` (SSR). Agrega las variables de entorno en el dashboard de Vercel.

## Limitaciones

- Solo cuentas publicas
- Analiza los ultimos ~30 posts disponibles
- El scraping depende de la disponibilidad de Apify
- Cada analisis consume tokens de la API de Anthropic

## Licencia

MIT

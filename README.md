# 🚀 FinanzasPro — Guía de Despliegue

## Requisitos previos
- Node.js 18+ instalado → https://nodejs.org
- Cuenta gratuita en GitHub → https://github.com
- Cuenta gratuita en Vercel → https://vercel.com

---

## PASO 1 — Instalar dependencias localmente

Abre tu terminal, entra a la carpeta del proyecto y ejecuta:

```bash
cd finanzaspro
npm install
```

Para probarla en tu computadora antes de subir:
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador.

---

## PASO 2 — Subir el proyecto a GitHub

1. Ve a https://github.com/new y crea un repositorio llamado `finanzaspro` (privado o público, tú eliges).
2. En tu terminal, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "FinanzasPro inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/finanzaspro.git
git push -u origin main
```

(Sustituye TU_USUARIO por tu nombre de usuario de GitHub)

---

## PASO 3 — Desplegar en Vercel

1. Ve a https://vercel.com y haz clic en **"Add New Project"**
2. Haz clic en **"Import Git Repository"** y selecciona tu repo `finanzaspro`
3. Vercel detectará automáticamente que es un proyecto Vite. Deja todo como está.
4. Haz clic en **"Deploy"** — tarda menos de 2 minutos.
5. Vercel te dará una URL tipo: `https://finanzaspro-tuusuario.vercel.app`

---

## PASO 4 — Instalarla en tu teléfono como app (PWA)

### iPhone (Safari)
1. Abre la URL de tu app en **Safari**
2. Toca el botón de compartir (□↑)
3. Toca **"Agregar a pantalla de inicio"**
4. Ponle el nombre que quieras → **Agregar**
5. ¡Listo! Aparece en tu pantalla de inicio como una app real

### Android (Chrome)
1. Abre la URL en **Chrome**
2. Toca el menú (⋮) arriba a la derecha
3. Toca **"Instalar app"** o **"Agregar a pantalla de inicio"**
4. Confirma → **Instalar**

---

## PASO 5 — Dominio personalizado (opcional)

Si quieres una URL como `finanzas.tudominio.com`:
1. En Vercel → tu proyecto → **Settings → Domains**
2. Escribe tu dominio y sigue las instrucciones para apuntar el DNS

---

## Actualizaciones futuras

Cada vez que hagas cambios y los subas a GitHub, Vercel redesplegará automáticamente:

```bash
git add .
git commit -m "Mi actualización"
git push
```

---

## Estructura del proyecto

```
finanzaspro/
├── public/
│   ├── icon.svg          ← Ícono de la app
│   └── icon-192.png      ← (genera con el SVG, ver abajo)
├── src/
│   ├── main.jsx          ← Entrada React
│   └── App.jsx           ← App principal
├── index.html
├── vite.config.js        ← Configuración Vite + PWA
└── package.json
```

## Generar íconos PNG (necesario para PWA)

Instala sharp-cli una sola vez:
```bash
npm install -g sharp-cli
```

Luego genera los íconos desde el SVG:
```bash
sharp -i public/icon.svg -o public/icon-192.png resize 192
sharp -i public/icon.svg -o public/icon-512.png resize 512
sharp -i public/icon.svg -o public/apple-touch-icon.png resize 180
```

---

## Notas técnicas

- **Crypto en tiempo real**: conectado a CoinGecko API (gratis, sin API key)
- **Acciones**: simuladas con variación realista. Para precios reales necesitas una API key de Yahoo Finance o Alpha Vantage
- **Datos**: se guardan en memoria (se reinician al recargar). Para persistencia, conecta Firebase o Supabase (gratis)

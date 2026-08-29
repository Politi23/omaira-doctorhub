# Template de gestión de citas — PolitiWeb Studio

Base parametrizada de la app de gestión (citas, clientes/pacientes, ingresos, egresos,
estadísticas, asistente IA, tasa BCV) para implementarla a nuevos clientes.
**Toda la personalización de código vive en un solo archivo: `src/config/negocio.js`.**

## Checklist de implementación por cliente

### 1. Clonar y preparar el proyecto
```bash
git clone <este-template> cliente-nombre
cd cliente-nombre
npm install
```
Borra la carpeta `.git` y haz `git init` si quieres historial limpio por cliente.

### 2. Crear proyecto Supabase (uno por cliente)
1. Nuevo proyecto en [supabase.com](https://supabase.com) (free tier alcanza).
2. Ejecutar en SQL Editor el esquema: tablas `pacientes`, `ingresos` (con `tasa_bcv NUMERIC`),
   `citas`, `egresos`. `pacientes` con `ON DELETE CASCADE` hacia ingresos y citas.
   Activar RLS en todas las tablas (política: solo usuarios autenticados).
3. Authentication → crear el usuario del cliente (email + contraseña).
4. Copiar URL y anon key del proyecto.

### 3. Configurar `.env`
```bash
cp .env.example .env
```
Rellenar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### 4. Personalizar `src/config/negocio.js`
- **Identidad:** `nombreApp`, `descripcionApp`, `nombreCorto`, `nombreCompleto`, `saludo`.
- **Terminología:** al final del archivo, `persona` (`'paciente'` | `'cliente'`) y `genero` (`'f'` | `'m'`).
- **Lugar:** `lugar`/`Lugar`/`emojiLugar` (consultorio 🏥, barbería 💈, spa 💅...).
- **Catálogos:** `motivosCita`, `motivosRapidos`, `motivoDefault`, `conceptosIngreso`,
  `categoriasEgreso` — pedir al cliente su lista de servicios/precios en la reunión de arranque.
- **Mensajes:** `msgSeguimiento` (WhatsApp de reactivación) y `sugerenciasIA`.

### 5. Íconos y favicon
Reemplazar en `public/`: `icon-192.png`, `icon-512.png`, `favicon.svg` con el logo del cliente
(mismos nombres y tamaños).

### 6. Probar en local
```bash
npm run dev
```
Verificar: login, registrar persona, agendar cita, registrar ingreso/egreso, exportar PDF,
asistente IA (requiere `GROQ_API_KEY` en el entorno) y tasa BCV.

### 7. Deploy en Vercel
1. Subir el repo a GitHub (repo privado por cliente).
2. Importar en Vercel. Variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY` (asistente IA)
   - `ALLOWED_ORIGIN` = dominio de producción (ej: `https://app.cliente.com`) — CORS de `/api`
3. Conectar el dominio del cliente (o subdominio tuyo tipo `cliente.politiwebstudio.com`).

### 8. Entrega
- Instalar la PWA en el teléfono del cliente (Safari/Chrome → "Agregar a inicio").
- Sesión de capacitación de 30 min.
- Dejar registrados 2–3 clientes/citas de ejemplo y luego borrarlos juntos (sirve de práctica).

## Qué NO tocar
- El diseño (Liquid Glass) es el mismo para todos — es la identidad del producto.
- El modelo de datos usa `pacientes` como nombre de tabla aunque el negocio hable de
  "clientes": la terminología visible sale de `TERM`, la base de datos no se renombra.
- Convenciones Venezuela: fechas `America/Caracas` (`src/lib/fecha.js`), teléfonos
  `0414-1234567`, cédula `V-`, doble moneda USD/Bs con `tasa_bcv` histórica.

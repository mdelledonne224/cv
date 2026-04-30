# Marcelo Delledonne — Portfolio

Sitio personal interactivo con estética de terminal Ubuntu. Static site servido con nginx.

**Producción:** https://marcelodelledonne.dev

---

## Arquitectura

Sitio 100% estático. Sin build step, sin backend.

- **HTML/CSS/JS vanilla** — el JS construye una terminal interactiva con comandos (`help`, `whoami`, `about`, `experience`, `skills`, `projects`, `education`, `contact`, `cv`, `ls`, `cat`, `neofetch`, `play guitar`, `lang en|es`, `clear`).
- **Bilingüe** (ES/EN) — comando `lang en|es`, persiste en `localStorage`.
- **Auto-typing** al cargar: tipea `neofetch` solo.
- **`neofetch`** muestra una foto con filtro grayscale + sepia + scanlines (estilo CRT) al lado de un bloque tipo neofetch con el stack y datos.
- **Comando `cv`** descarga `cv.pdf`.

## Estructura del repo

```
.
├── index.html           # Estructura del terminal + cursor
├── css/
│   └── style.css        # Estilos del terminal, prompt, output, foto, scanlines
├── js/
│   └── terminal.js      # Lógica: input, comandos, i18n, historial, autocompletado
├── assets/
│   └── me.jpg           # Foto perfil (600x586, optimizada, ~66 KB)
├── cv.pdf               # CV descargable
├── Dockerfile           # nginx:alpine para dev local
├── docker-compose.yml   # Volumen mount para iterar sin rebuild
├── .dockerignore
├── .gitignore
└── README.md
```

Archivos excluidos del repo (vía `.gitignore`): `me.PNG` (original 5 MB), `Profile.pdf` (fuente del CV), `.DS_Store`.

---

## Desarrollo local

Requiere Docker.

```bash
docker compose up -d --build
```

Abrir http://localhost:8080.

Los volúmenes montan `index.html`, `css/`, `js/`, `assets/` y `cv.pdf` en read-only, así editás y refrescás el navegador (hard refresh con `Cmd+Shift+R` para evitar caché del browser).

Para bajar:

```bash
docker compose down
```

---

## Producción

### Servidor

DigitalOcean droplet, Ubuntu 24.04, IP `143.198.101.233`. Comparte host con FlowSignals (`/opt/flowsignals-{beta,prod}`).

- **nginx** corre en el host (no en Docker).
- **TLS** via Let's Encrypt + Certbot (auto-renovación por systemd timer).
- **Doc root:** `/opt/marcelodelledonne` (clon directo de este repo).
- **DNS:** Cloudflare, registros A para `marcelodelledonne.dev` y `www`, **proxy OFF (DNS only)** — necesario para que Certbot HTTP-01 challenge funcione.

### nginx config

`/etc/nginx/sites-available/marcelodelledonne` con tres `server` blocks:

1. **HTTP (80)** apex + www → 301 a HTTPS apex
2. **HTTPS (443)** www → 301 a HTTPS apex
3. **HTTPS (443)** apex → sirve el sitio

Caching: `Cache-Control: public, no-transform; max-age=604800` para `.css/.js/.jpg/.png/.gif/.ico/.svg/.webp/.woff2/.pdf`.

### Deploy SSH key

El droplet tiene un par de claves dedicado para este repo en `/root/.ssh/id_ed25519_cv` con un alias en `/root/.ssh/config` (`Host github-cv`). La pubkey está agregada como **Deploy Key** del repo en GitHub (read-only).

Esto evita conflicto con la deploy key del repo de FlowSignals (GitHub no permite la misma key en dos repos).

---

## Actualización (deploy)

Después de pushear a `main`:

```bash
ssh root@143.198.101.233 'cd /opt/marcelodelledonne && git pull'
```

No hace falta reload de nginx para cambios en archivos estáticos. Si modificás el server block de nginx:

```bash
ssh root@143.198.101.233 'nginx -t && systemctl reload nginx'
```

---

## Cert SSL — renovación

Certbot configuró un timer automático. Para chequear:

```bash
ssh root@143.198.101.233 'systemctl list-timers | grep certbot'
ssh root@143.198.101.233 'certbot certificates'
```

**Renovación manual** (si hace falta):

```bash
ssh root@143.198.101.233 'certbot renew --dry-run'   # simulación
ssh root@143.198.101.233 'certbot renew'             # renovación real
```

El cert actual expira **2026-07-29**. Let's Encrypt renueva automáticamente cuando faltan ~30 días.

---

## DNS

En Cloudflare:

| Tipo | Nombre | Destino | Proxy |
|------|--------|---------|-------|
| A    | `marcelodelledonne.dev` (`@`) | `143.198.101.233` | DNS only (gris) |
| A    | `www`  | `143.198.101.233` | DNS only (gris) |

**No prender el proxy naranja** mientras Certbot use HTTP-01 challenge. Se puede activar después si querés CDN/cache de Cloudflare, pero hay que revisar la config de SSL para evitar loops (modo "Full strict").

---

## Comandos del terminal interactivo

```
help          lista de comandos
whoami        nombre + headline
about         bio corta
experience    historial laboral
skills        stack agrupado por categoría
projects      proyectos recientes (con links)
education     formación
contact       email + LinkedIn + teléfono
cv            descarga CV en PDF
ls            lista archivos virtuales
cat <file>    leer archivo (about.md, projects.md, ...)
neofetch      foto + info del sistema
play guitar   easter egg 🎸
lang en|es    cambiar idioma
clear         limpiar pantalla (también Ctrl+L)
sudo          easter egg
```

Historial con ↑/↓, autocompletado con Tab.

---

## Notas

- Las cosas privadas (Profile.pdf, me.PNG original) no van al repo.
- El droplet usa la misma key SSH personal del owner para entrar como root (clave en `/root/.ssh/authorized_keys`).
- El warning de nginx sobre "protocol options redefined" en `:443` es cosmético — aparece porque dos `server` blocks comparten address:port con SSL options. No afecta el funcionamiento.

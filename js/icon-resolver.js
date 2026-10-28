// js/icon-resolver.js
// Motor de resolução inteligente de ícones (DashboardIcons, SimpleIcons, TechIcons e Favicon)
// com inferência automática de slug, cascata de fallback e catálogo visual de busca.

const DASHBOARD_ICONS_CDN =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg';
const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org';
const TECH_ICONS_CDN =
  'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

// Mapa de domínios/palavras-chave para slugs exatos do DashboardIcons
export const DOMAIN_TO_SLUG_MAP = {
  'mail.google.com': 'gmail',
  'drive.google.com': 'google-drive',
  'calendar.google.com': 'google-calendar',
  'docs.google.com': 'google-docs',
  'sheets.google.com': 'google-sheets',
  'slides.google.com': 'google-slides',
  'photos.google.com': 'google-photos',
  'meet.google.com': 'google-meet',
  'keep.google.com': 'google-keep',
  'maps.google.com': 'google-maps',
  'translate.google.com': 'google-translate',
  'gemini.google.com': 'google-gemini',
  'aistudio.google.com': 'google-gemini',
  'notebooklm.google.com': 'google',
  'console.cloud.google.com': 'google-cloud',
  'firebase.google.com': 'firebase',
  'youtube.com': 'youtube',
  'music.youtube.com': 'youtube-music',
  'studio.youtube.com': 'youtube',
  'github.com': 'github',
  'gist.github.com': 'github',
  'gitlab.com': 'gitlab',
  'bitbucket.org': 'bitbucket',
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  'platform.openai.com': 'openai',
  'claude.ai': 'claude-ai',
  'anthropic.com': 'anthropic',
  'perplexity.ai': 'perplexity',
  'deepseek.com': 'deepseek',
  'huggingface.co': 'hugging-face',
  'ollama.com': 'ollama',
  'openwebui.com': 'open-webui',
  'whatsapp.com': 'whatsapp',
  'web.whatsapp.com': 'whatsapp',
  'telegram.org': 'telegram',
  'web.telegram.org': 'telegram',
  'discord.com': 'discord',
  'slack.com': 'slack',
  'teams.microsoft.com': 'microsoft-teams',
  'outlook.live.com': 'microsoft-outlook',
  'outlook.office.com': 'microsoft-outlook',
  'office.com': 'microsoft-office',
  'onedrive.live.com': 'microsoft-onedrive',
  'azure.microsoft.com': 'microsoft-azure',
  'portal.azure.com': 'microsoft-azure',
  'aws.amazon.com': 'amazon-web-services',
  'console.aws.amazon.com': 'amazon-web-services',
  'amazon.com': 'amazon',
  'amazon.com.br': 'amazon',
  'mercadolivre.com.br': 'mercado-libre',
  'shopee.com.br': 'shopee',
  'aliexpress.com': 'aliexpress',
  'netflix.com': 'netflix',
  'primevideo.com': 'prime-video',
  'disneyplus.com': 'disney-plus',
  'max.com': 'max',
  'crunchyroll.com': 'crunchyroll',
  'twitch.tv': 'twitch',
  'spotify.com': 'spotify',
  'open.spotify.com': 'spotify',
  'soundcloud.com': 'soundcloud',
  'reddit.com': 'reddit',
  'twitter.com': 'x',
  'x.com': 'x',
  'instagram.com': 'instagram',
  'facebook.com': 'facebook',
  'linkedin.com': 'linkedin',
  'tiktok.com': 'tiktok',
  'pinterest.com': 'pinterest',
  'bluesky.app': 'bluesky',
  'bsky.app': 'bluesky',
  'threads.net': 'threads',
  'notion.so': 'notion',
  'obsidian.md': 'obsidian',
  'trello.com': 'trello',
  'asana.com': 'asana',
  'linear.app': 'linear',
  'clickup.com': 'clickup',
  'monday.com': 'monday',
  'airtable.com': 'airtable',
  'todoist.com': 'todoist',
  'ticktick.com': 'ticktick',
  'toggl.com': 'toggl',
  'track.toggl.com': 'toggl',
  'figma.com': 'figma',
  'canva.com': 'canva',
  'excalidraw.com': 'excalidraw',
  'miro.com': 'miro',
  'vercel.com': 'vercel',
  'netlify.com': 'netlify',
  'cloudflare.com': 'cloudflare',
  'dash.cloudflare.com': 'cloudflare',
  'supabase.com': 'supabase',
  'railway.app': 'railway',
  'render.com': 'render',
  'fly.io': 'fly-io',
  'digitalocean.com': 'digitalocean',
  'hetzner.com': 'hetzner',
  'linode.com': 'linode',
  'vultr.com': 'vultr',
  'tailscale.com': 'tailscale',
  'zerotier.com': 'zerotier',
  'docker.com': 'docker',
  'hub.docker.com': 'docker',
  'stackoverflow.com': 'stack-overflow',
  'medium.com': 'medium',
  'dev.to': 'dev-to',
  'news.ycombinator.com': 'hacker-news',
  'producthunt.com': 'product-hunt',
  'dribbble.com': 'dribbble',
  'behance.net': 'behance',
  'steampowered.com': 'steam',
  'store.steampowered.com': 'steam',
  'epicgames.com': 'epic-games',
  'Duolingo.com': 'duolingo',
  'duolingo.com': 'duolingo',
  'coursera.org': 'coursera',
  'udemy.com': 'udemy',
  'alura.com.br': 'alura',
  'rocketseat.com.br': 'rocketseat',
  'wikipedia.org': 'wikipedia',
  'archive.org': 'internet-archive',
  '1password.com': '1password',
  'bitwarden.com': 'bitwarden',
  'vault.bitwarden.com': 'bitwarden',
  'proton.me': 'proton',
  'mail.proton.me': 'proton-mail',
  'drive.proton.me': 'proton-drive',
  'icloud.com': 'icloud',
  'dropbox.com': 'dropbox',
  'mega.nz': 'mega',
};

// Mapa de palavras no título para slugs do DashboardIcons (ótimo para apps self-hosted ou IPs locais)
export const NAME_TO_SLUG_MAP = {
  gmail: 'gmail',
  'google drive': 'google-drive',
  drive: 'google-drive',
  'google calendar': 'google-calendar',
  agenda: 'google-calendar',
  calendar: 'google-calendar',
  'google docs': 'google-docs',
  'google sheets': 'google-sheets',
  'google photos': 'google-photos',
  'google meet': 'google-meet',
  'google maps': 'google-maps',
  maps: 'google-maps',
  tradutor: 'google-translate',
  translate: 'google-translate',
  gemini: 'google-gemini',
  youtube: 'youtube',
  'youtube music': 'youtube-music',
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  chatgpt: 'chatgpt',
  openai: 'openai',
  claude: 'claude-ai',
  perplexity: 'perplexity',
  deepseek: 'deepseek',
  ollama: 'ollama',
  'open webui': 'open-webui',
  openwebui: 'open-webui',
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  discord: 'discord',
  slack: 'slack',
  teams: 'microsoft-teams',
  outlook: 'microsoft-outlook',
  onedrive: 'microsoft-onedrive',
  azure: 'microsoft-azure',
  aws: 'amazon-web-services',
  amazon: 'amazon',
  netflix: 'netflix',
  'prime video': 'prime-video',
  'disney+': 'disney-plus',
  'disney plus': 'disney-plus',
  spotify: 'spotify',
  twitch: 'twitch',
  reddit: 'reddit',
  twitter: 'x',
  instagram: 'instagram',
  facebook: 'facebook',
  linkedin: 'linkedin',
  tiktok: 'tiktok',
  pinterest: 'pinterest',
  notion: 'notion',
  obsidian: 'obsidian',
  trello: 'trello',
  asana: 'asana',
  linear: 'linear',
  clickup: 'clickup',
  todoist: 'todoist',
  toggl: 'toggl',
  figma: 'figma',
  canva: 'canva',
  excalidraw: 'excalidraw',
  vercel: 'vercel',
  netlify: 'netlify',
  cloudflare: 'cloudflare',
  supabase: 'supabase',
  docker: 'docker',
  portainer: 'portainer',
  proxmox: 'proxmox',
  plex: 'plex',
  jellyfin: 'jellyfin',
  emby: 'emby',
  sonarr: 'sonarr',
  radarr: 'radarr',
  lidarr: 'lidarr',
  bazarr: 'bazarr',
  prowlarr: 'prowlarr',
  overseerr: 'overseerr',
  jellyseerr: 'jellyseerr',
  tautulli: 'tautulli',
  qbittorrent: 'qbittorrent',
  transmission: 'transmission',
  deluge: 'deluge',
  sabnzbd: 'sabnzbd',
  nzbget: 'nzbget',
  'home assistant': 'home-assistant',
  homeassistant: 'home-assistant',
  hass: 'home-assistant',
  'node-red': 'node-red',
  nodered: 'node-red',
  grafana: 'grafana',
  prometheus: 'prometheus',
  influxdb: 'influxdb',
  'uptime kuma': 'uptime-kuma',
  uptimekuma: 'uptime-kuma',
  pihole: 'pi-hole',
  'pi-hole': 'pi-hole',
  adguard: 'adguard-home',
  'adguard home': 'adguard-home',
  nginx: 'nginx',
  'nginx proxy manager': 'nginx-proxy-manager',
  traefik: 'traefik',
  caddy: 'caddy',
  wireguard: 'wireguard',
  tailscale: 'tailscale',
  zerotier: 'zerotier',
  nextcloud: 'nextcloud',
  owncloud: 'owncloud',
  synology: 'synology',
  truenas: 'truenas',
  unraid: 'unraid',
  openmediavault: 'openmediavault',
  immich: 'immich',
  photoprism: 'photoprism',
  paperless: 'paperless-ngx',
  'paperless-ngx': 'paperless-ngx',
  vaultwarden: 'vaultwarden',
  bitwarden: 'bitwarden',
  '1password': '1password',
  gitea: 'gitea',
  forgejo: 'forgejo',
  jenkins: 'jenkins',
  argocd: 'argo-cd',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  rancher: 'rancher',
  harbor: 'harbor',
  keycloak: 'keycloak',
  authentik: 'authentik',
  authelia: 'authelia',
  pocketbase: 'pocketbase',
  n8n: 'n8n',
  appwrite: 'appwrite',
  directus: 'directus',
  strapi: 'strapi',
  ghost: 'ghost',
  wordpress: 'wordpress',
  bookstack: 'bookstack',
  outline: 'outline',
  wikijs: 'wiki-js',
  'wiki.js': 'wiki-js',
  mealie: 'mealie',
  tandoor: 'tandoor-recipes',
  actual: 'actual-budget',
  firefly: 'firefly-iii',
  'firefly iii': 'firefly-iii',
  freshrss: 'freshrss',
  miniflux: 'miniflux',
  tinyrss: 'tiny-tiny-rss',
  calibre: 'calibre-web',
  audiobookshelf: 'audiobookshelf',
  navidrome: 'navidrome',
  kavita: 'kavita',
  komga: 'komga',
  stirling: 'stirling-pdf',
  'stirling pdf': 'stirling-pdf',
  ittools: 'it-tools',
  'it-tools': 'it-tools',
  cyberchef: 'cyberchef',
  excalidraw: 'excalidraw',
  syncthing: 'syncthing',
  duplicati: 'duplicati',
  restic: 'restic',
  borg: 'borg',
  kopia: 'kopia',
  glances: 'glances',
  netdata: 'netdata',
  beszel: 'beszel',
  dozzle: 'dozzle',
  watchtower: 'watchtower',
  homarr: 'homarr',
  homepage: 'homepage',
  dashy: 'dashy',
  heimdall: 'heimdall',
  flame: 'flame',
  cockpit: 'cockpit',
  webmin: 'webmin',
  pfSense: 'pfsense',
  pfsense: 'pfsense',
  opnsense: 'opnsense',
  openwrt: 'openwrt',
  unifi: 'ubiquiti-unifi',
  ubiquiti: 'ubiquiti',
  mikrotik: 'mikrotik',
  frigate: 'frigate',
  scrypted: 'scrypted',
  zigbee2mqtt: 'zigbee2mqtt',
  esphome: 'esphome',
  mosquitto: 'mosquitto',
  steam: 'steam',
};

// Catálogo curado de ícones populares para exibição instantânea no modal (offline-ready)
export const POPULAR_DASHBOARD_ICONS = [
  'github',
  'gitlab',
  'bitbucket',
  'docker',
  'kubernetes',
  'proxmox',
  'portainer',
  'home-assistant',
  'plex',
  'jellyfin',
  'sonarr',
  'radarr',
  'qbittorrent',
  'transmission',
  'grafana',
  'prometheus',
  'uptime-kuma',
  'pi-hole',
  'adguard-home',
  'nginx-proxy-manager',
  'traefik',
  'caddy',
  'cloudflare',
  'tailscale',
  'wireguard',
  'nextcloud',
  'immich',
  'paperless-ngx',
  'vaultwarden',
  'bitwarden',
  '1password',
  'synology',
  'truenas',
  'unraid',
  'homarr',
  'homepage',
  'n8n',
  'gitea',
  'authentik',
  'authelia',
  'stirling-pdf',
  'it-tools',
  'audiobookshelf',
  'navidrome',
  'freshrss',
  'syncthing',
  'netdata',
  'dozzle',
  'frigate',
  'unifi',
  'pfsense',
  'opnsense',
  'chatgpt',
  'openai',
  'claude-ai',
  'google-gemini',
  'perplexity',
  'ollama',
  'open-webui',
  'hugging-face',
  'google',
  'gmail',
  'google-drive',
  'google-calendar',
  'google-docs',
  'google-sheets',
  'google-photos',
  'google-meet',
  'google-maps',
  'google-cloud',
  'youtube',
  'youtube-music',
  'firebase',
  'vercel',
  'netlify',
  'supabase',
  'railway',
  'digitalocean',
  'amazon-web-services',
  'microsoft-azure',
  'notion',
  'obsidian',
  'trello',
  'linear',
  'asana',
  'clickup',
  'todoist',
  'toggl',
  'figma',
  'canva',
  'excalidraw',
  'miro',
  'discord',
  'slack',
  'telegram',
  'whatsapp',
  'microsoft-teams',
  'microsoft-outlook',
  'proton-mail',
  'proton-drive',
  'dropbox',
  'icloud',
  'netflix',
  'prime-video',
  'disney-plus',
  'spotify',
  'twitch',
  'steam',
  'reddit',
  'x',
  'instagram',
  'linkedin',
  'facebook',
  'tiktok',
  'bluesky',
  'stack-overflow',
  'hacker-news',
  'medium',
  'dev-to',
  'wikipedia',
  'amazon',
  'mercado-libre',
];

export const POPULAR_TECH_ICONS = [
  'javascript',
  'typescript',
  'python',
  'react',
  'vuejs',
  'angularjs',
  'nodejs',
  'nextjs',
  'html5',
  'css3',
  'tailwindcss',
  'sass',
  'go',
  'rust',
  'java',
  'csharp',
  'cplusplus',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'dart',
  'flutter',
  'docker',
  'kubernetes',
  'git',
  'github',
  'gitlab',
  'linux',
  'ubuntu',
  'debian',
  'archlinux',
  'windows11',
  'apple',
  'android',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'sqlite',
  'firebase',
  'supabase',
  'amazonwebservices',
  'googlecloud',
  'azure',
  'cloudflare',
  'nginx',
  'apache',
  'graphql',
  'jest',
  'vitest',
  'webpack',
  'vite',
  'vscode',
  'neovim',
  'figma',
  'jira',
  'trello',
  'bash',
  'powershell',
  'terraform',
  'ansible',
  'jenkins',
  'prometheus',
  'grafana',
];

const SECOND_LEVEL_TLDS = new Set([
  'com',
  'org',
  'net',
  'edu',
  'gov',
  'mil',
  'co',
  'app',
  'dev',
  'io',
  'ai',
  'me',
  'tv',
  'gg',
  'sh',
  'xyz',
  'tech',
  'cloud',
  'local',
  'lan',
  'home',
  'internal',
]);

/**
 * Normaliza uma string de título ou nome para um formato de slug válido (kebab-case)
 */
export function normalizeToSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Infere uma lista ordenada de possíveis slugs do DashboardIcons / SimpleIcons
 * a partir da URL e do nome do bookmark.
 */
export function inferIconSlugs(url, name) {
  const candidates = [];
  const addCandidate = (slug) => {
    if (!slug || slug.length < 2) return;
    const clean = slug.toLowerCase().trim();
    if (clean && !candidates.includes(clean)) {
      candidates.push(clean);
    }
  };

  // 1. Verificar nome do bookmark no mapa de nomes conhecidos
  if (name) {
    const cleanName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (NAME_TO_SLUG_MAP[cleanName]) {
      addCandidate(NAME_TO_SLUG_MAP[cleanName]);
    }

    // Verificar se alguma chave do NAME_TO_SLUG_MAP está contida como palavra principal
    for (const [key, mappedSlug] of Object.entries(NAME_TO_SLUG_MAP)) {
      if (key.length >= 4 && cleanName.includes(key)) {
        addCandidate(mappedSlug);
      }
    }
  }

  // 2. Extrair candidatos do domínio da URL
  if (url) {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

      // Verificar se não é IP puro ou localhost
      const isIpOrLocal =
        /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
        host === 'localhost' ||
        host.endsWith('.local') ||
        host.endsWith('.lan');

      if (!isIpOrLocal) {
        // Match exato no mapa de domínios
        if (DOMAIN_TO_SLUG_MAP[host]) {
          addCandidate(DOMAIN_TO_SLUG_MAP[host]);
        }

        // Verificar domínio sem subdomínio no mapa (ex: sub.notion.so -> notion.so)
        const parts = host.split('.');
        if (parts.length >= 2) {
          const lastTwo = parts.slice(-2).join('.');
          if (DOMAIN_TO_SLUG_MAP[lastTwo]) {
            addCandidate(DOMAIN_TO_SLUG_MAP[lastTwo]);
          }
          const lastThree = parts.slice(-3).join('.');
          if (DOMAIN_TO_SLUG_MAP[lastThree]) {
            addCandidate(DOMAIN_TO_SLUG_MAP[lastThree]);
          }
        }

        // Extrair nome principal do domínio e subdomínio
        // Ex: grafana.meudominio.com -> testa "grafana" e "meudominio"
        const meaningfulParts = parts.filter(
          (p) =>
            p.length > 1 &&
            !SECOND_LEVEL_TLDS.has(p) &&
            p !== 'www' &&
            p !== 'br' &&
            p !== 'uk' &&
            p !== 'us' &&
            p !== 'de' &&
            p !== 'fr',
        );

        // Se o primeiro elemento parece um serviço em subdomínio (ex: plex.meuserver.com)
        if (meaningfulParts.length >= 1) {
          const firstPart = meaningfulParts[0];
          if (NAME_TO_SLUG_MAP[firstPart]) {
            addCandidate(NAME_TO_SLUG_MAP[firstPart]);
          }
          addCandidate(firstPart);
        }

        if (meaningfulParts.length >= 2) {
          const secondPart = meaningfulParts[1];
          if (NAME_TO_SLUG_MAP[secondPart]) {
            addCandidate(NAME_TO_SLUG_MAP[secondPart]);
          }
          addCandidate(secondPart);
        }
      }
    } catch {
      // URL inválida, ignora
    }
  }

  // 3. Slug direto do nome do bookmark e da primeira palavra do nome
  if (name) {
    const slugFromName = normalizeToSlug(name);
    if (slugFromName && slugFromName.length <= 28) {
      addCandidate(slugFromName);
    }
    const firstWord = slugFromName.split('-')[0];
    if (firstWord && firstWord.length >= 3) {
      addCandidate(firstWord);
    }
  }

  return candidates;
}

// ===== CACHE DE TRAVAMENTO (LOCK-ON-FIRST-RESOLVE) =====
// Depois que o ícone de um link é resolvido na 1ª vez, a URL vencedora fica
// travada em localStorage (leitura síncrona em 0ms). Nunca mais tenta candidatos
// que deram 404 nem recalcula slugs, a menos que o usuário edite o link ou peça atualização.
const RESOLVED_ICONS_STORAGE_KEY = 'initialChrome_resolvedIcons_v1';
let resolvedIconsCache = null;
let saveCacheTimeout = null;

function getResolvedIconsMap() {
  if (resolvedIconsCache) return resolvedIconsCache;
  try {
    const raw =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(RESOLVED_ICONS_STORAGE_KEY)
        : null;
    resolvedIconsCache = raw ? JSON.parse(raw) : {};
  } catch {
    resolvedIconsCache = {};
  }
  return resolvedIconsCache;
}

function persistResolvedIconsMap() {
  if (saveCacheTimeout) clearTimeout(saveCacheTimeout);
  saveCacheTimeout = setTimeout(() => {
    try {
      if (typeof localStorage !== 'undefined' && resolvedIconsCache) {
        localStorage.setItem(
          RESOLVED_ICONS_STORAGE_KEY,
          JSON.stringify(resolvedIconsCache),
        );
      }
    } catch {
      // Ignora erro de quota do localStorage
    }
  }, 150);
}

export function getLockedIconUrl(linkUrl, defaultIconSource = 'dashboardicons') {
  if (!linkUrl) return null;
  const map = getResolvedIconsMap();
  const entry = map[linkUrl];
  if (entry && entry.source === defaultIconSource && entry.iconUrl) {
    return entry.iconUrl;
  }
  return null;
}

export function lockResolvedIconUrl(
  linkUrl,
  defaultIconSource,
  winningIconUrl,
) {
  if (!linkUrl || !winningIconUrl) return;
  const map = getResolvedIconsMap();
  if (
    map[linkUrl] &&
    map[linkUrl].source === defaultIconSource &&
    map[linkUrl].iconUrl === winningIconUrl
  ) {
    return; // Já está travado com o mesmo valor
  }
  map[linkUrl] = {
    source: defaultIconSource,
    iconUrl: winningIconUrl,
  };
  persistResolvedIconsMap();
}

export function clearLockedIconUrl(linkUrl) {
  if (!linkUrl) return;
  const map = getResolvedIconsMap();
  if (map[linkUrl]) {
    delete map[linkUrl];
    persistResolvedIconsMap();
  }
}

export function clearAllLockedIconUrls() {
  resolvedIconsCache = {};
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(RESOLVED_ICONS_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Constrói a lista ordenada de URLs de ícone para tentar carregar em cascata.
 * Se já houver um ícone resolvido e travado anteriormente para este link,
 * retorna direto a URL vencedora em 0ms sem recalcular nem testar candidatos.
 */
export function resolveIconUrls(
  link,
  customIcon,
  defaultIconSource = 'dashboardicons',
  iconSize = 32,
  ignoreLock = false,
) {
  const urls = [];
  const fetchSize = Math.max(iconSize * 2, 64);
  const googleFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url || '')}&sz=${fetchSize}`;

  // 1. Se o usuário definiu um ícone customizado específico para este link
  if (customIcon) {
    if (customIcon.type === 'simpleicons' && customIcon.value) {
      const colorHex = customIcon.color
        ? customIcon.color.replace('#', '')
        : 'default';
      urls.push(`${SIMPLE_ICONS_CDN}/${customIcon.value}/${colorHex}`);
    } else if (customIcon.type === 'techicons' && customIcon.value) {
      const suffix = customIcon.color === 'original' ? 'original' : 'plain';
      urls.push(
        `${TECH_ICONS_CDN}/${customIcon.value}/${customIcon.value}-${suffix}.svg`,
      );
    } else if (customIcon.type === 'dashboardicons' && customIcon.value) {
      urls.push(`${DASHBOARD_ICONS_CDN}/${customIcon.value}.svg`);
    } else if (customIcon.type === 'custom' && customIcon.value) {
      urls.push(customIcon.value);
    }
    // Sempre adiciona o favicon do Google como último fallback caso a URL customizada falhe
    urls.push(googleFavicon);
    return urls;
  }

  // 2. Fast-path: Se já resolveu na primeira vez, usa direto a URL travada!
  if (!ignoreLock && link && link.url) {
    const lockedUrl = getLockedIconUrl(link.url, defaultIconSource);
    if (lockedUrl) {
      urls.push(lockedUrl);
      if (lockedUrl !== googleFavicon) {
        urls.push(googleFavicon);
      }
      return urls;
    }
  }

  // 3. Resolução automática inteligente (só roda na 1ª vez que o link é visto)
  if (defaultIconSource === 'dashboardicons') {
    const slugs = inferIconSlugs(link.url, link.name);
    // Tenta até os 2 melhores candidatos no DashboardIcons antes de cair no Favicon oficial
    slugs.slice(0, 2).forEach((slug) => {
      urls.push(`${DASHBOARD_ICONS_CDN}/${slug}.svg`);
    });
  } else if (defaultIconSource === 'simpleicons') {
    const slugs = inferIconSlugs(link.url, link.name);
    slugs.slice(0, 2).forEach((slug) => {
      urls.push(`${SIMPLE_ICONS_CDN}/${slug.replace(/-/g, '')}`);
    });
  }

  // Fallback final garantido: Favicon de alta resolução do Google
  urls.push(googleFavicon);
  return urls;
}

/**
 * Configura um elemento <img> com cascata de fallback automática (onerror)
 * e trava (lock) a primeira URL que carregar com sucesso (onload) para que
 * nas próximas aberturas de aba o carregamento seja direto e instantâneo.
 */
export function attachIconCascade(
  imgEl,
  urls,
  useLazyObserver = null,
  lockContext = null,
) {
  if (!imgEl || !urls || urls.length === 0) return;

  let currentIndex = 0;

  if (lockContext && lockContext.url && !lockContext.isCustom) {
    imgEl.onload = () => {
      const winningUrl = urls[currentIndex] || imgEl.src;
      if (winningUrl && !winningUrl.endsWith('icons/icon48.png')) {
        lockResolvedIconUrl(
          lockContext.url,
          lockContext.source || 'dashboardicons',
          winningUrl,
        );
      }
      imgEl.onload = null;
    };
  }

  imgEl.onerror = () => {
    currentIndex++;
    if (currentIndex < urls.length) {
      imgEl.src = urls[currentIndex];
    } else {
      imgEl.onerror = null;
      imgEl.src = 'icons/icon48.png';
    }
  };

  if (useLazyObserver) {
    imgEl.dataset.src = urls[0];
    useLazyObserver.observe(imgEl);
  } else {
    imgEl.src = urls[0];
  }
}

// ===== CATÁLOGO DE BUSCA VISUAL (DashboardIcons + TechIcons + SimpleIcons) =====
let cachedDashboardCatalog = null;

/**
 * Carrega o catálogo completo de slugs do DashboardIcons (com cache de 7 dias no storage.local
 * e fallback imediato para POPULAR_DASHBOARD_ICONS).
 */
export async function getDashboardIconsCatalog() {
  if (cachedDashboardCatalog) return cachedDashboardCatalog;

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      cachedDashboardCatalog = POPULAR_DASHBOARD_ICONS;
      resolve(cachedDashboardCatalog);
      return;
    }

    const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000;
    chrome.storage.local.get(['dashboardIconsCatalogCache'], async (res) => {
      const cache = res.dashboardIconsCatalogCache;
      if (
        cache &&
        Array.isArray(cache.icons) &&
        cache.icons.length > 100 &&
        Date.now() - cache.timestamp < TTL_7_DAYS
      ) {
        cachedDashboardCatalog = cache.icons;
        resolve(cachedDashboardCatalog);
        return;
      }

      // Buscar índice da árvore de arquivos via API do jsDelivr (rápido e permitido pelo CSP/CORS)
      try {
        const resp = await fetch(
          'https://data.jsdelivr.com/v1/package/gh/homarr-labs/dashboard-icons@main/flat',
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.files)) {
            const slugs = data.files
              .map((f) => f.name || '')
              .filter((name) => name.startsWith('/svg/') && name.endsWith('.svg'))
              .map((name) => name.slice(5, -4));

            if (slugs.length > 0) {
              cachedDashboardCatalog = slugs;
              chrome.storage.local.set({
                dashboardIconsCatalogCache: {
                  icons: slugs,
                  timestamp: Date.now(),
                },
              });
              resolve(cachedDashboardCatalog);
              return;
            }
          }
        }
      } catch {
        // Silencioso: usa a lista curada embutida se estiver offline
      }

      cachedDashboardCatalog = Array.from(
        new Set([
          ...POPULAR_DASHBOARD_ICONS,
          ...Object.values(DOMAIN_TO_SLUG_MAP),
          ...Object.values(NAME_TO_SLUG_MAP),
        ]),
      ).sort();
      resolve(cachedDashboardCatalog);
    });
  });
}

/**
 * Filtra sugestões de ícones para exibir na grade visual do modal de edição
 */
export async function searchIconCatalog(source, query, linkContext = null, limit = 24) {
  const cleanQuery = (query || '').trim().toLowerCase().replace(/\s+/g, '-');

  let baseList = [];
  if (source === 'techicons') {
    baseList = POPULAR_TECH_ICONS;
  } else {
    baseList = await getDashboardIconsCatalog();
  }

  // Se a busca estiver vazia ou muito curta, prioriza os candidatos inferidos do link atual + populares
  if (!cleanQuery) {
    const inferred = linkContext
      ? inferIconSlugs(linkContext.url, linkContext.name)
      : [];
    const popular =
      source === 'techicons' ? POPULAR_TECH_ICONS : POPULAR_DASHBOARD_ICONS;
    const combined = Array.from(new Set([...inferred, ...popular]));
    return combined.slice(0, limit).map((slug) => ({
      slug,
      url: buildPreviewUrlForSource(source, slug),
    }));
  }

  // Busca com ranking: 1º match exato, 2º começa com a query, 3º contém a query
  const exact = [];
  const startsWith = [];
  const includes = [];

  for (const slug of baseList) {
    if (slug === cleanQuery) {
      exact.push(slug);
    } else if (slug.startsWith(cleanQuery)) {
      startsWith.push(slug);
    } else if (slug.includes(cleanQuery)) {
      includes.push(slug);
    }
  }

  // Mesmo que o slug digitado não esteja na lista conhecida (ex: SimpleIcons), inclui o próprio termo
  const results = Array.from(
    new Set([...exact, ...startsWith, ...includes, cleanQuery]),
  ).slice(0, limit);

  return results.map((slug) => ({
    slug,
    url: buildPreviewUrlForSource(source, slug),
  }));
}

export function buildPreviewUrlForSource(
  source,
  slug,
  options = { simpleColor: 'ffffff', techColored: true },
) {
  const cleanSlug = (slug || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!cleanSlug) return '';

  if (source === 'simpleicons') {
    const color = (options.simpleColor || '#ffffff').replace('#', '');
    return `${SIMPLE_ICONS_CDN}/${cleanSlug.replace(/-/g, '')}/${color}`;
  }
  if (source === 'techicons') {
    const suffix = options.techColored !== false ? 'original' : 'plain';
    return `${TECH_ICONS_CDN}/${cleanSlug}/${cleanSlug}-${suffix}.svg`;
  }
  return `${DASHBOARD_ICONS_CDN}/${cleanSlug}.svg`;
}

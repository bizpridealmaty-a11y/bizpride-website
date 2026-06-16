# 📦 HANDOFF — bizpride.kz (перенос работы без потери данных)

> Документ для переноса проекта в другой сервис/окружение (Claude Code и т.п.).
> Составлен 2026-06-16. Содержит всё необходимое, чтобы продолжить работу
> над сайтом без потери данных и работоспособности.

---

## 🎯 Самое главное (TL;DR)

**Весь проект самодостаточен: Git-репозиторий + облачные сервисы = полностью рабочий сайт.**
В репозитории **НЕТ секретов** (`.env` отсутствует, Sanity-клиент читает публичные данные без токена).
Поэтому перенос = `git clone` + доступы к 3 облачным аккаунтам (GitHub, Sanity, Netlify). Ничего не теряется.

| Что | Где живёт | Теряется при переносе? |
|---|---|---|
| Код сайта | GitHub `bizpridealmaty-a11y/bizpride-website` | ❌ нет (клонируется) |
| Контент (статьи, фотоальбомы) | Sanity Cloud (projectId `yctyzy4i`) | ❌ нет (в облаке) |
| Хостинг/деплой | Netlify (подключён к GitHub) | ⚠️ настройки сборки — в дашборде Netlify, не в репо |
| Аналитика/верификация | в коде (`public/`, `Layout.astro`) | ❌ нет (в git) |
| Секреты/токены | **их нет** | — |

---

## 1. Репозиторий и деплой

- **GitHub:** `https://github.com/bizpridealmaty-a11y/bizpride-website` , ветка **`main`**
- **Деплой:** Netlify, **автодеплой по `git push origin main`** (отдельный деплой не нужен)
- **Прод-домен:** https://bizpride.kz
- **Sitemap:** https://bizpride.kz/sitemap-index.xml (73 страницы)

### Netlify (настройки — в дашборде, НЕ в репо: нет `netlify.toml`)
При переподключении/новом сайте укажи вручную:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Env var `NETLIFY`** выставляется Netlify автоматически (включает IndexNow-пинг — см. §6)
- Node version: задать **20 LTS** (см. §3)

---

## 2. Структура проекта (два пакета!)

```
bizpride-astro/
├── src/                  ← САЙТ (Astro)
│   ├── pages/            ← страницы (.astro), блог в pages/blog/
│   ├── layouts/          ← Layout.astro (head/SEO/OG/schema), BlogPost.astro
│   ├── components/       ← Navigation, Footer, Breadcrumbs, BlogTeaser, RelatedPosts
│   ├── lib/sanity.ts     ← Sanity-клиент (projectId yctyzy4i)
│   ├── data/residents.js ← данные резидентов
│   └── assets/           ← изображения (Astro Image → webp)
├── public/               ← статика, отдаётся как есть (OG-баннеры, robots.txt, верификации)
├── scripts/              ← submit-to-indexnow.mjs, convert-to-webp.mjs
├── studio/               ← SANITY STUDIO (отдельный npm-пакет, своя package.json)
├── astro.config.mjs      ← site, trailingSlash:always, sitemap
└── package.json          ← скрипты сборки сайта
```

---

## 3. Стек и версии

**Сайт (root):**
- Astro `^5.17.1` (статический SSG; `trailingSlash: 'always'`, `compressHTML: true`)
- `@astrojs/sitemap ^3.7.0`
- `@sanity/client ^7.16.0`, `@sanity/image-url ^2.0.3`

**Sanity Studio (`studio/`):**
- `sanity ^5.12.0`, `@sanity/vision ^5.12.0`, React 19, styled-components 6

**Node:** в репо не зафиксирован (нет `.nvmrc`). На рабочей машине был Node 25, но для стабильности **рекомендуется Node 20 LTS** (или 22). Astro 5 требует Node 18.20.8+/20/22.

---

## 4. Локальный запуск

```bash
# САЙТ
npm install
npm run dev        # astro dev → http://localhost:4321
npm run build      # astro build (+ indexnow, пингует только в Netlify CI)
npm run preview    # предпросмотр собранного

# SANITY STUDIO (контент)
cd studio
npm install
npm run dev        # sanity dev → редактор контента
npm run deploy     # sanity deploy → опубликовать студию на *.sanity.studio
```

> Контент (тексты статей, фотоальбомы) правится в **Sanity Studio**, без пересборки кода.
> Сборка кода нужна только для изменений в `.astro`/верстке/SEO.

---

## 5. Облачные доступы, которые нужны (это всё, что требуется для переноса)

1. **GitHub** — аккаунт с правами на `bizpridealmaty-a11y/bizpride-website` (push в `main`).
2. **Sanity** — логин владельца проекта `yctyzy4i` (sanity.io). Контент в датасете `production`.
   Для деплоя студии — `sanity login` под этим аккаунтом.
3. **Netlify** — аккаунт, к которому подключён сайт (для просмотра деплоев/настроек).

Никаких API-токенов/паролей в коде нет — всё через интерактивный логин этих сервисов.

---

## 6. Аналитика, верификация, IndexNow (всё уже в git → переезжает само)

- **Yandex Metrika:** ID `108838020` (в `src/layouts/Layout.astro`)
- **Google Analytics 4:** `G-PTCSV0Q73E` (в `Layout.astro`)
- **Google Search Console** верификация: `public/googleff0513db75db1b92.html`
- **Yandex.Webmaster** верификация: `public/yandex_990717ed45296f41.html`
- **IndexNow** ключ (публичный): `b17b8717d34281cb8086b69ebcab75a2`
  - файл-ключ: `public/b17b8717d34281cb8086b69ebcab75a2.txt`
  - скрипт `scripts/submit-to-indexnow.mjs` пингует Yandex+Bing **только** в Netlify CI (`process.env.NETLIFY`), на локальной сборке пропускается.

⚠️ При переносе **не удаляй файлы верификации из `public/`** — иначе слетит подтверждение в GSC/Яндексе.

---

## 7. ⚠️ Грабли с `git push` (специфика текущей Windows-машины)

На этой машине push в репозиторий падал с **403**, т.к. git credential helper для github.com = **GitHub CLI (`gh`)**, а `gh` хранил токен старого аккаунта `smm79601101810-dotcom` (без прав на репо). Браузерный логин и чистка GCM не помогали — `gh` отвечает первым.

**Рабочий обход для push (проверен):**
```bash
git -c credential.https://github.com.helper= \
    -c credential.https://github.com.helper=manager \
    -c credential.guiPrompt=true \
    push origin main
```

**Перманентный фикс (рекомендуется в новом окружении):**
- `gh auth login` под аккаунтом `bizpridealmaty-a11y`, **или**
- настроить SSH-ключ и сменить remote на SSH, **или**
- использовать Personal Access Token (scope `repo`/contents:write).

> В НОВОМ окружении кредами займёшься заново — эта проблема может не повториться, но знай о ней.

---

## 8. Текущее состояние (на 2026-06-16)

- **Последние коммиты:**
  - `2dccb52` — VideoObject schema для видео-постов блога
  - `7853e72` — уникальные OG-баннеры, реальная /about, синхронизация цен /pricing
  - `fa198d7` — recurring Event schema на /business-brunch/
- **Sitemap:** 73 страницы, сборка зелёная.
- **SEO-аудит (10 пунктов + разделы 2–4): полностью закрыт.**
  - OG: 9 баннеров 1200×630 в `public/og/` + блог отдаёт YouTube-превью (генератор баннеров — System.Drawing, см. историю; при изменении заголовков перегенерить).
  - Schema.org: Organization/LocalBusiness/FAQPage/Article/Event/BreadcrumbList/VideoObject.
  - /about — настоящая «О клубе»; /pricing — цены синхронизированы с главной (₸10 000/мес · ₸300 000/6мес · ₸500 000/12мес).
  - keywords — уникальные на 11 основных страницах.

---

## 9. Открытые задачи (перенести в новый трекер)

**Приоритет:**
1. Финальный аудит всех 73 страниц (200 OK, длины title/description, broken links, скорость).
2. GSC — 2 ошибки переадресации (нужен скриншот: какие URL).

**Нужен input владельца:**
3. 3 портфолио-страницы `/portfolio-collections/*` сейчас 410 Gone — оставить 410 или 301?
4. og:image для `/blog/sotrudnichestvo-so-spikerami/` — пока заглушка.
5. Удалить устаревшую ветку `wip/bento-gallery` на GitHub.
6. Yandex.Webmaster — глянуть 2-ю рекомендацию.

**Опционально:** Yandex Турбо-страницы; A/B WhatsApp CTA; сократить 3 длинных title; локализация Unsplash-картинок (9 blog-файлов).

---

## 10. Контекст для AI-ассистента (чтобы новый помощник «всё помнил»)

- **Сайт ≠ папка TG_APP.** TG_APP — Telegram Mini App и побочные скрипты. Сам сайт — этот Astro-проект.
- **SEO/мета/sitemap/robots** — правятся в Astro-проекте. **Контент** — в Sanity Studio.
- **Деплой** — `git push origin main` → Netlify собирает сам.
- **OG-превью кешируются** соцсетями: после изменений сбрасывать через Telegram `@WebpageBot` / FB Sharing Debugger.
- Целевая аудитория контента: предприниматели Алматы; язык — русский (KK-версии нет, by design).

---

## 11. Чеклист переноса

- [ ] `git clone https://github.com/bizpridealmaty-a11y/bizpride-website` (или открыть существующую папку)
- [ ] Настроить git-доступ к репо (см. §7) и проверить `git push` тестовым коммитом
- [ ] `npm install` в корне; `npm run dev` — убедиться, что сайт поднимается (Sanity тянется по сети)
- [ ] `cd studio && npm install && npm run dev` — проверить доступ к контенту (нужен `sanity login`)
- [ ] Зайти в Netlify, проверить привязку к репо + build settings (`npm run build` / `dist`)
- [ ] Сделать пробный коммит → push → убедиться, что Netlify задеплоил
- [ ] Перенести открытые задачи (§9) в новый трекер/память

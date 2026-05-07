# Hallöchen Website

Die Website für das genossenschaftlich geführte Kneipenprojekt Hallöchen in
Berlin-Moabit.

Die Anwendung ist eine Single-Page-Website auf Basis von Vue 3 und Vite. Sie
enthält unter anderem:

- einen Hero-Bereich mit Einführung
- einen Veranstaltungsbereich mit Kalenderdaten
- einen Bereich zum Konzept
- Informationen zu Raum, Öffnungszeiten und rechtlichen Seiten

Wenn du fragen hast oder unterstützen willst, wende dich gerne an info@halloechen.org !

## Tech-Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Tailwind CSS 4
- ESLint
- Prettier

## Voraussetzungen

- Node.js in einer Version passend zu `package.json`
  - empfohlen: Node 22
- npm

## Lokale Entwicklung

Abhängigkeiten installieren:

```sh
npm install
```

Entwicklungsserver starten:

```sh
npm run dev
```

Produktionsbuild lokal prüfen:

```sh
npm run build
```

Nur den Vite-Build ausführen:

```sh
npm run build-only
```

Vorschau des Produktionsbuilds starten:

```sh
npm run preview
```

## Qualitätschecks

TypeScript-Check:

```sh
npm run type-check
```

Linting:

```sh
npm run lint
```

Formatierung:

```sh
npm run format
```

## Projektstruktur

- `src/pages/`: Seiten wie Startseite, Impressum und Datenschutz
- `src/components/`: wiederverwendbare UI-Bausteine
- `src/composables/`: Vue-Composables für Scroll-Verhalten und Navigation
- `src/calendar.ts`: Veranstaltungsdaten
- `public/`: statische Dateien wie `robots.txt` und `sitemap.xml`

## Deployment

Das Deployment läuft über GitLab CI/CD.

Die Pipeline führt folgende Schritte aus:

1. Type-Check
2. Linting
3. Format-Check
4. Produktionsbuild
5. Deployment per FTP/SFTP

Pipelines werden nur für Release-Tags im Format `release_X.Y.Z` erzeugt, zum
Beispiel:

```sh
git tag release_1.0.0
git push origin release_1.0.0
```

## Benötigte CI/CD-Variablen

Für das Deployment müssen in GitLab unter `Settings > CI/CD > Variables`
mindestens diese Variablen gesetzt sein:

- `FTP_HOST`
- `FTP_USER`
- `FTP_PASSWORD`
- `FTP_REMOTE_PATH`

Wenn diese Variablen als `Protected` markiert sind, muss auch das verwendete
Release-Tag geschützt sein.

## Hinweise

- Der Kalender ist aktuell statisch in `src/calendar.ts` hinterlegt.
- Änderungen an Inhalten, Texten und Terminen können direkt im Quellcode
  gepflegt werden.
- Der Build-Output liegt nach erfolgreichem Build im Verzeichnis `dist/`.

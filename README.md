# E-Auto-Ladekostenvergleich

Statische Website mit Netlify Function als sicherem Proxy zur Innostrom API v2.

## Sicherheit

- Token und Messpunktnummer gehoeren ausschliesslich in die Netlify-Umgebungsvariablen.
- Niemals echte Zugangsdaten in `.env`, Quellcode, GitHub-Issues oder Commits speichern.
- Der zuvor offengelegte Token sollte vor produktiver Nutzung erneuert werden.

## Netlify-Variablen

- `INNOSTROM_API_TOKEN`
- `INNOSTROM_METERING_CODE`
- `INNOSTROM_API_BASE` = `https://portal.dynamische-stromtarife.ch/api`

Bei Variablen mit Scopes muss `Functions` eingeschlossen sein.

## Lokaler Test optional

1. Node.js installieren.
2. `npm install`
3. `.env.example` nach `.env` kopieren und lokale Testwerte eintragen.
4. `npm run dev`
5. Die von Netlify CLI angezeigte lokale URL öffnen.

## Deployment

Repository nach GitHub pushen, in Netlify ueber **Add new project > Import an existing project** verbinden, Variablen setzen und neu deployen.

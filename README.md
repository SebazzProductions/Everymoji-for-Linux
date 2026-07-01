# Everymoji for Linux

Everymoji ist ein kleiner Begleiter für alle, die Emojis nicht nur gelegentlich anklicken, sondern sie wirklich ständig benutzen – in Chats, Notizen, Posts, Mails oder einfach überall dort, wo ein bisschen Gefühl, Ton oder Humor in einen Satz soll.

Die App wurde nicht als aufgeblasenes Produkt gebaut, sondern als liebevoll gemachtes Werkzeug für echten Alltag: schnell, direkt, hübsch, präsent und angenehm. Ein Emoji-Picker, der nicht im Weg steht, sondern genau dann da ist, wenn man ihn braucht – und genau dort einfügt, wo der Cursor gerade wartet.

Everymoji soll sich weniger wie Software und mehr wie ein kleines gutes Helferlein anfühlen.

## Für jeden

Everymoji ist als kleines Geschenk gedacht, nicht als Geschäft. Kostenlos, ohne Konto, ohne Tracking, ohne Haken – und auf **Windows** wie auf **Linux**, damit wirklich jede und jeder das gleiche kleine Helferlein hat, ganz gleich womit man arbeitet.

- 🪟 **Windows** → https://github.com/SebazzProductions/Everymoji-for-Windows
- 🐧 **Linux** → https://github.com/SebazzProductions/Everymoji-for-Linux

Gleiche App, gleiche Idee, gleiche Sorgfalt. Nur der Weg, wie das Emoji an deinen Cursor kommt, ist auf jedem System nativ gelöst.

## Download

Everymoji für Linux gibt es in zwei Formen:

- **AppImage** – herunterladen, ausführbar machen, starten. Läuft auf praktisch jeder Distribution, kein Installer nötig.
- **.deb** – für Debian, Ubuntu und Pop!_OS. Legt einen Menü-Eintrag an.

Beide findest du auf der [Releases-Seite](https://github.com/SebazzProductions/Everymoji-for-Linux/releases/latest).

**AppImage**

```bash
chmod +x Everymoji-*.AppImage
./Everymoji-*.AppImage
```

**.deb** (installiert gleich das passende Einfüge-Werkzeug mit)

```bash
sudo apt install -y ./Everymoji-*.deb wtype xdotool
```

Wie bei der portablen Windows-Version bleiben Favoriten und zuletzt verwendete Emojis erhalten: Wird das AppImage aus einem beschreibbaren Ordner gestartet, legt Everymoji seine Daten daneben in `Everymoji Data/` ab, sonst unter `~/.config/everymoji`.

## So kommt das Emoji an deinen Cursor

Windows hat dafür genau einen Weg. Linux hat den nicht – deshalb erkennt Everymoji die Sitzung automatisch und wählt das beste verfügbare Werkzeug. **Egal was passiert, das Emoji landet immer in der Zwischenablage**, sodass nie etwas verloren geht (Strg+V funktioniert also immer).

| Sitzung | Werkzeug | Verhalten |
|---|---|---|
| **X11** | `xdotool` | Aktiviert das zuletzt fokussierte Fenster und fügt mit Strg+V ein. |
| **Wayland** (COSMIC, wlroots, KDE) | `wtype` | Tippt das Emoji direkt in das fokussierte Feld. |
| **Wayland** (auch GNOME) | `ydotool` | Fügt via Kernel-uinput ein – braucht den `ydotoold`-Dienst. |
| sonst | – | Emoji wird kopiert, du fügst mit Strg+V selbst ein. |

Passendes Werkzeug installieren (das `.deb` empfiehlt sie automatisch):

```bash
sudo apt install wtype                 # Wayland (Pop!_OS 24.04 / COSMIC / KDE)
sudo apt install xdotool               # X11
sudo apt install ydotool wl-clipboard  # universeller Wayland-Fallback (inkl. GNOME)
```

Das Backend lässt sich zum Testen mit `EVERYMOJI_BACKEND=…` erzwingen; der aktive Modus steht jederzeit im Tray.

## Features

- Schneller, suchbarer Emoji-Picker
- Klick zum Auswählen, Doppelklick zum direkten Senden
- Kategorien, Favoriten und zuletzt verwendete Emojis
- Hautton-Auswahl für unterstützte Emojis
- Globaler Hotkey für sofortigen Zugriff
- Mehrere Themes inklusive Accessibility-Varianten
- Fügt genau dort ein, wo der Cursor gerade wartet

## Bedienung

- **Klick** wählt ein Emoji aus, **Doppelklick** sendet es direkt an den Cursor.
- **Rechtsklick** auf ein Emoji schaltet es als Favorit an oder aus.
- `/` springt in die Suche, `Esc` leert sie.
- Kategorien, Favoriten und zuletzt verwendete Emojis oben umschaltbar.
- Hautton-Auswahl erscheint bei Emojis, die sie unterstützen.
- Themes oben rechts durchschalten.

**Globaler Hotkey:** **Alt+E** blendet den Picker ein und aus (X11). Auf Wayland dürfen Apps meist keine globalen Hotkeys registrieren – Everymoji ist deshalb single-instance: Lege in deinen Tastatur-Einstellungen (COSMIC/GNOME) eine Verknüpfung auf das Kommando `everymoji`, das die laufende Instanz umschaltet.

## Warum es existiert

Viele kleine Tools lösen ein Problem technisch, fühlen sich dabei aber komplett seelenlos an. Everymoji sollte das Gegenteil werden: eine schlanke App, die leicht wirkt, schnell reagiert und trotzdem sichtbar mit Liebe gebaut wurde.

Nicht überladen. Nicht generisch. Nicht „auch noch ein Tool".

Sondern etwas, das man öffnet und sofort merkt: Das hier wurde für echte Nutzung gemacht – und für echte Menschen.

## Entwicklung

Voraussetzungen: Node.js 20+, npm und Linux, wenn du die native Einfüge-Funktion direkt testen willst (die UI lässt sich per `npm run dev` auch anderswo ansehen).

```bash
npm install          # Abhängigkeiten
npm run dev          # Entwicklungsmodus
npm run typecheck    # Typecheck
npm run build:linux  # AppImage + .deb im dist-Ordner
```

Das finale AppImage/.deb-Packaging läuft auf Linux – oder in der GitHub-Action auf `ubuntu-latest`, die bei einem `v*`-Tag automatisch baut und veröffentlicht.

## Stack

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- xdotool / wtype / ydotool für die native Linux-Einfüge-Integration

## Projektgedanke

Everymoji ist aus dem Wunsch entstanden, etwas Kleines zu bauen, das sich erstaunlich gut anfühlt. Kein riesiges Produktversprechen, kein unnötiger Overhead, sondern ein fokussiertes Tool mit Charakter, Tempo und einer klaren Idee.

Wenn jemand die App startet, ein Emoji in Sekunden findet und es ohne Reibung genau dort landet, wo es hin soll, dann ist das Ziel erreicht.

Und wenn man dabei noch ein kleines bisschen merkt, dass hier Herz drinsteckt, dann umso besser.

# Everymoji for Linux

Everymoji ist ein kleiner Linux-Begleiter fuer alle, die Emojis nicht nur gelegentlich anklicken, sondern sie wirklich staendig benutzen, in Chats, Notizen, Posts, Mails oder einfach ueberall dort, wo ein bisschen Gefuehl, Ton oder Humor in einen Satz soll.

Die App wurde nicht als aufgeblasenes Produkt gebaut, sondern als liebevoll gemachtes Werkzeug fuer echten Alltag: schnell, direkt, huebsch, praesent und angenehm. Ein Emoji-Picker, der nicht im Weg steht, sondern genau dann da ist, wenn man ihn braucht und genau dort einfuegt, wo der Cursor gerade wartet.

Everymoji soll sich weniger wie Software und mehr wie ein kleines gutes Helferlein anfuehlen.

Dies ist die Linux-Portierung von [Everymoji for Windows](https://github.com/SebazzProductions/Everymoji-for-Windows) — dieselbe App, aber mit einem plattform-nativen Einfuege-Weg fuer X11 und Wayland.

## Download

Everymoji fuer Linux kommt in zwei Formen:

- **AppImage** — herunterladen, ausfuehrbar machen, starten. Laeuft auf praktisch jeder Distribution, kein Installer noetig.
- **.deb** — fuer Debian, Ubuntu und Pop!_OS. Installiert Everymoji ins System und legt einen Menue-Eintrag an.

Beide findest du auf der [Releases-Seite](https://github.com/SebazzProductions/Everymoji-for-Linux/releases).

### AppImage

```bash
chmod +x Everymoji-*.AppImage
./Everymoji-*.AppImage
```

Wie bei der portablen Windows-Version bleiben **Favoriten und zuletzt verwendete Emojis erhalten**: Wird das AppImage aus einem beschreibbaren Ordner gestartet, legt Everymoji seine Daten direkt daneben in `Everymoji Data/` ab. Ist der Ordner nicht beschreibbar, wird der Standardpfad `~/.config/everymoji` verwendet.

### .deb

```bash
sudo apt install ./Everymoji-*.deb
```

## Einfuegen an der Cursorposition (X11 & Wayland)

Windows hatte genau einen Weg (`SetForegroundWindow` + simuliertes Strg+V). Linux hat den nicht — deshalb erkennt Everymoji die Sitzung automatisch und waehlt das beste verfuegbare Werkzeug. **Egal was passiert, das Emoji landet immer in der Zwischenablage**, sodass nie etwas verloren geht.

| Sitzung | Werkzeug | Verhalten |
|---|---|---|
| **X11** | `xdotool` | Aktiviert das zuletzt fokussierte Fenster und fuegt mit Strg+V ein. Fenster bleibt offen (wie unter Windows). |
| **Wayland** (COSMIC, wlroots, KDE) | `wtype` | Tippt das Emoji direkt in das fokussierte Eingabefeld. |
| **Wayland** (auch GNOME) | `ydotool` | Fuegt via Kernel-Uinput ein — funktioniert ueberall, braucht aber den `ydotoold`-Dienst. |
| Sonst | — | Emoji wird kopiert, du fuegst mit Strg+V selbst ein (Benachrichtigung erscheint). |

### Passendes Werkzeug installieren

Pop!_OS 24.04 nutzt COSMIC (Wayland) — dort ist `wtype` der einfachste Weg:

```bash
# Wayland (COSMIC / wlroots / KDE)
sudo apt install wtype

# X11 (aeltere Pop!_OS-Sitzungen, GNOME on X11)
sudo apt install xdotool

# Optional, universeller Wayland-Fallback inkl. GNOME
sudo apt install ydotool wl-clipboard
```

Das `.deb` empfiehlt diese Pakete automatisch (`recommends`), sodass sie bei einer normalen Installation meist gleich mitkommen.

#### ydotool einrichten (nur falls benoetigt)

`ydotool` arbeitet auf Kernel-Ebene und braucht Zugriff auf `/dev/uinput` sowie einen laufenden Daemon:

```bash
# Daemon als User-Dienst starten
systemctl --user enable --now ydotoold

# Falls Rechte fehlen: einmalige Uinput-Regel
echo 'KERNEL=="uinput", GROUP="input", MODE="0660"' | sudo tee /etc/udev/rules.d/99-uinput.rules
sudo udevadm control --reload-rules && sudo udevadm trigger
sudo usermod -aG input "$USER"   # danach neu anmelden
```

### Backend erzwingen

Zum Testen oder bei einem ungewoehnlichen Setup laesst sich das Backend fest vorgeben:

```bash
EVERYMOJI_BACKEND=wayland-wtype ./Everymoji-*.AppImage
# gueltige Werte: x11-xdotool | wayland-wtype | wayland-ydotool | clipboard-only
```

Der aktuell gewaehlte Modus steht jederzeit im Tray-Menue und im Tray-Tooltip.

## Globaler Hotkey

- **X11**: `Alt+E` blendet den Picker ein und aus — funktioniert sofort.
- **Wayland**: Aus Sicherheitsgruenden duerfen Apps dort meist keine globalen Hotkeys registrieren. Everymoji ist deshalb **single-instance**: startest du `everymoji` erneut, schaltet die bereits laufende Instanz den Picker um. Lege in deinen Tastatur-Einstellungen (COSMIC / GNOME) einfach eine Verknuepfung auf das Kommando `everymoji` an.

## Bedienung

- **Klick** waehlt ein Emoji aus, **Doppelklick** sendet es direkt.
- **Rechtsklick** auf ein Emoji schaltet es als Favorit an/aus.
- `/` springt in die Suche, `Esc` leert sie.
- Kategorien, Favoriten und zuletzt verwendete Emojis oben umschaltbar.
- Hautton-Auswahl bei unterstuetzten Emojis.
- Mehrere Themes inklusive Accessibility-Varianten (oben rechts durchschalten).

## Warum es existiert

Viele kleine Tools loesen ein Problem technisch, aber fuehlen sich dabei komplett seelenlos an. Everymoji sollte das Gegenteil werden: eine schlanke App, die leicht wirkt, schnell reagiert und trotzdem sichtbar mit Liebe gebaut wurde.

Nicht ueberladen. Nicht generisch. Nicht "auch noch ein Tool".

Sondern etwas, das man oeffnet und sofort merkt: Das hier wurde fuer echte Nutzung gemacht.

## Entwicklung

### Voraussetzungen

- Node.js 20+
- npm
- Linux, wenn du die native Einfuege-Funktion direkt testen willst (unter Windows/macOS laesst sich die UI per `npm run dev` ansehen, das Einfuegen selbst braucht aber X11/Wayland-Werkzeuge)

### Installation

```bash
npm install
```

### Entwicklungsmodus

```bash
npm run dev
```

### Typecheck

```bash
npm run typecheck
```

### Linux-Build

```bash
npm run build:linux
```

Das erzeugt AppImage und .deb im `dist`-Ordner. Der Build laeuft auf Linux (oder in der GitHub-Action auf `ubuntu-latest`); AppImage/.deb lassen sich nicht sinnvoll unter Windows erzeugen.

## Stack

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- `xdotool` / `wtype` / `ydotool` fuer die native Linux-Einfuege-Integration

## Projektgedanke

Everymoji ist aus dem Wunsch entstanden, etwas Kleines zu bauen, das sich erstaunlich gut anfuehlt. Kein riesiges Produktversprechen, kein unnoetiger Overhead, sondern ein fokussiertes Tool mit Charakter, Tempo und einer klaren Idee.

Wenn jemand die App startet, ein Emoji in Sekunden findet und es ohne Reibung genau dort landet, wo es hin soll, dann ist das Ziel erreicht.

Und wenn man dabei noch ein kleines bisschen merkt, dass hier Herz drinsteckt, dann umso besser.

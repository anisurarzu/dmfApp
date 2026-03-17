# dmfApp

A React Native (Expo) app for **Android** and **iOS**.

## Prerequisites

- **Node.js** 18+ (recommended: 20.x). Upgrade if you see engine warnings.
- **Android**: Android Studio and an emulator or physical device with USB debugging.
- **iOS** (macOS only): Xcode and an iOS simulator or device.
- **Expo Go** (optional): Install [Expo Go](https://expo.dev/go) on your device to run the app without building.

## Setup

```bash
cd dmfApp
npm install   # if you haven't already
```

---

## How to run on this PC (development)

### 1. Start the dev server (do this first)

From the project folder:

```bash
npm start
```

A terminal will open with a QR code and options. Keep this running.

---

### 2. Run on a physical Android device

**Option A – Easiest: Expo Go (no cable needed)**

1. Install **Expo Go** from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Connect your phone and this PC to the **same Wi‑Fi**.
3. With `npm start` running, open Expo Go on the phone and **scan the QR code** shown in the terminal (or enter the URL it shows).
4. The app loads on your device.

**Option B – USB (emulator or device)**

1. **Emulator:** Install [Android Studio](https://developer.android.com/studio), create an AVD (Android Virtual Device), then with `npm start` running press **`a`** in the terminal, or run:
   ```bash
   npm run android
   ```
2. **Physical device:** Enable [USB debugging](https://developer.android.com/studio/debug/dev-options) on the phone, connect via USB, then press **`a`** or run `npm run android`. The app will install and open on the device.

---

### 3. Run on a physical iOS device (macOS only)

**Option A – Easiest: Expo Go (no cable needed)**

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779).
2. Connect your iPhone and this Mac to the **same Wi‑Fi**.
3. With `npm start` running, open the **Camera** app on the iPhone and **scan the QR code** from the terminal (or open the link in Safari).
4. Choose “Open in Expo Go”. The app loads on your device.

**Option B – Simulator (no device needed)**

1. Install **Xcode** from the Mac App Store.
2. With `npm start` running, press **`i`** in the terminal, or run:
   ```bash
   npm run ios
   ```
   This opens the iOS Simulator and runs the app.

**Option C – Physical iPhone via Xcode**

1. Connect the iPhone with a USB cable.
2. In Xcode: **Window → Devices and Simulators**, select your device.
3. Run `npm run ios` (or press `i` after `npm start`). When prompted, pick your connected device instead of a simulator.

---

### Quick reference

| Target              | Command / action |
|---------------------|------------------|
| Start dev server    | `npm start`      |
| Android (emulator/device) | `npm run android` or press `a` |
| iOS (simulator/device)    | `npm run ios` or press `i` |
| Physical device (easiest) | Install Expo Go → same Wi‑Fi → scan QR code |

**Troubleshooting**

- **“Unable to resolve module”** → Run `npm install` again in `dmfApp`.
- **Phone doesn’t load app** → Ensure phone and PC are on the same Wi‑Fi; try turning off VPN.
- **Android device not found** → Enable USB debugging and accept the “Allow USB debugging?” prompt on the phone.
- **iOS: “Could not connect to development server”** → Same Wi‑Fi as Mac; in Expo Go you can manually enter the URL shown in the terminal (e.g. `exp://192.168.1.x:8081`).

---

## Run the app (summary)

**Start the dev server:**

```bash
npm start
```

Then:

- **Android**: Press `a` in the terminal, or run `npm run android` (requires Android Studio / emulator or device).
- **iOS**: Press `i` in the terminal, or run `npm run ios` (macOS + Xcode only).
- **Expo Go**: Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Build for production

- **Android (APK/AAB):** Use [EAS Build](https://docs.expo.dev/build/introduction/) or run `npx expo prebuild` then build with Android Studio.
- **iOS:** Use EAS Build or run `npx expo prebuild` then open the `ios` folder in Xcode and archive.

## Project structure

- `App.js` – Root component
- `app.json` – Expo config (name, slug, icons, splash)
- `assets/` – Icons and splash images

## Node version

If you see "Unsupported engine" warnings, upgrade Node to 18 or 20:

```bash
nvm install 20
nvm use 20
```

Then run `npm install` again in `dmfApp`.

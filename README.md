# 📝 Todo App (React Native + Convex)

A mobile Todo app with full CRUD functionality using Convex for real-time data sync.

## 🚀 Features
- Add, edit, delete, and mark todos complete/incomplete
- Real-time updates via Convex
- Search, filter, and drag/sort
- Empty states, loading indicators, and proper error handling 
- Smooth dark/light theme switching
- Responsive UI and accessible design on all screen sizes  
- Pixel-perfect UI and smooth animations  

## 🧠 Tech Stack
- **React Native (Expo)**
- **Convex** (Backend & Real-time sync)
- **AsyncStorage** 
- **Expo EAS Build** (For APK generation)

## ⚙️ Setup Instructions
```bash
git clone https://github.com/michycipher/todo-react-native.git
cd todo-convex-app
npm install
npx expo start

## 🔧 Environment Variables

# This creates a .env file in your root directory
EXPO_PUBLIC_CONVEX_URL=<your-convex-url>

# This creates a convex/ folder where you define your backend functions for:

Creating todos
Fetching todos
Updating (edit/toggle complete)
Deleting todos

# 🧩 Run the Project Locally
npx expo start

- Scan the QR code in your terminal using Expo Go App on your Android/iOS device.

# Build an APK (Android)

- We used Expo EAS Build to generate the APK.
- **npx expo login**
- **npx eas build:configure**
- **wait for the build to be done (7-15mins)**
- **npx eas build -p android --profile preview**

# When the build completes, you’ll get a download link (e.g. Expo dashboard).
📦 APK Download: https://expo.dev/accounts/michuo/projects/todo-mobile-app/builds/02341ed8-2dca-4724-818f-84a407f66ef5


📦 project-root
├── app/                   # Screen & # Main pages
│   ├──_layout.tsx  
│   ├── about.tsx          #empty page
│   └──index.tsx           # Main pages (Home, Edit, AddTodo)
├── convex/                # Convex backend functions
├── assets/                # Images, icons                
├── package.json
├── .env
└── README.md

### 🧪 Testing & Demo Video

- 🎥 Demo Video (Google Drive): https://drive.google.com/demo-link

- 🧾 APK File (Google Drive): https://drive.google.com/apk-link

## 🎥 In the video:

- Show adding, editing, and deleting todos

- Demonstrate real-time updates

- Toggle between light/dark themes

- Explain briefly how Convex handles real-time data


| Command                    | Description                |
| -------------------------- | -------------------------- |
| `npx expo start`           | Run app in development     |
| `npx eas build -p android` | Build APK for Android      |
| `npx convex dev`           | Start local Convex backend |
| `npx convex deploy`        | Deploy Convex to cloud     |


# Enjoy!
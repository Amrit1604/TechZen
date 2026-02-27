# TechZen Frontend - Quick Start Guide

## Complete Installation Steps

### 1. Install Dependencies
```bash
cd "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend"
npm install
```

### 2. Copy All CSS Files (Windows Command Prompt)
```cmd
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\stylesindex.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\Index.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\styleshome.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\Home.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\stylenews.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\News.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\stylegad.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\Gadgets.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\styleai.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\AI.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\styleselling.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\Selling.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\stylechat.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\Chatbot.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\styleAbout.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\AboutUs.css" /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\css\ContactUs.css" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\src\styles\ContactUs.css" /Y
```

### 3. Copy All Assets
```cmd
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\img-vid" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\public\img-vid" /E /I /Y
xcopy "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\public\uploads" "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend\public\uploads" /E /I /Y
```

### 4. Create .env file
Create file: `frontend/.env`
```
VITE_API_URL=http://localhost:8081
```

### 5. Start Development Server
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## 🎯 What's Already Done

✅ Project Configuration
✅ TypeScript Setup
✅ Vite Build Configuration
✅ React Router Setup
✅ Type Definitions (User, Product, Cart, etc.)
✅ API Service Layer (Complete)
✅ Auth Context (Login/Signup/Logout)
✅ Login Page (Fully Functional)
✅ Navbar Component (Responsive)
✅ Footer Component
✅ Global Styles

## 📋 What You Need to Complete

See the main README.md for the complete list of remaining page components to create.

## 🚀 Running Both Backend and Frontend

### Terminal 1 - Backend
```bash
cd "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro"
node server.js
```
Backend: http://localhost:8081

### Terminal 2 - Frontend
```bash
cd "e:\DESKTOP FOLDERS\BACKEND 4TH SEM\backendpro\frontend"
npm run dev
```
Frontend: http://localhost:3000

## 🧪 Test the App

1. Open http://localhost:3000
2. Click "LOGIN/SIGNUP"
3. Create an account
4. Login
5. You should be redirected to /home

## 🎨 Page Component Template

Use this template for creating new pages:

```typescript
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/[PageName].css';

const [PageName]: React.FC = () => {
  return (
    <div className="[page-name]-page">
      <Navbar isHomePage={false} showAuthButtons={false} />
      
      {/* Your page content here */}
      <main className="main-content">
        <h1>Page Title</h1>
      </main>
      
      <Footer />
    </div>
  );
};

export default [PageName];
```

Happy coding! 🎉

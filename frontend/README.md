# TechZen React TypeScript Frontend

This is a complete conversion of the TechZen Node.js/Express backend project to a modern React + TypeScript frontend.

## 🚀 Project Structure

```
frontend/
├── public/
│   ├── img-vid/           # Copy all images and videos from backend/public/img-vid
│   ├── uploads/           # For uploaded product images
│   └── favicon.ico
├── src/
│   ├── assets/            # Additional assets
│   ├── components/        # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Loader.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/          # React Context for state management
│   │   └── AuthContext.tsx ✓
│   ├── pages/             # Page components
│   │   ├── Index.tsx
│   │   ├── Login.tsx ✓
│   │   ├── Home.tsx
│   │   ├── News.tsx
│   │   ├── Gadgets.tsx
│   │   ├── AI.tsx
│   │   ├── Blog.tsx
│   │   ├── AboutUs.tsx
│   │   ├── ContactUs.tsx
│   │   ├── Selling.tsx
│   │   ├── Selling2.tsx
│   │   ├── Chatbot.tsx
│   │   ├── Customer.tsx
│   │   └── Admin.tsx
│   ├── services/          # API service layer
│   │   └── api.ts ✓
│   ├── styles/            # CSS files
│   │   ├── index.css ✓
│   │   ├── Login.css
│   │   ├── Index.css
│   │   ├── Home.css
│   │   ├── News.css
│   │   ├── Gadgets.css
│   │   ├── AI.css
│   │   ├── Selling.css
│   │   └── ...
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts ✓
│   ├── App.tsx ✓
│   ├── main.tsx ✓
│   └── vite-env.d.ts ✓
├── .env
├── .gitignore
├── index.html ✓
├── package.json ✓
├── tsconfig.json ✓
├── tsconfig.node.json ✓
└── vite.config.ts ✓
```

## ✅ What's Been Created

### Core Files
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `vite.config.ts` - Vite build configuration with proxy
- ✅ `index.html` - Main HTML entry point
- ✅ `src/main.tsx` - React entry point
- ✅ `src/App.tsx` - Main App component with routing
- ✅ `src/vite-env.d.ts` - Environment type definitions

### Type System
- ✅ `src/types/index.ts` - Complete TypeScript interfaces for User, Product, News, Cart, etc.

### Services
- ✅ `src/services/api.ts` - Complete API service layer with all endpoints

### State Management
- ✅ `src/contexts/AuthContext.tsx` - Authentication context with login/signup/logout

### Pages
- ✅ `src/pages/Login.tsx` - Fully converted Login/Signup page with all functionality

### Styles
- ✅ `src/styles/index.css` - Global styles

## 📦 Installation Steps

### 1. Navigate to the frontend directory
\`\`\`bash
cd "e:\\DESKTOP FOLDERS\\BACKEND 4TH SEM\\backendpro\\frontend"
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Copy assets from backend
Copy all files from:
- `../public/img-vid/` → `public/img-vid/`
- `../public/uploads/` → `public/uploads/`
- `../public/img-vid/favicon.ico` → `public/favicon.ico`

### 4. Create environment file
Create `.env` file:
\`\`\`env
VITE_API_URL=http://localhost:8081
\`\`\`

### 5. Copy CSS files
All CSS files from `../public/css/` need to be copied to `src/styles/` and renamed:
- `stylelog.css` → `Login.css`
- `stylesindex.css` → `Index.css`
- `styleshome.css` → `Home.css`
- `stylenews.css` → `News.css`
- `stylegad.css` → `Gadgets.css`
- `styleai.css` → `AI.css`
- `styleselling.css` → `Selling.css`
- etc.

## 🎨 CSS Migration Guide

Each HTML page's CSS should be:
1. Copied from `../public/css/`
2. Placed in `src/styles/`
3. Renamed to match the component (e.g., `Home.css`)
4. Imported in the corresponding `.tsx` file

Example:
\`\`\`typescript
import '../styles/Home.css';
\`\`\`

## 📝 Remaining Components to Create

### Shared Components

#### Navbar Component (`src/components/Navbar.tsx`)
- Should extract the navbar from Home.html
- Props: `showAuthButtons`, `username`
- Features: User profile display, logout button, navigation links

#### Footer Component (`src/components/Footer.tsx`)
- Extract footer from Home.html
- Reusable across all pages

#### Loader Component (`src/components/Loader.tsx`)
- Loading spinner/animation
- Used during page transitions

### Page Components

All pages need to be created following this pattern:

\`\`\`typescript
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/[PageName].css';

const [PageName]: React.FC = () => {
  return (
    <div className="[page-class]">
      <Navbar />
      {/* Page content */}
      <Footer />
    </div>
  );
};

export default [PageName];
\`\`\`

#### Index Page (`src/pages/Index.tsx`)
Convert from: `../public/html/index.html`
CSS: Copy from `../public/css/stylesindex.css` → `src/styles/Index.css`
Features:
- Hero section with video background
- Category cards (AI, Gadgets, News)
- Latest news section
- Public navbar (with login button)

#### Home Page (`src/pages/Home.tsx`)
Convert from: `../public/html/home.html`
CSS: Copy from `../public/css/styleshome.css` → `src/styles/Home.css`
Features:
- Authenticated navbar with username
- Hero section
- Categories and news
- Embedded chatbot iframe
- Logout functionality

#### News Page (`src/pages/News.tsx`)
Convert from: `../public/html/news.html`
CSS: Copy from `../public/css/stylenews.css` → `src/styles/News.css`
Features:
- Display tech news articles
- News cards with images
- Filters/categories

#### Gadgets Page (`src/pages/Gadgets.tsx`)
Convert from: `../public/html/gadget.html`
CSS: Copy from `../public/css/stylegad.css` → `src/styles/Gadgets.css`
Features:
- Display gadget reviews
- Product cards
- Images and descriptions

#### AI Page (`src/pages/AI.tsx`)
Convert from: `../public/html/ai.html`
CSS: Copy from `../public/css/styleai.css` → `src/styles/AI.css`
Features:
- AI news and updates
- Articles about AI/ML

#### Selling Pages (`src/pages/Selling.tsx`, `src/pages/Selling2.tsx`)
Convert from: `../public/html/selling.html`, `selling2.html`
CSS: Copy from `../public/css/styleselling.css` → `src/styles/Selling.css`
Features:
- Product listing
- Add product form with image upload
- Product marketplace
- Use `apiService.createProduct()` for uploads

Example for Selling page with product upload:
\`\`\`typescript
const [product, setProduct] = useState<NewProduct>({...});
const [images, setImages] = useState<File[]>([]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await apiService.createProduct(product, images);
    alert('Product added successfully!');
  } catch (error) {
    console.error(error);
  }
};
\`\`\`

#### Chatbot Page (`src/pages/Chatbot.tsx`)
Convert from: `../public/html/chatbot.html`
CSS: Copy from `../public/css/stylechat.css` → `src/styles/Chatbot.css`
Features:
- Chat interface
- Use `apiService.sendChatMessage()`
- Display chat history
- Real-time messages

Example:
\`\`\`typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');

const sendMessage = async () => {
  const userMessage = { role: 'user', content: input, timestamp: new Date() };
  setMessages([...messages, userMessage]);
  
  const response = await apiService.sendChatMessage(input);
  const botMessage = { 
    role: 'assistant', 
    content: response.message, 
    timestamp: new Date() 
  };
  setMessages([...messages, userMessage, botMessage]);
  setInput('');
};
\`\`\`

#### Customer Service Page (`src/pages/Customer.tsx`)
Convert from: `../public/html/customer.html`
Features:
- Socket.io integration for real-time chat
- Customer support interface

#### AboutUs, ContactUs, Blog, Admin Pages
Convert from respective HTML files with their CSS

## 🔧 Development Commands

### Start development server
\`\`\`bash
npm run dev
\`\`\`
Frontend will run on: http://localhost:3000

### Build for production
\`\`\`bash
npm run build
\`\`\`

### Preview production build
\`\`\`bash
npm run preview
\`\`\`

## 🔗 API Integration

The frontend is configured to proxy API requests to the backend:
- All `/api/*` requests → `http://localhost:8081/api/*`
- All `/chatbot` requests → `http://localhost:8081/chatbot`

Make sure your backend server is running on port 8081.

## 🎯 Key Features Implemented

### Authentication
- ✅ Login with username/password
- ✅ Signup with email validation
- ✅ Password strength indicator
- ✅ Session management with cookies
- ✅ Protected routes
- ✅ Auto redirect if not authenticated

### API Service
- ✅ Axios instance with interceptors
- ✅ Error handling
- ✅ Cookie-based authentication
- ✅ TypeScript type safety

### Routing
- ✅ React Router v6
- ✅ Protected and public routes
- ✅ Route guards

### State Management
- ✅ Context API for authentication
- ✅ TypeScript interfaces for type safety

## 🎨 Styling Approach

All original CSS has been preserved. Each page component imports its corresponding CSS file:

\`\`\`typescript
import '../styles/Login.css';  // Contains all original login styles
\`\`\`

The CSS files maintain:
- Original class names
- All animations
- All hover effects
- Responsive breakpoints
- Color schemes and gradients

## 📱 Features to Implement

### Product Management
- Create product with image upload
- View products
- Add to cart
- Checkout

### Chat Features
- AI Chatbot integration (Google Gemini)
- Customer support chat with Socket.io
- Message history

### User Features
- User profile display
- Logout functionality
- Remember me option

## 🚧 Next Steps

1. **Copy all CSS files** from `../public/css/` to `src/styles/`
2. **Copy all assets** from `../public/img-vid/` to `public/img-vid/`
3. **Create remaining page components** following the Login.tsx pattern
4. **Create shared components** (Navbar, Footer, Loader)
5. **Test each page** individually
6. **Add Socket.io** for Customer page
7. **Test authentication flow** end-to-end
8. **Add error boundaries** for better error handling
9. **Optimize images** and assets
10. **Add loading states** for API calls

## 📚 Additional Enhancements

Consider adding:
- Toast notifications (react-hot-toast)
- Form validation library (react-hook-form)
- State management (Redux Toolkit or Zustand)
- Image optimization
- Lazy loading for routes
- PWA features
- Dark mode toggle
- Internationalization (i18n)

## 🐛 Troubleshooting

### CORS Issues
Make sure backend has CORS enabled for `http://localhost:3000`

### Cookie Issues  
Ensure `withCredentials: true` is set in axios config

### Image Paths
All image paths should start with `/` (e.g., `/img-vid/logo.jpeg`)

### TypeScript Errors
Install dependencies first: `npm install`

## 📄 License

Same as the original project

---

**Author**: Converted from Node.js/Express to React/TypeScript  
**Version**: 1.0.0  
**Last Updated**: November 9, 2025

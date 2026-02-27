# TutorAI Frontend Migration Plan: Django Templates → React

## Executive Summary
Migrate the frontend from Django templates (HTML/CSS/JS) to a modern React Single Page Application (SPA) while maintaining 100% of existing functionality and keeping the Django backend completely unchanged.

## Current Architecture Analysis

### Backend (Unchanged)
- **Framework**: Django with Django REST Framework
- **API Endpoints**:
  - `POST /api/upload-pdf/` - PDF upload and text extraction
  - `POST /api/ask-ai/` - AI tutor chat with optional PDF context
- **Authentication**: Firebase Auth (client-side)
- **Database**: Firestore for user data

### Current Frontend (To be migrated)
- **Templates**: 4 HTML files (index.html, courses.html, tutor.html, profile.html)
- **Styling**: Single CSS file (style.css)
- **JavaScript**: Modular ES6 files
  - `firebase.js` - Firebase initialization
  - `auth.js` - Authentication logic
  - `chat.js` - AI tutor chat functionality
  - `courses.js` - Course browsing
  - `profile.js` - User profile management
  - `timer.js` - Focus timer (Pomodoro)
  - `utils.js` - Utility functions
- **Features**:
  - Firebase Auth (Email/Password + Google)
  - Dark/Light theme toggle
  - AI chat with PDF context
  - Course catalog
  - User profile editing
  - Responsive design

## Migration Strategy

### Phase 1: Project Setup ✅
1. Initialize React + TypeScript + Vite project
2. Install dependencies (react-router-dom, firebase)
3. Configure build tools and TypeScript
4. Set up folder structure

### Phase 2: Core Infrastructure ✅
1. Create Firebase configuration
2. Implement AuthContext for state management
3. Implement ThemeContext for dark/light mode
4. Create Layout component with navigation
5. Set up React Router

### Phase 3: Page Components ✅
1. **Home Page**: Hero section, features, course preview, CTA
2. **Courses Page**: Course grid, search, expandable details
3. **Tutor Page**: Chat interface, PDF upload, message history
4. **Profile Page**: User info, editable form, statistics

### Phase 4: Styling Migration ✅
1. Convert CSS to component-friendly structure
2. Maintain CSS variables for theming
3. Preserve all animations and transitions
4. Ensure mobile responsiveness

### Phase 5: Integration & Testing ⏳
1. Configure API proxy for Django backend
2. Test all functionality:
   - Authentication flows
   - AI chat with and without PDF
   - PDF upload and processing
   - Profile updates
   - Theme switching
   - Navigation

### Phase 6: Production Build ⏳
1. Configure Django to serve React static files
2. Set up CORS headers
3. Build and deploy

## Component Mapping

| Original File | React Component | Location |
|--------------|-----------------|----------|
| index.html | Home page | `src/pages/Home.tsx` |
| courses.html | Courses page | `src/pages/Courses.tsx` |
| tutor.html | Tutor page | `src/pages/Tutor.tsx` |
| profile.html | Profile page | `src/pages/Profile.tsx` |
| firebase.js | Firebase config | `src/firebase/config.ts` |
| auth.js | AuthContext + AuthModal | `src/contexts/AuthContext.tsx` + `src/components/AuthModal.tsx` |
| chat.js | Tutor page (chat logic) | Integrated in `src/pages/Tutor.tsx` |
| courses.js | Courses page | Integrated in `src/pages/Courses.tsx` |
| profile.js | Profile page | Integrated in `src/pages/Profile.tsx` |
| timer.js | Timer component | To be added as component |
| utils.js | Utility functions | Integrated in components |

## API Integration

All API calls remain unchanged:

```typescript
// PDF Upload
const formData = new FormData();
formData.append('pdf', file);
const response = await fetch('/api/upload-pdf/', {
  method: 'POST',
  body: formData,
});

// AI Chat
const response = await fetch('/api/ask-ai/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: userMessage,
    pdfContext: pdfContext
  }),
});
```

## State Management

Using React Context for global state:

1. **AuthContext**: User authentication state, login/logout methods
2. **ThemeContext**: Current theme (light/dark), toggle method

Local state managed with useState in components for:
- Form inputs
- Chat messages
- UI toggles (modals, menus)

## Routing Structure

```
/           → Home page
/courses    → Courses page
/tutor      → Tutor page (protected)
/profile    → Profile page (protected)
```

## Styling Architecture

- **global.css**: CSS variables, animations, utility classes
- **components.css**: Component-specific styles organized by section
- CSS Modules not needed as styles are scoped by class naming

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Functionality loss | Comprehensive testing checklist |
| API breakage | Keep exact same request/response format |
| Auth issues | Use same Firebase configuration |
| Styling differences | Pixel-perfect CSS migration |
| Performance | Use React best practices, lazy loading |

## Testing Checklist

### Authentication
- [ ] Email/password registration
- [ ] Email/password login
- [ ] Google sign-in
- [ ] Logout
- [ ] Protected route redirection
- [ ] Profile data persistence

### AI Tutor
- [ ] Send text messages
- [ ] Receive AI responses
- [ ] Upload PDF files
- [ ] Chat with PDF context
- [ ] Clear PDF context
- [ ] Typing indicators
- [ ] Message timestamps

### Courses
- [ ] Display all courses
- [ ] Search/filter courses
- [ ] Expand course details
- [ ] Course selection

### Profile
- [ ] Display user info
- [ ] Edit profile
- [ ] Save changes to Firestore
- [ ] Cancel edit mode
- [ ] Form validation

### UI/UX
- [ ] Dark mode toggle
- [ ] Light mode toggle
- [ ] Mobile navigation
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Smooth animations
- [ ] Scroll to top button

## Implementation Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Project Setup | 30 min | ✅ Complete |
| 2. Core Infrastructure | 1 hour | ✅ Complete |
| 3. Page Components | 2 hours | ✅ Complete |
| 4. Styling | 1 hour | ✅ Complete |
| 5. Integration & Testing | 1 hour | ⏳ In Progress |
| 6. Production Build | 30 min | ⏳ Pending |

## Next Steps

1. ✅ Create all React components
2. ✅ Migrate all styles
3. ⏳ Configure Vite proxy for API calls
4. ⏳ Test complete user flows
5. ⏳ Build production version
6. ⏳ Configure Django for production serving

## Success Criteria

- [ ] All 4 pages render correctly
- [ ] All original functionality works
- [ ] No console errors
- [ ] Responsive on all screen sizes
- [ ] Dark/light theme works
- [ ] API calls succeed
- [ ] Authentication flows work
- [ ] Performance is equal or better

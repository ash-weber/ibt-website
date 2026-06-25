# Component Library - Client Side

Optimized, red-themed component library matching the admin (frontend) design patterns. All components use CSS variables for theming and are fully typed with TypeScript.

## 🎨 Theme

Red theme with CSS variables in `app/globals.css`:
- **Primary Color**: `#e02525` (red)
- **Primary Strong**: `#c51d1d` (dark red)
- **Primary Soft**: `#fee2e2` (light red)
- **Danger**: `#dc2626` (red)
- **Neutral**: `#374151` (gray)
- **Surface**: `#ffffff` (white)
- **Muted**: `#6b7280` (gray text)

## 📁 Folder Structure

```
src/
├── components/           # All UI components
│   ├── ActionButton.tsx  # Multi-intent button component
│   ├── Input.tsx         # Text input with password toggle
│   ├── Textarea.tsx      # Multi-line text area
│   ├── Checkbox.tsx      # Checkbox input
│   ├── Badge.tsx         # Status/tag badges
│   ├── Modal.tsx         # Accessible modal dialog
│   ├── Toast.tsx         # Toast notifications
│   ├── Loader.tsx        # Loading spinner
│   └── index.ts          # Central exports
├── utils/
│   └── cx.ts            # className composition utility
├── types/
│   └── ui.ts            # Shared UI type definitions
```

## 📦 Components

### ActionButton
Multi-intent button component with built-in icons and loading states.

**Props:**
- `intent`: 'save' | 'update' | 'delete' | 'cancel' | 'primary' | 'secondary' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean
- `confirmDestructive`: boolean (shows confirmation for delete)

```tsx
<ActionButton intent="save" onClick={handleSave}>
  Save Changes
</ActionButton>

<ActionButton intent="delete" confirmDestructive loading>
  Delete
</ActionButton>
```

### Input
Forwardable text input with label, error states, and password toggle.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `startIcon`: ReactNode
- `endIcon`: ReactNode
- `showPasswordToggle`: boolean
- `type`: 'text' | 'email' | 'password' | etc.

```tsx
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  helperText="We'll verify this address"
/>
```

### Textarea
Multi-line text area with label and error support.

```tsx
<Textarea
  label="Message"
  placeholder="Your message..."
  rows={4}
  helperText="Optional"
/>
```

### Checkbox
Accessible checkbox with label and error states.

```tsx
<Checkbox
  label="I agree to terms"
  error={errors.terms}
/>
```

### Badge
Status badge component with 5 variants.

**Variants:** 'primary' | 'danger' | 'neutral' | 'success' | 'warning'

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="danger">Error</Badge>
```

### Modal
Full-featured modal with keyboard navigation and focus management.

**Props:**
- `isOpen`: boolean
- `title`: string
- `onClose`: () => void
- `children`: ReactNode
- `footer`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnOverlayClick`: boolean
- `closeOnEsc`: boolean

```tsx
<Modal
  isOpen={isOpen}
  title="Confirm Action"
  onClose={handleClose}
  footer={
    <>
      <ActionButton intent="cancel" onClick={handleClose}>
        Cancel
      </ActionButton>
      <ActionButton intent="save" onClick={handleConfirm}>
        Confirm
      </ActionButton>
    </>
  }
>
  Are you sure?
</Modal>
```

### Toast
Toast notifications with auto-dismiss and variants.

**Props:**
- `open`: boolean
- `onClose`: () => void
- `variant`: 'success' | 'error'
- `title`: string
- `message`: string
- `durationMs`: number (default: 3600)

```tsx
<Toast
  open={toastOpen}
  onClose={() => setToastOpen(false)}
  variant="success"
  title="Success!"
  message="Operation completed"
  durationMs={3000}
/>
```

### Loader
Loading spinner with inline and fullscreen modes.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | number
- `label`: string
- `fullscreen`: boolean
- `className`: string

```tsx
// Inline
<Loader size="md" label="Loading..." />

// Fullscreen
<Loader fullscreen label="Loading Data..." />
```

## 🎯 Usage

### Import Components

```tsx
import { ActionButton, Input, Modal } from '@/src/components'
```

### TypeScript Support

All components are fully typed for excellent IDE support:

```tsx
import type { ActionIntent, ComponentSize, LoaderSize } from '@/src/types/ui'
```

### CSS Variables

Access theme colors via CSS variables:

```css
background-color: var(--ui-primary);
color: var(--ui-text);
border-color: var(--ui-border);
```

## 🎨 Component Showcase

View all components and examples at `/components` route:

```bash
npm run dev
# Visit http://localhost:3000/components
```

## ✨ Key Features

- **Red Theme**: Consistent red color scheme with CSS variables
- **Optimized**: Minimal re-renders, efficient component structure
- **Accessible**: Full keyboard support, ARIA labels, focus management
- **TypeScript**: Fully typed for type safety
- **Forwardable**: Support for `forwardRef` on inputs
- **Admin-like**: Matching design patterns from frontend (admin) folder
- **Feather Icons**: Clean icon integration with react-icons

## 🔧 Patterns & Best Practices

### Component Organization
- Utilities in `src/utils/`
- Types in `src/types/`
- Components in `src/components/`
- Showcase at `/components` route

### Styling
- CSS variables for theming
- Tailwind CSS for utility classes
- No hardcoded colors

### Component Pattern
```tsx
import { useRef, useState } from 'react'
import { cx } from '../utils/cx'

type ComponentProps = {
  // Props...
} & HTMLAttributes<HTMLElement>

export const Component = forwardRef<HTMLElement, ComponentProps>(
  function Component({ /* props */ }, ref) {
    // Implementation
  }
)

Component.displayName = 'Component'
```

## 🚀 Next Steps

1. **Integrate with Pages**: Use components in page templates
2. **Add More Components**: Extend with Select, Pagination, etc.
3. **API Integration**: Connect to `/api/public/v1/*` endpoints
4. **Socket.IO Client**: Implement real-time settings updates

## 📚 Resources

- [Frontend Admin Components](../../frontend/src/component/)
- [Admin Design System](../../frontend/src/index.css)
- [UI Types](src/types/ui.ts)
- [Utilities](src/utils/cx.ts)

## 💡 Tips

- Always use the `cx` utility for className composition
- Use CSS variables for theming consistency
- Leverage forwardRef for direct DOM access
- Test components on `/components` route before use
- Keep components focused and composable

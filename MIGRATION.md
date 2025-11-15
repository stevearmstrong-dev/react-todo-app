# TypeScript Migration Guide

This document tracks the migration of Zentask from JavaScript to TypeScript.

## Migration Status

### ✅ Completed

- [x] **TypeScript Configuration**
  - `tsconfig.json` - Main TypeScript configuration
  - `tsconfig.node.json` - Vite configuration

- [x] **Type Definitions**
  - `src/types.ts` - Shared types (Task, TimeData, Priority, Recurrence, etc.)

- [x] **Core Files**
  - `src/index.tsx` - Entry point (upgraded to React 18 createRoot API)
  - `src/services/supabase.ts` - Supabase service with full type safety

- [x] **Example Component**
  - `src/components/TimeTracker.tsx` - Demonstrates component migration pattern

### 🚧 Remaining Work

The following files still need to be migrated from `.js` to `.tsx`:

#### Main App
- [ ] `src/App.js` → `src/App.tsx`

#### Components
- [ ] `src/components/Auth/SignIn.js` → `.tsx`
- [ ] `src/components/Auth/SignUp.js` → `.tsx`
- [ ] `src/components/Auth/PasswordReset.js` → `.tsx`
- [ ] `src/components/CalendarPicker.js` → `.tsx`
- [ ] `src/components/CategoryPicker.js` → `.tsx`
- [ ] `src/components/Dashboard.js` → `.tsx`
- [ ] `src/components/EisenhowerMatrix.js` → `.tsx`
- [ ] `src/components/Greeting.js` → `.tsx`
- [ ] `src/components/Onboarding.js` → `.tsx`
- [ ] `src/components/PomodoroTimer.js` → `.tsx`
- [ ] `src/components/PriorityPicker.js` → `.tsx`
- [ ] `src/components/QuickAddTasks.js` → `.tsx`
- [ ] `src/components/RecurrencePicker.js` → `.tsx`
- [ ] `src/components/ReminderPicker.js` → `.tsx`
- [ ] `src/components/Sidebar.js` → `.tsx`
- [ ] `src/components/TimePicker.js` → `.tsx`
- [ ] `src/components/ToDo.js` → `.tsx`
- [ ] `src/components/ToDoForm.js` → `.tsx`
- [ ] `src/components/TodayView.js` → `.tsx`
- [ ] `src/components/VoiceInput.js` → `.tsx`

## Migration Pattern

Follow this pattern when migrating components (see `TimeTracker.tsx` as example):

### 1. Add Props Interface

```typescript
// Before (JavaScript)
function MyComponent({ prop1, prop2, onAction }) {
  // ...
}

// After (TypeScript)
interface MyComponentProps {
  prop1: string;
  prop2: number;
  onAction: (id: number) => void;
}

function MyComponent({ prop1, prop2, onAction }: MyComponentProps) {
  // ...
}
```

### 2. Type State Variables

```typescript
// Before
const [count, setCount] = useState(0);
const [tasks, setTasks] = useState([]);

// After
const [count, setCount] = useState<number>(0);
const [tasks, setTasks] = useState<Task[]>([]);
```

### 3. Type Function Parameters

```typescript
// Before
const handleClick = (id) => {
  // ...
};

// After
const handleClick = (id: number): void => {
  // ...
};
```

### 4. Import Types

```typescript
import { Task, Priority, TimeData } from '../types';
```

### 5. Handle Optional Properties

Use optional chaining and non-null assertions carefully:

```typescript
// Good - optional chaining
if (task.trackingStartTime && task.isTracking) {
  const elapsed = Date.now() - task.trackingStartTime;
}

// When you're certain it exists
const elapsed = Date.now() - task.trackingStartTime!;
```

## Common Type Patterns

### Task-related Components

```typescript
interface TaskComponentProps {
  task: Task;
  toggleComplete: (id: number) => void;
  deleteTask: (id: number) => void;
  editTask: (id: number, updates: Partial<Task>) => void;
}
```

### Picker Components

```typescript
interface PickerProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  onClose?: () => void;
}
```

### Event Handlers

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};
```

## Testing After Migration

After migrating each component:

1. **Build the project**: `npm run build`
2. **Check for type errors**: TypeScript will report any issues
3. **Test in dev mode**: `npm run dev`
4. **Verify functionality**: Test the component works as expected

## Benefits of TypeScript

Once migration is complete, you'll have:

- ✅ **Compile-time error detection** - Catch bugs before runtime
- ✅ **Better IDE support** - IntelliSense, autocomplete, refactoring
- ✅ **Self-documenting code** - Types serve as inline documentation
- ✅ **Safer refactoring** - TypeScript shows all affected files
- ✅ **Better team collaboration** - Clear contracts between components

## Migration Strategy

**Recommended approach**: Migrate components incrementally

1. Start with leaf components (components that don't import other components)
2. Work your way up to parent components
3. Finish with `App.tsx`

**Priority order**:
1. Picker components (CalendarPicker, CategoryPicker, etc.) - no dependencies
2. Display components (Greeting, ToDo, etc.) - minimal dependencies
3. Complex components (Dashboard, PomodoroTimer, etc.)
4. Main App.tsx - depends on all components

## Notes

- The app will work with mixed `.js` and `.tsx` files during migration
- Vite supports both JavaScript and TypeScript simultaneously
- No need to migrate everything at once
- Focus on getting one component working before moving to the next

## Questions?

If you encounter TypeScript errors during migration:
1. Check the error message carefully
2. Refer to `src/types.ts` for available types
3. Look at migrated components (TimeTracker.tsx, supabase.ts) for patterns
4. TypeScript documentation: https://www.typescriptlang.org/docs/

---

**Current Status**: 🚧 Migration in progress (3/20+ files migrated)
**Next Step**: Continue migrating components following the pattern above

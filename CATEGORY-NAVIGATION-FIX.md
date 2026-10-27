# Category navigation fix

When a user is inside any tool page and clicks a category in the sidebar, the app now navigates to the home tool library and displays that selected category. The user no longer needs to press the browser Back button first. Selecting a tool from that category then opens it normally.

Changed: `src/components/app-shell.tsx`
- Uses Next.js `useRouter`.
- `chooseCategory` navigates to `/` only when the user is currently on a tool route.
- Keeps the selected category in React state and session storage.

Validation: source change applied. Run `npm.cmd run typecheck` and `npm.cmd run build` in the extracted project to verify locally.

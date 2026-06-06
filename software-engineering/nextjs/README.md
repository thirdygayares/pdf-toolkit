# Next.js Project Architecture Standard

This document defines the standard folder structure and coding rules for a Next.js project.

The goal is to keep the project clean, scalable, and easy to maintain.

## What is this called?

This style is called a **Feature-Based Layered Architecture**.

It is also close to:

- Feature-based architecture
- Layered frontend architecture
- Clean Architecture-inspired frontend structure
- Separation of concerns

The main idea is simple:

```txt
page.tsx
  -> hooks
  -> services
  -> api client / backend
```

Components should focus on UI. They should not call APIs directly.

---

## Main Rules

### 1. Services call the backend

Services are responsible for HTTP requests.

Use services for:

- Axios calls
- API endpoints
- Request payload mapping
- Response mapping
- Backend communication

Services should not handle UI logic.

### 2. Hooks call services

Hooks are responsible for data fetching, mutation, loading state, error state, and cache logic.

Use hooks for:

- `useQuery`
- `useMutation`
- Calling service functions
- Query invalidation
- Loading and error handling

Hooks should not render UI.

### 3. Pages call hooks

Pages are responsible for connecting data to the UI.

Use pages for:

- Calling hooks
- Handling page-level state
- Passing data to components
- Passing event handlers to components

### 4. Components do not call services or API hooks

Components should be reusable and easy to test.

Components should:

- Receive data through props
- Receive event handlers through props
- Render UI
- Handle small local UI state only

Components should not:

- Call Axios directly
- Call service functions directly
- Call feature API hooks directly, unless the component is clearly a container component

---

## Standard Folder Structure

```txt
src/
  app/
    feature1/
      page.tsx
    feature2/
      page.tsx

  services/
    api/
      axios.ts
      endpoints.ts

    feature1/
      fetchFeature1.service.ts
      fetchFeature1ById.service.ts
      createFeature1.service.ts
      updateFeature1.service.ts
      deleteFeature1.service.ts

    feature2/
      fetchFeature2.service.ts
      fetchFeature2ById.service.ts
      createFeature2.service.ts
      updateFeature2.service.ts
      deleteFeature2.service.ts

  hooks/
    feature1/
      useFetchFeature1.ts
      useFetchFeature1ById.ts
      useCreateFeature1.ts
      useUpdateFeature1.ts
      useDeleteFeature1.ts

    feature2/
      useFetchFeature2.ts
      useFetchFeature2ById.ts
      useCreateFeature2.ts
      useUpdateFeature2.ts
      useDeleteFeature2.ts

  components/
    ui/
      button.tsx
      input.tsx
      dialog.tsx
      table.tsx

    layout/
      Header.tsx
      Sidebar.tsx
      Footer.tsx

    feature1/
      Feature1PageContent.tsx
      Feature1Section.tsx
      Feature1Table.tsx
      Feature1Form.tsx
      DeleteFeature1Dialog.tsx

    feature2/
      Feature2PageContent.tsx
      Feature2Section.tsx
      Feature2Table.tsx
      Feature2Form.tsx
      DeleteFeature2Dialog.tsx

  types/
    feature1.types.ts
    feature2.types.ts

  constants/
    queryKeys.ts
    routes.ts

  lib/
    utils.ts
```

---

## Data Flow Standard

Use this flow for all backend-based features:

```txt
User Action
  -> Component event
  -> Page handler
  -> Hook
  -> Service
  -> Axios
  -> Backend
```

Example:

```txt
User clicks Delete
  -> DeleteFeature1Dialog calls onConfirm()
  -> page.tsx calls delete hook
  -> useDeleteFeature1 calls deleteFeature1.service.ts
  -> service calls DELETE /feature1/:id
```

---

## Layer Responsibilities

## App Layer

Location:

```txt
src/app/
```

Purpose:

- Routing
- Page files
- Layout files
- Loading files
- Error files
- Metadata

Good examples:

```txt
src/app/users/page.tsx
src/app/users/[id]/page.tsx
src/app/layout.tsx
src/app/loading.tsx
src/app/error.tsx
```

Page files should be thin.

Good:

```tsx
"use client";

import { UsersPageContent } from "@/components/users/UsersPageContent";
import { useFetchUsers } from "@/hooks/users/useFetchUsers";

export default function UsersPage() {
  const usersQuery = useFetchUsers();

  return <UsersPageContent usersQuery={usersQuery} />;
}
```

Avoid putting too much business logic inside `page.tsx`.

---

## Services Layer

Location:

```txt
src/services/
```

Purpose:

- Backend API calls
- Axios requests
- Endpoint handling
- Request and response mapping

Services should be plain async functions.

Example:

```ts
// src/services/users/fetchUsers.service.ts

import { api } from "@/services/api/axios";
import type { User } from "@/types/user.types";

export async function fetchUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/users");
  return response.data;
}
```

Example with params:

```ts
// src/services/users/fetchUsers.service.ts

import { api } from "@/services/api/axios";
import type { User } from "@/types/user.types";

export type FetchUsersParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function fetchUsers(params: FetchUsersParams): Promise<User[]> {
  const response = await api.get<User[]>("/users", { params });
  return response.data;
}
```

Example delete service:

```ts
// src/services/users/deleteUser.service.ts

import { api } from "@/services/api/axios";

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
```

---

## API Client Standard

Location:

```txt
src/services/api/axios.ts
```

Example:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Optional interceptor:

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Use interceptors only when needed.

---

## Hooks Layer

Location:

```txt
src/hooks/
```

Purpose:

- Call services
- Manage data fetching
- Manage mutations
- Manage loading state
- Manage error state
- Invalidate queries

Example fetch hook:

```ts
// src/hooks/users/useFetchUsers.ts

import { useQuery } from "@tanstack/react-query";
import { fetchUsers, type FetchUsersParams } from "@/services/users/fetchUsers.service";
import { queryKeys } from "@/constants/queryKeys";

export function useFetchUsers(params: FetchUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
  });
}
```

Example delete hook:

```ts
// src/hooks/users/useDeleteUser.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/services/users/deleteUser.service";
import { queryKeys } from "@/constants/queryKeys";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
}
```

---

## Components Layer

Location:

```txt
src/components/
```

Purpose:

- Render UI
- Receive data through props
- Receive actions through props
- Keep UI clean and reusable

### UI Components

Location:

```txt
src/components/ui/
```

Use this for base UI components:

- Button
- Input
- Dialog
- Table
- Badge
- Card
- Select

These should be reusable across the whole project.

### Layout Components

Location:

```txt
src/components/layout/
```

Use this for:

- Header
- Footer
- Sidebar
- Navbar
- AppShell

### Feature Components

Location:

```txt
src/components/users/
```

Use this for feature-specific UI.

Example:

```tsx
// src/components/users/UsersTable.tsx

import type { User } from "@/types/user.types";

type UsersTableProps = {
  users: User[];
  onDelete: (userId: string) => void;
};

export function UsersTable({ users, onDelete }: UsersTableProps) {
  return (
    <table>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              <button onClick={() => onDelete(user.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

The component receives `users` and `onDelete` from props.

It does not call the service directly.

---

## Page Content Component Pattern

For complex pages, use a `PageContent` component.

Example:

```txt
src/app/users/page.tsx
src/components/users/UsersPageContent.tsx
```

Page:

```tsx
"use client";

import { UsersPageContent } from "@/components/users/UsersPageContent";
import { useFetchUsers } from "@/hooks/users/useFetchUsers";
import { useDeleteUser } from "@/hooks/users/useDeleteUser";

export default function UsersPage() {
  const usersQuery = useFetchUsers({ page: 1, limit: 10 });
  const deleteUserMutation = useDeleteUser();

  return (
    <UsersPageContent
      users={usersQuery.data ?? []}
      isLoading={usersQuery.isLoading}
      error={usersQuery.error}
      onDelete={(userId) => deleteUserMutation.mutate(userId)}
    />
  );
}
```

Page content:

```tsx
import type { User } from "@/types/user.types";
import { UsersTable } from "@/components/users/UsersTable";

type UsersPageContentProps = {
  users: User[];
  isLoading: boolean;
  error: unknown;
  onDelete: (userId: string) => void;
};

export function UsersPageContent({
  users,
  isLoading,
  error,
  onDelete,
}: UsersPageContentProps) {
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return <UsersTable users={users} onDelete={onDelete} />;
}
```

---

## Naming Standard

## Services

Use this pattern:

```txt
verb + feature + .service.ts
```

Examples:

```txt
fetchUsers.service.ts
fetchUserById.service.ts
createUser.service.ts
updateUser.service.ts
deleteUser.service.ts
```

## Hooks

Use this pattern:

```txt
use + Verb + Feature.ts
```

Examples:

```txt
useFetchUsers.ts
useFetchUserById.ts
useCreateUser.ts
useUpdateUser.ts
useDeleteUser.ts
```

## Components

Use PascalCase.

Examples:

```txt
UsersPageContent.tsx
UsersTable.tsx
UserForm.tsx
DeleteUserDialog.tsx
```

## Types

Use this pattern:

```txt
feature.types.ts
```

Examples:

```txt
user.types.ts
product.types.ts
order.types.ts
```

---

## Query Keys Standard

Location:

```txt
src/constants/queryKeys.ts
```

Example:

```ts
export const queryKeys = {
  users: {
    all: ["users"] as const,
    list: (params?: unknown) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
};
```

Do not hardcode query keys in every hook.

Bad:

```ts
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

Better:

```ts
useQuery({
  queryKey: queryKeys.users.all,
  queryFn: fetchUsers,
});
```

---

## Routes Standard

Location:

```txt
src/constants/routes.ts
```

Example:

```ts
export const routes = {
  home: "/",
  users: "/users",
  userDetail: (id: string) => `/users/${id}`,
};
```

Use this when routes are reused in many files.

---

## Types Standard

Location:

```txt
src/types/
```

Example:

```ts
// src/types/user.types.ts

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;
```

Types should be shared by services, hooks, pages, and components.

---

## Form Standard

For forms, keep the form UI in components.

The page or container handles submit logic.

Example:

```tsx
// src/components/users/UserForm.tsx

import type { CreateUserPayload } from "@/types/user.types";

type UserFormProps = {
  onSubmit: (payload: CreateUserPayload) => void;
  isSubmitting?: boolean;
};

export function UserForm({ onSubmit, isSubmitting }: UserFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSubmit({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <input name="email" />
      <button disabled={isSubmitting} type="submit">
        Save
      </button>
    </form>
  );
}
```

Page:

```tsx
const createUserMutation = useCreateUser();

<UserForm
  isSubmitting={createUserMutation.isPending}
  onSubmit={(payload) => createUserMutation.mutate(payload)}
/>
```

---

## Mutation Standard

For create, update, and delete:

- Use `useMutation`
- Put API call in service
- Invalidate affected query keys after success
- Keep toast handling near the page or hook, depending on project style

Example:

```ts
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.all,
      });
    },
  });
}
```

---

## Do and Do Not

## Do

- Keep `page.tsx` small
- Keep API calls in services
- Keep React Query inside hooks
- Keep UI components clean
- Pass data through props
- Use shared types
- Use query key constants
- Use route constants when needed
- Use one file per service action
- Use one file per hook action

## Do Not

- Do not call Axios inside components
- Do not call services directly inside UI components
- Do not put all APIs in one large file
- Do not put all hooks in one large file
- Do not put business logic inside UI components
- Do not hardcode query keys everywhere
- Do not mix feature logic inside `src/app` too much

---

## Example Complete Feature

Feature: Users

```txt
src/
  app/
    users/
      page.tsx

  services/
    users/
      fetchUsers.service.ts
      createUser.service.ts
      updateUser.service.ts
      deleteUser.service.ts

  hooks/
    users/
      useFetchUsers.ts
      useCreateUser.ts
      useUpdateUser.ts
      useDeleteUser.ts

  components/
    users/
      UsersPageContent.tsx
      UsersTable.tsx
      UserForm.tsx
      DeleteUserDialog.tsx

  types/
    user.types.ts
```

---

## When Components Can Call Hooks

Default rule: components should not call API hooks.

But there are exceptions.

A component can call hooks if it is a container component.

Example:

```txt
UsersPageContainer.tsx
```

Container components may:

- Call hooks
- Manage page-level logic
- Pass props to presentational components

Presentational components should not call API hooks.

Good split:

```txt
UsersPageContainer.tsx  -> can call hooks
UsersTable.tsx          -> props only
UserForm.tsx            -> props only
```

---

## Recommended Rule for This Project

Use this strict rule:

```txt
app/page.tsx calls hooks
hooks call services
services call backend
components receive props only
```

This is simple and easy to follow.

---

## Checklist Before Creating a New Feature

Before coding a new feature, create these files:

```txt
src/app/[feature]/page.tsx
src/services/[feature]/fetch[Feature].service.ts
src/hooks/[feature]/useFetch[Feature].ts
src/components/[feature]/[Feature]PageContent.tsx
src/types/[feature].types.ts
```

If the feature has create/update/delete, add:

```txt
src/services/[feature]/create[Feature].service.ts
src/services/[feature]/update[Feature].service.ts
src/services/[feature]/delete[Feature].service.ts

src/hooks/[feature]/useCreate[Feature].ts
src/hooks/[feature]/useUpdate[Feature].ts
src/hooks/[feature]/useDelete[Feature].ts
```

---

## Final Standard

Use this as the project standard:

```txt
src/app        -> routes and pages
src/services   -> backend API calls
src/hooks      -> data hooks and mutation hooks
src/components -> UI only
src/types      -> shared TypeScript types
src/constants  -> query keys, routes, fixed values
src/lib        -> reusable utilities
```

This keeps the code clean, predictable, and easy to scale.

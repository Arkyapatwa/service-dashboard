
# Service Dashboard

This project is a Service Dashboard built with React and Vite, designed to monitor and manage various services. It leverages modern web technologies and state-of-the-art libraries to provide a responsive and efficient user experience.

## Tech Stack

-   **React**: A JavaScript library for building user interfaces.
-   **Vite**: A fast build tool that provides a lightning-fast development experience for modern web projects.
-   **TypeScript**: A superset of JavaScript that adds static types, enhancing code quality and maintainability.
-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
-   **Shadcn/ui**: A collection of re-usable components built using Radix UI and Tailwind CSS, providing beautiful and accessible UI primitives.
-   **@tanstack/react-query**: A powerful data-fetching library for React, enabling efficient caching, synchronization, and server state management.
-   **Zustand**: A small, fast, and scalable bear-bones state-management solution for React.
-   **MSW (Mock Service Worker)**: An API mocking library that intercepts network requests, allowing for robust development and testing without a real backend.

## Features

1.  **Live Service Status**: Services are automatically pinged and their status updated every 15 seconds without requiring a page refresh, thanks to `@tanstack/react-query`'s `refetchInterval` and `refetchOnWindowFocus` capabilities.
2.  **Service Management (CRUD)**: Seamlessly add, update, and delete services through intuitive modal dialogs. All data operations are handled efficiently using `@tanstack/react-query` mutations, ensuring optimistic updates and proper cache invalidation.
3.  **Service History Details**: Detailed event history for each service is fetched and displayed using `@tanstack/react-query`'s `useInfiniteQuery` hook, allowing for efficient loading of large datasets as the user scrolls.
4.  **Filtering and Searching**: Comprehensive filtering and searching capabilities are implemented for both the main service list and service history details. This is achieved by passing dynamic parameters to the `getServices` and `getServiceEvents` API calls.
5.  **State Management**: Application-wide state, particularly for managing modal open/close states, is efficiently handled using Zustand, providing a lightweight and performant solution.

## Local Setup

To get this project up and running on your local machine, follow these steps:

### 1. Clone the Repository

First, clone the project from its Git repository:

```bash
git clone https://github.com/Arkyapatwa/service-dashboard.git
```

### 2. Navigate to Project
```bash
cd service-dashboard
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize MSW (Mock Service Worker)
```bash
npx msw init public/
```

### 5. Start the Development Server
```bash
npm run dev
```

Visit http://localhost:8080 to view the app.

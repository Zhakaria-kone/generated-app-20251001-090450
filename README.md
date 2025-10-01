# Alsam Seminar Concierge

[![Cloudflare Deploy](https://deploy.workers.cloudflare.com/button)]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Zhakaria-kone/generated-app-20251001-090127))

Alsam Seminar Concierge is a sophisticated, minimalist web application designed for a 4-star hotel to streamline the management of seminar attendees, with a primary focus on an efficient breakfast service check-in process. The application provides a centralized dashboard for hotel staff to manage seminars, register attendees, and monitor breakfast attendance in real-time.

The core feature is a rapid check-in interface for restaurant staff, allowing them to verify an attendee's details by room number and mark their breakfast as taken with a single click. The system also includes robust administrative tools for managing seminar and attendee data, including manual entry and bulk import from Excel. Finally, it offers powerful reporting capabilities, allowing staff to generate and export daily attendance lists in PDF or Excel formats for accounting and logistical purposes.

## Key Features

-   **Seminar Management**: Create, view, update, and delete seminars.
-   **Attendee Management**: Manually add or bulk import attendees from Excel files.
-   **Rapid Breakfast Check-in**: A streamlined interface for restaurant staff to quickly check in guests by room number.
-   **Real-Time Tracking**: Instantly view lists of attendees who have been served and who are still pending.
-   **Dynamic Filtering**: Filter attendee lists by seminar for focused views.
-   **Reporting & Exporting**: Generate and export daily attendance reports to PDF or Excel.
-   **Minimalist & Luxurious UI**: A clean, modern interface designed to match a 4-star hotel's brand.

## Technology Stack

-   **Frontend**:
    -   [React](https://react.dev/)
    -   [Vite](https://vitejs.dev/)
    -   [React Router](https://reactrouter.com/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [Shadcn/UI](https://ui.shadcn.com/)
    -   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    -   [Framer Motion](https://www.framer.com/motion/) for animations
    -   [Lucide React](https://lucide.dev/) for icons
-   **Backend**:
    -   [Hono](https://hono.dev/) running on Cloudflare Workers
-   **Storage**:
    -   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for consistent, stateful storage.
-   **Tooling**:
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Bun](https://bun.sh/)

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the React frontend application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the Hono backend application code, including API routes and entity logic for interacting with Durable Objects.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and the backend to ensure type safety.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/docs/installation) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd alsam_seminar_concierge
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

### Running the Development Server

To start the local development server, which includes both the Vite frontend and the Wrangler server for the backend, run:

```bash
bun dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will be available for API requests.

## Development Scripts

-   `bun dev`: Starts the local development server.
-   `bun build`: Builds the frontend application for production.
-   `bun lint`: Lints the codebase to check for errors.
-   `bun deploy`: Builds and deploys the application to Cloudflare Workers.

## Deployment

This application is designed to be deployed to the Cloudflare network.

### Manual Deployment

1.  **Build the application:**
    ```bash
    bun build
    ```

2.  **Deploy using Wrangler:**
    Make sure you are logged into your Cloudflare account via the Wrangler CLI.
    ```bash
    bun deploy
    ```

### One-Click Deployment

You can also deploy this project directly to your Cloudflare account by clicking the button below.

[![Cloudflare Deploy](https://deploy.workers.cloudflare.com/button)]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Zhakaria-kone/generated-app-20251001-090127))
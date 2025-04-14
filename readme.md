# Book Review System API

A RESTful API built with Node.js, Express, TypeScript, TypeORM, and MySQL for managing users, authors, books, and reviews. Includes authentication, validation, and API documentation via Swagger/OpenAPI.

## Features

*   User Registration & JWT Authentication (USER/ADMIN roles)
*   CRUD operations for Books (Admin only for CUD)
*   CRUD operations for Authors (Admin only for CUD)
*   CRUD operations for Reviews (Authenticated users for Create, Owners/Admin for Update/Delete)
*   Input validation using Zod
*   API documentation using Swagger UI, generated from OpenAPI 3.0 YAML files.
*   Database migrations using TypeORM.
*   SQL seeding script for initial data.

## Technology Stack

*   **Backend Framework:** Express.js
*   **Language:** TypeScript
*   **ORM:** TypeORM
*   **Database:** MySQL
*   **Authentication:** JSON Web Tokens (JWT) using `jsonwebtoken`
*   **Validation:** Zod
*   **Password Hashing:** Bcrypt
*   **API Documentation:** OpenAPI 3.0 (defined in YAML), Swagger UI Express, Swagger Parser (`@apidevtools/swagger-parser`)
*   **Linting/Formatting:** ESLint, Prettier (Setup assumed based on previous steps)

## Prerequisites

*   Node.js (v16 or newer recommended)
*   npm (usually comes with Node.js) or yarn
*   MySQL Server (v5.7 or newer recommended)
*   A MySQL client (e.g., MySQL Workbench, DBeaver, `mysql` CLI)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd book-review-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or: yarn install
    ```

## Configuration

1.  **Create Environment File:**
    Create a `.env` file in the root of the project. You can copy `.env.example` if one exists, or create it from scratch.

2.  **Set Environment Variables:**
    Add the following variables to your `.env` file and adjust the values according to your local setup:

    ```dotenv
    # Server Configuration
    PORT=3000

    # Database Configuration (Adjust for your MySQL setup)
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=your_db_user  # Replace with your MySQL username
    DB_PASSWORD=your_db_password # Replace with your MySQL password
    DB_DATABASE=book_review_db # The database name the app will use

    # JWT Configuration
    JWT_SECRET=your_very_strong_secret_key_please_change_me # IMPORTANT: CHANGE THIS to a long, random, secure string
    JWT_EXPIRES_IN=1d # Example: token expires in 1 day (e.g., 1h, 7d)

    # Node Environment (Optional: controls logging, etc.)
    # NODE_ENV=development
    ```

3.  **IMPORTANT Security Notes:**
    *   **NEVER** commit your `.env` file to Git. Ensure `.env` is listed in your `.gitignore` file.
    *   The `JWT_SECRET` **must** be kept secret and should be a long, complex, random string in production.

## Database Setup

1.  **Create Database:**
    Ensure the MySQL database specified in `DB_DATABASE` (e.g., `book_review_db`) exists on your MySQL server. You can create it using a MySQL client:
    ```sql
    CREATE DATABASE book_review_db;
    -- Or use the name you specified in .env
    ```

2.  **Run Migrations:**
    TypeORM migrations define the database schema based on the entities. Run the following command to apply all pending migrations:
    ```bash
    npm run migration:run
    ```
    *(This command executes `typeorm-ts-node-commonjs -d src/config/data-source.ts migration:run`)*

3.  **Seed Database (Optional):**
    An SQL script (`seed.sql`) is provided to populate the database with initial sample data (users, authors, books, reviews).
    *   **Important:** The script contains pre-hashed passwords for `password123`. You might need to regenerate the hash using the included `generateHash.js` script (`node generateHash.js`) and update the `@password_hash` variable in `seed.sql` if the placeholder hash doesn't work for login.
    *   Run the seeding script using your MySQL client:
        ```bash
        # Example using mysql CLI:
        mysql -u your_db_user -p book_review_db < seed.sql
        ```
        *(Replace `your_db_user` and `book_review_db` with your actual username and database name)*

## Running the Application

1.  **Development Mode:**
    Starts the server using `ts-node-dev` for automatic restarts on file changes. Ideal for development.
    ```bash
    npm run dev
    ```
    The API will typically be available at `http://localhost:3000` (or the port specified in `.env`).

2.  **Production Mode:**
    Builds the TypeScript code into JavaScript and then starts the server.
    ```bash
    # 1. Build the project
    npm run build

    # 2. Start the server
    npm start
    ```

## API Documentation (Swagger)

This API uses OpenAPI 3.0 for documentation, served via Swagger UI. The specification is defined in YAML files located in the `/docs` directory, providing a clear separation from the application code.

*   **Access Swagger UI:** Once the server is running, navigate to:
    `http://localhost:<PORT>/api-docs` (e.g., `http://localhost:3000/api-docs`)
*   **Raw OpenAPI Spec:** The fully resolved OpenAPI JSON specification can be accessed at:
    `http://localhost:<PORT>/api-docs.json`

The Swagger UI provides:
*   A list of all available API endpoints.
*   Details on request parameters, headers, and request/response body schemas.
*   The ability to try out API endpoints directly from your browser (use the "Authorize" button to add your JWT for protected routes).

## API Endpoints Overview

All API routes are prefixed with `/api/v1`. Please refer to the **Swagger UI documentation at `/api-docs`** for a complete and interactive list of endpoints, required parameters, request bodies, and response examples.

Key resource groups include:
*   `/auth`: User registration and login.
*   `/authors`: Author management (Admin restricted for write operations).
*   `/books`: Book management (Admin restricted for write operations).
*   `/reviews`: Review management (Authentication required, specific authorization for updates/deletes).

## Linting and Formatting

*   **Check for linting/formatting errors:**
    ```bash
    npm run lint
    ```
*   **Automatically fix fixable errors:**
    ```bash
    npm run lint:fix
    ```
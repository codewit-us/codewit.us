# codewit.us roadmap

This document provides a "roadmap" to help developers navigate the organization of both the code and the website's features.

## Front-end

The `codewit/client` directory contains the react app that drives the front-end.

#### Tailwind Styling Configurations

- All styling configurations for Tailwind are located under `codewit/client/src/tailwind.config.js`

#### Website Icon/Logos

- The site icon, or favicon, which appears in the browser tab, is located under the `codewit/client/public/` directory alongside the logo and hexicon.

## App.tsx

- App.tsx is a file that contains all of the routes of our front-end using react-router. It is located under `codewit/client/src/app/app.tsx`.
  #### Current URLS
  - `/` -> Navigates to Home Page
  - `/read/:uid` -> Navigates to Read Page (Shows Demo)
  - `/create/...` -> Navigates to Create Page and various items
  - `/usermanagement` -> Admin only page to allow users to be promoted/demoted to and from Admin
  - `/dashboard` -> For Teacher to view their class progress
  - `*` -> Intercepts All Other URLS and displays Error Page

## Home Page

- Located at `codewit/client/src/pages/home.tsx`, the Home Page is currently WIP as progress is made.

## Nav

- Located at `codewit/client/src/componenets/nav.tsx`. It is reponsible for holding the login/logout button, but also navigation to various portions of the site.

## App

- Located at `codewit/client/src/app/app.tsx`. It is responsible for handling login / logout logic, which is passed down to the Navbar.

## Read Page

- Located at `codewit/client/src/pages/read.tsx`, the Read Page showcases the full details of a demo. Users can arrive at this page by selecting a demo on the Home Page or directly via the `/read/:uid` URL, where `uid` corresponds to the demo's unique identifier.
- **Functionality**:
  - **Parsing**: Parses `uid` from the URL to fetch the corresponding demo details.
  - **Display**: Displays comprehensive demo content, including video, exercises, and progress tracking.
- **Components**:
  - **VideoUI Components** (`<VideoPlayer />`, `<VideoHeader />`, `<AuthorTags />`, `<HelpfulLinks />`, `<RelatedDemos />`): For displaying the demo's video content, title, author information, helpful resources, and related demos.
    - Components Located under `../components/videoui/`
  - **CodeBlock Components** (`<Exercises />`, `<CodeBlock />`, `<Progress />`, `<CheckList />`): For presenting associated exercises, an interactive code editor, a progress bar, and a checklist for tracking user progress.
    - Components Located under `../components/codeblock/`

## Create Page

- **Location**: `codewit/client/src/pages/create.tsx`. The Create Page is designed to display both Forms using React Router's `Links` & `Outlets`, enabling the display for `<DemoForm />`, `<ExerciseForm />`, `<ModuleForm />`,`<CourseForm />`,`<ResourceForm />`.
- **Functionality**:
  - **Navigation Between Forms**: Provides users the ability to navigate between the Create Demo, Exercise, Module, Course, and Resource Forms using a dashboard located on the left-hand side of the page. Page is hidden if the user is not an admin and also not signed in.
  - **Creating/Editing/Deleting Forms**: Allows users to create new instances of forms, edit existing ones, and delete them as needed.
- **Components**:
  - **DemoForm (`<DemoForm />`)**: This component is responsible for rendering the form used for creating and editing demo information. It encapsulates all the necessary fields and functionalities, including input fields for demo details and submission controls.
  - **ExerciseForm (`<ExerciseForm />`)**: This component is responsible for rendering the page used for creating editing, and deleting courses. It features a Markdown Editor for inputting exercise prompts and other necessary fields and functionalities to create exercises.
  - **CourseForm (`<CourseForm />`)**: This component is responsible for rendering the page used for creating editing, and deleting courses. It encapsulates all the necessary fields and functionalities, including input fields for course details and submission controls.
  - **ModuleForm (`<ModuleForm />`)**: This component is responsible for rendering the page used for creating editing, and deleting modules. It encapsulates all the necessary fields and functionalities, including input fields for module details and submission controls.
  - **ResourceForm (`<ResourceForm />`)**: This component is responsible for rendering the page used for creating editing, and deleting resources. It encapsulates all the necessary fields and functionalities, including input fields for resource details and submission controls.
    - All pages are located under the same directory as the Create Page and use components located under `../components/form/` to render various inputs/fields
    - API calls for these forms are located under `codewit/client/src/hooks`

## User Management page

- **Location**: `codewit/client/src/pages/usermanagement.tsx`.
- **Functionality**:
  - The User Management page is supposed to allow **admin** users to promote other users to admins as well
  - URL is also hidden if the user is not an admin or is not signed in.

## Dashboard

- **Location**: `codewit/client/src/pages/course/TeacherView.tsx`.
- **Functionality**:
  - This page is for Teacher's only to view their current classes Progress

## Back-end

The `codewit/api` directory contains the express back-end.

### main.ts

- `main.ts` contains the router for our backend APIs that uses Express's router. It is located at `codewit/api/src/main.ts`.

  **Current routes**

  - `/demos` - for creating, reading, updating, and deleting demos.
  - `/exercises` - for creating, reading, updating, and deleting exercises.
  - `/courses` - for creating, reading, updating, and deleting courses.
  - `/attempts` - for creating and managing exercise attempts.
  - `/auth` - for authentication-related routes, including Google OAuth.
  - `/modules` - for creating, reading, updating, and deleting modules.
  - `/resources` - for managing resources.
  - `/users` - for user-related endpoints.

### models

- The `codewit/api/src/models` directory contains the models for the database. These are essentially the schemas for the tables in the database.

  **Current models**

  - `attempt.ts` - tracks users' attempts at solving exercises, including:
    - Timestamp of the attempt.
    - Associated exercise ID.
    - User ID.
    - Submission number.
    - Submitted code.
  - `course.ts` - represents courses available for users.
  - `demo.ts` - represents demos in the database.
  - `exercise.ts` - represents exercises in the database.
  - `index.ts` - initializes Sequelize and defines relationships between models.
  - `language.ts` - represents languages available for demos, exercises, and courses.
  - `module.ts` - represents modules that organize demos or resources.
  - `resource.ts` - represents additional resources associated with modules or users.
  - `tag.ts` - represents tags used for categorizing demos or exercises.
  - `user.ts` - represents users in the database, including admin and Google OAuth fields.

### controllers

- The `codewit/api/src/controllers` directory contains the controllers for the routes. These have methods for creating, reading, updating, and deleting rows of corresponding tables in the database and are called by the routes.

  **Current controllers**

  - `attempt.ts` - handles submission of user attempts for exercises.
  - `course.ts` - manages course-related functionality, including instructors and student rosters.
  - `demo.ts` - for managing demos.
  - `exercise.ts` - for managing exercises.
  - `module.ts` - handles CRUD operations for modules.
  - `resource.ts` - handles resource CRUD operations and user associations.
  - `user.ts` - handles user-related logic, including fetching and updating user data.

### routes

- The `codewit/api/src/routes` directory defines the API endpoints, connecting them to their respective controllers.

  **Current routes**

  - `attempt.ts` - routes for submitting and managing exercise attempts.
  - `auth.ts` - routes for authentication, including Google OAuth.
  - `course.ts` - routes for managing courses.
  - `demo.ts` - routes for CRUD operations on demos.
  - `exercise.ts` - routes for CRUD operations on exercises.
  - `module.ts` - routes for managing modules.
  - `resource.ts` - routes for CRUD operations on resources.
  - `user.ts` - routes for managing user data.

### scripts

- The `codewit/api/src/scripts` directory contains utility scripts for database and admin management.

  **Current scripts**

  - `seed-admins.ts` - a script to seed the database with admin users.
    - Command-line options:
      - `--force` - resyncs the database schema.
      - `--admin <emails>` - accepts a list of admin emails to seed.
    - Usage:
      - See [README.MD](https://github.com/codewit-us/codewit.us/blob/main/README.md#admin-seeding)

### middleware

- The `codewit/api/src/middleware` directory contains middleware for handling authentication and admin checks.

  **Current middleware**

  - `auth.ts`:
    - `checkAuth` - redirects unauthenticated users to Google OAuth.
    - `checkAdmin` - ensures the user has admin privileges.

### auth/passport.ts

- Implements Google OAuth2 using the `passport-google-oauth20` strategy.
- Automatically creates or updates users with Google profile data.
- Serializes and deserializes user sessions based on their `uid`.

### lib/shared/validations

- The `codewit/lib/shared/validations/src/lib` directory contains validation schemas for the models. These are used to validate the data sent in the HTTP request body when creating or updating rows in the database. Interfaces are also exported for frontend use.

  **Current validation schemas**

  - `demo.ts` - for the demo validation schema.
  - `exercise.ts` - for the exercise validation schema.
  - `course.ts` - for the course validation schema.
  - `attempt.ts` - for the attempt validation schema.
  - `module.ts` - for the module validation schema.
  - `resource.ts` - for the resource validation schema.
  - `user.ts` - for the user validation schema.

### secrets.ts

- The `codewit/api/src/secrets.ts` file manages sensitive environment variables used in the backend.

  **Current secrets**

  - `HOST` - API host (default: `localhost`).
  - `PORT` - API port (default: `3000`).
  - `GOOGLE_CLIENT_ID` - Google client ID for OAuth.
  - `GOOGLE_CLIENT_SECRET` - Google client secret for OAuth.
  - `GOOGLE_REDIRECT_URL` - callback URL for Google OAuth.
  - `COOKIE_KEY` - key for securing cookies.
  - `FRONTEND_URL` - URL of the frontend application.
  - `REDIS_HOST` - Redis host for express session storage.
  - `REDIS_PORT` - Redis port for express session storage.

- The redis host and port are used for storing user sessions in Redis and is also utilized by codeeval to check whether the user is authenticated or not.

### CodeEval

The codeval implementation resides at [codewit-us/codeval](https://github.com/codewit-us/codeval) and is used to evaluate user-submitted code.

This **code execution server** uses Redis-based session authentication and provides an API endpoint (`POST /execute`) for running user-submitted code in Python, C++, or Java.

1. **Session Handling**: Users must be authenticated via Redis sessions.
2. **Code Execution**:
   - The submitted code is stored in a temporary directory.
   - If required, the code is compiled (C++ with `g++`, Java with `javac`).
   - The program is executed with optional `stdin`, and output is captured.
3. **Test Execution** (if enabled):
   - Python tests run with `pytest`, C++ with `CxxTest`, and Java with `JUnit`.
4. **Security & Cleanup**:
   - Execution is time-limited to prevent infinite loops.
   - Temporary files and directories are deleted after execution.

## Testing

The `codewit/client-e2e` directory contains our end-to-end tests using Cypress.

### Running Tests

- **Interactive Mode**: Run tests with Cypress Test Runner UI
  ```bash
  npm run test:gui   # Defined in package.json as "cd client-e2e && npx cypress open"
  ```
- **Headless Mode**: Run tests in command line
  ```bash
  npm run test       # Defined in package.json as "cd client-e2e && npx cypress run"
  ```

### Test Structure

- **E2E Tests**: Located in `client-e2e/src/e2e/`
  - `app.cy.ts` - Main test file containing core application tests
  - Additional test files can be added following the pattern `*.cy.ts`

### Test Utilities

- **Fixtures**: Located in `client-e2e/src/e2e/fixtures/`
  - Store static test data used across tests
  - Example: Mock user data, API responses
- **Support**: Located in `client-e2e/src/e2e/support/`
  - Contains custom commands and global configurations
  - Reusable test utilities and helper functions

### Helpful Resources

- **Cypress Documentation**:

  - [Getting Started Guide](https://docs.cypress.io/guides/getting-started/writing-your-first-test)
  - [Best Practices](https://docs.cypress.io/guides/references/best-practices)
  - [API Reference](https://docs.cypress.io/api/table-of-contents)

- **Testing Patterns**:
  - [Selecting Elements](https://docs.cypress.io/guides/references/best-practices#Selecting-Elements)
  - [Network Requests](https://docs.cypress.io/guides/guides/network-requests)
  - [Authentication Recipes](https://docs.cypress.io/guides/testing-strategies/google-authentication)

### Writing Tests

When writing new tests:

1. Place test files in `client-e2e/src/e2e/`
2. Use TypeScript for better type checking and IDE support
3. Follow the existing patterns in `app.cy.ts`
4. Group related tests using `describe` blocks
5. Use meaningful test descriptions that explain the expected behavior

Example test structure:

```typescript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup code that runs before each test
    cy.visit("/");
  });

  it("should perform expected behavior", () => {
    // Test implementation
  });
});
```

### CI/CD Integration

Tests are run as part of our continuous integration pipeline. Ensure all tests pass locally before pushing changes:

```bash
npm run test
```

### Things To Do

1. Like button on Frontend is still not integrated with backend since the backend does not return if user has liked video
2. Teacher only navigation for Dashboard

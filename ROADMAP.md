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
  - `/read/:uid` -> Navigates to Read Page
  - `/create` -> Navigates to Create Page Which Defaults to Create Demo
  - `/create/exercises` -> Navigates to Create Exercise Page
  - `*` -> Intercepts All Other URLS and displays Error Page

## Home Page
- Located at `codewit/client/src/pages/home.tsx`, the Home Page showcases demos in a responsive grid layout, directly accessible from the application's root URL as configured in `app.tsx`. This central page uses the `<Demos />` component, housed within `../components/demos/demos.tsx`, to render each demo's preview.
- **Functionality**:
  - **View Demo Details**: Clicking on a demo directs users to the detailed Read Page for that demo, facilitated by the `<Read />` component at `./read.tsx`.
  - **Edit Demo**: An edit button on each demo enables direct navigation to the Create Page with preloaded demo data for editing, indicated by an `isEditing` flag.
  - **Delete Demo**: Users can remove demos directly from the Home Page through a dedicated delete button, immediately updating the displayed list of demos.
- **Components**:
  - **Demos Component** (`<Demos />`): Responsible for displaying individual demos in a grid, each equipped with action buttons for editing, deleting, and viewing.
    - Component Located under `../components/demos/`
  
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
- **Location**: `codewit/client/src/pages/create.tsx`. The Create Page is designed to display both Forms using React Router's `Links` & `Outlets`, enabling the display for both the `<DemoForms />` and `<ExerciseForms />`.
- **Functionality**:
  - **Navigation Between Forms**: Provides users the ability to navigate between the Create Demo Form and Create Exercise Form using a dashboard located on the left-hand side of the page.
  - **Creating/Editing/Deleting Demos**: Users can input details like title, tags, language, YouTube video ID, and manage a list of exercises. Furthermore, users have the option to edit or delete existing demos.
  - **Creating/Editing/Deleting Exercises**: Users have the capability to input new exercises into a Markdown Editor, tags, and language. Furthermore, users have the option to edit or delete existing exercises.
- **Components**:
  - **DemoForms (`<DemoForms />`)**: This component is responsible for rendering the form used for creating and editing demo information. It encapsulates all the necessary fields and functionalities, including input fields for demo details and submission controls.
  - **ExerciseForms (`<ExerciseForms />`)**: Similar to `DemoForms`, this component focuses on managing exercises. It features a Markdown Editor for inputting exercise prompts, alongside functionalities for editing and deleting exercises.
    - Both components are located under the same directory as the Create Page.


## Back-end

The `codewit/api` directory contains the express back-end.

- **Postman Collection** at `codewit/api/codewit.postman_collection.json`

### main.ts

- main.ts contains the router for our backend apis that uses express's router. It is located at `codewit/api/src/main.ts`

  **Current routes**

  - /demos - for the creating, reading, updating, and deleting the demos
  - /exercises - for the creating, reading, updating, and deleting the exercises

### models

- The `codewit/api/src/models` directory contains the models for the database. These are essentially the schemas for the tables in the database.

  **Current models**

  - demo.ts - for the demo model
  - exercise.ts - for the exercise model

### controllers

- The `codewit/api/src/controllers` directory contains the controllers for the routes. These have methods for creating, reading, updating, and deleting the rows of corresponding tables in the database and are called by the routes.

  **Current controllers**

  - demo.ts - for the demo controller
  - exercise.ts - for the exercise controller

### routes

- The `codewit/api/src/routes` directory contains the routes for the controllers. These have the express routes that call the controller methods.

  **Current routes**

  - demo.ts - for the demo routes
  - exercise.ts - for the exercise routes

### lib/shared/validations

- The `codewit/lib/shared/validations/src/lib` directory contains the validation schemas for the models. These are used to validate the data sent in the http request body whenever we try to create/update rows in the db. We also export interfaces that can be used by the frontend for autocompletion and type checking.

  **Current validation schemas**

  - demo.ts - for the demo validation schema
  - exercise.ts - for the exercise validation schema

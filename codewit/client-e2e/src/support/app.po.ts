export const getGreeting = () => cy.get('h1');
export const getExercisePrompt = () => cy.get('[data-testid="prompt"]');

export const getTagSelect = () => cy.get('[id="tag-select"]');
export const getTopicSelect = () => cy.get('[id="single-tag-select"]');
export const getLanguageSelect = () => cy.get('[data-testid="language-select"]');
export const getNavBar = () => cy.get('[data-testid="navbar-toggle"]');
export const getResourceSelect = () => cy.get('[data-testid="resource-select"]')
export const getYoutubeIdInput = () => cy.get('[id="youtube_id"]');
export const getExerciseSelect = () => cy.get('div[id="exercise-select"]');
export const getTitleInput = () => cy.get('input[name="title"]').should('be.visible');
export const getExerciseReferenceTest = () => cy.get('.monaco-editor');
export const getUrlInput = () => cy.get('input[name="url"]').should('be.visible');
export const getSourceInput = () => cy.get('input[name="source"]').should('be.visible');

export const getModuleSelect = () => cy.get('[data-testid="module-select"]');
export const getInstructorSelect = () => cy.get('[data-testid="instructor-select"]');
export const getRosterSelect = () => cy.get('[data-testid="roster-select"]');

//read page
export const getDemoTitle = () => cy.get('[data-testid="title"]');
export const getLikeButton = () => cy.get('[data-testid="like-button"]');
export const getAuthorTags = () => cy.get('[data-testid="author-tags"]');
export const getRelatedDemos = () => cy.get('[data-testid="related-demos"]');
export const getHelpfulLinks = () => cy.get('[data-testid="helpful-links"]');
export const getCodeEditor = () => cy.get('[data-testid="code-editor"]');
export const getResetButton = () => cy.get('[data-testid="reset-button"]');
export const getSubmitButton = () => cy.get('[data-testid="submit-button"]');
export const getCheckList = () => cy.get('[data-testid="check-list"]');

export const getHomeModule = () => cy.get('[data-testid="module"]');
export const mockNonAdminUser = () => {
    cy.intercept('GET', '/oauth2/google/userinfo', {
      statusCode: 200,
      body: {
        user: {
          uid: 1,
          username: 'testuser',
          googleId: 'test-google-id',
          email: 'user@example.com',
          isAdmin: false,
        },
      },
    }).as('getUserInfo');
}; 
export const mockAdminUser = () => {
    cy.intercept('GET', '/oauth2/google/userinfo', {
      statusCode: 200,
      body: {
        user: {
          uid: 2,
          username: 'adminuser',
          googleId: 'admin-google-id',
          email: 'admin@example.com',
          isAdmin: true,
        },
      },
    }).as('getUserInfo');
};
export const mockStudentCourses = (googleId: string) => {
  cy.intercept('GET', `/courses/student/${googleId}`, {
    statusCode: 200,
    body: [
      {
        id: 'course-1',
        title: 'Intro to JavaScript',
        language: 'JavaScript',
        modules: [
          {
            uid: 1,
            topic: 'Getting Started',
            language: 'JavaScript',
            resources: [],
            demos: [
              {
                uid: 101,
                title: 'Variables 101',
                topic: 'Getting Started',
                youtube_id: 'DPnHjUvNwtc',
                youtube_thumbnail: 'https://img.youtube.com/vi/abc123/default.jpg',
                createdAt: '',
                updatedAt: '',
                likes: 10,
                exercises: [],
                tags: [],
                language: 'JavaScript',
                languageUid: 'js',
              }
            ],
          }
        ],
        instructors: [],
      }
    ],
  }).as('getStudentCourses');
};
export const mockEmptyStudentCourses = (googleId: string) => {
  cy.intercept('GET', `/courses/student/${googleId}`, {
    statusCode: 200,
    body: [],
  }).as('getStudentCourses');
}

export const interceptReadPage = () => {
  cy.intercept('GET', '/demos/1', {
    statusCode: 200,
    body: {
      "uid": 5,
      "title": "variable Demo 1",
      "topic": "variable",
      "tags": [
          "variable"
      ],
      "language": "cpp",
      "youtube_id": "XxBWL_ntnNE",
      "youtube_thumbnail": "https://i.ytimg.com/vi/XxBWL_ntnNE/maxresdefault.jpg",
      "exercises": [
          27
      ]
  },
  }).as('getReadPage');
}
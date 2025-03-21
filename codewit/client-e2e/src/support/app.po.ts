export const getGreeting = () => cy.get('h1');
export const getExercisePrompt = () => cy.get('[data-testid="prompt"]');
export const getSubmitButton = () => cy.get('button[type="submit"]');
export const getTagSelect = () => cy.get('[id="tag-select"]');
export const getTopicSelect = () => cy.get('[id="single-tag-select"]');
export const getLanguageSelect = () => cy.get('select[name="language"]');
export const getNavBar = () => cy.get('[data-testid="navbar-toggle"]');
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
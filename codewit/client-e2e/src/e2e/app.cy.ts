import {
  getTagSelect,
  getLanguageSelect,
  getExercisePrompt,
  getTopicSelect,
  getNavBar,
  mockNonAdminUser,
  mockAdminUser,
  mockStudentCourses,
  mockEmptyStudentCourses,
  getHomeModule,
  getResourceSelect,
  getModuleSelect,
  getInstructorSelect,
  getRosterSelect,
  getYoutubeIdInput,
  getExerciseSelect,
  getTitleInput,
  interceptReadPage,
  getDemoTitle,
  getLikeButton,
  getAuthorTags,
  getRelatedDemos,
  getHelpfulLinks,
  getCodeEditor,
  getResetButton,
  getSubmitButton,
  getCheckList,
} from '../support/app.po';

describe('Testing Home Page', () => {
  it('should render successfully', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should display sign in message and login button that points to Google', () => {
    cy.visit('/');

    cy.contains('Please Sign In').should('be.visible');

    // find the form and assert it has the correct action
    cy.get('form[action="http://localhost:3001/oauth2/google"]').should(
      'exist'
    );

    // find the input button and check its value
    cy.get('input[type="submit"]')
      .should('have.value', 'Log in')
      .and('be.visible');
  });

  it('displays loading screen initially', () => {
    cy.visit('/');

    cy.get('[data-testid="loading"]').should('exist');
  });

  it('navbar should have home link, and login with google button', () => {
    cy.visit('/');

    getNavBar().click();
    // home nav
    cy.contains('a', 'Home').should('be.visible').and('have.attr', 'href', '/');

    // google link
    cy.get('form[action="http://localhost:3001/oauth2/google"]').within(() => {
      cy.get('button')
        .should('contain.text', 'Log In with Google')
        .and('be.visible');
    });
  });

  it('error should show with bad course request', () => {
    mockNonAdminUser();
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.contains('400Error').should('be.visible');
    cy.contains('Failed to fetch courses. Please try again later.').should(
      'be.visible'
    );
  });

  it('show course with module on home page', () => {
    mockNonAdminUser();
    mockStudentCourses('test-google-id');
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.wait('@getStudentCourses');

    cy.contains('Intro to JavaScript').should('be.visible');
    cy.contains('JavaScript').should('be.visible');

    cy.contains('Choose a lesson:').should('be.visible');
    cy.contains('Variables 101').should('be.visible');
  });

  it('show course with no modules on home page', () => {
    mockNonAdminUser();
    mockEmptyStudentCourses('test-google-id');
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.wait('@getStudentCourses');

    cy.contains('No Courses Available').should('be.visible');
    cy.contains('Please check back later for available courses.').should(
      'be.visible'
    );
  });

  it('show username in navbar for signed in user', () => {
    mockNonAdminUser();
    mockEmptyStudentCourses('test-google-id');
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.wait('@getStudentCourses');

    cy.contains('testuser').should('be.visible');
  });

  it('navbar should have home page and logout for non admin user', () => {
    mockNonAdminUser();
    mockEmptyStudentCourses('test-google-id');
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.wait('@getStudentCourses');

    cy.contains('testuser').should('be.visible');

    getNavBar().click();

    // home nav
    cy.contains('a', 'Home').should('be.visible').and('have.attr', 'href', '/');

    cy.get('button').should('contain.text', 'Logout').and('be.visible');
  });

  it('navbar should have multiple options for admin user', () => {
    mockAdminUser();
    mockEmptyStudentCourses('admin-google-id');
    cy.visit('/');
    cy.wait('@getUserInfo');
    cy.wait('@getStudentCourses');

    cy.contains('adminuser').should('be.visible');

    getNavBar().click();

    // home nav
    cy.contains('a', 'Home').should('be.visible').and('have.attr', 'href', '/');

    cy.contains('a', 'Create')
      .should('be.visible')
      .and('have.attr', 'href', '/create');

    cy.contains('a', 'Manage Users')
      .should('be.visible')
      .and('have.attr', 'href', '/usermanagement');

    cy.get('button').should('contain.text', 'Logout').and('be.visible');
  });
});

describe('Testing Create Page', () => {
  beforeEach(() => {
    mockAdminUser();
    cy.visit('/create');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('should show all possible creations on side', () => {
    cy.contains('a', 'Module')
      .should('be.visible')
      .and('have.attr', 'href', '/create/module');

    cy.contains('a', 'Course')
      .should('be.visible')
      .and('have.attr', 'href', '/create/course');

    cy.contains('a', 'Demo')
      .should('be.visible')
      .and('have.attr', 'href', '/create/demo');

    cy.contains('a', 'Exercise')
      .should('be.visible')
      .and('have.attr', 'href', '/create/exercise');

    cy.contains('a', 'Resource')
      .should('be.visible')
      .and('have.attr', 'href', '/create/resource');
  });

  it('should show table modules options on create page', () => {
    cy.contains('Module').click();

    cy.contains('Topic').should('be.visible');
    cy.contains('Language').should('be.visible');
    cy.contains('Resources').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('should show table course options on create page', () => {
    cy.contains('Course').click();

    cy.contains('Title').should('be.visible');
    cy.contains('Module').should('be.visible');
    cy.contains('Instructors').should('be.visible');
    cy.contains('Roster').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('should show table demo options on create page', () => {
    cy.contains('Demo').click();

    cy.contains('Title').should('be.visible');
    cy.contains('Topic').should('be.visible');
    cy.contains('Language').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('should show table exercise options on create page', () => {
    cy.contains('Exercise').click();

    cy.contains('Prompt').should('be.visible');
    cy.contains('Topic').should('be.visible');
    cy.contains('Language').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('should show table resources options on create page', () => {
    cy.contains('Resource').click();

    cy.contains('Title').should('be.visible');
    cy.contains('URL').should('be.visible');
    cy.contains('Source').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('should show exercise resource form modal with fields', () => {
    cy.contains('Resource').click();
    cy.contains('Create Resource').click();

    cy.get('input[name="title"]').should('be.visible');
    cy.get('input[name="url"]').should('be.visible');
    cy.get('input[name="source"]').should('be.visible');

    getSubmitButton().should('be.disabled');
    cy.contains('Cancel').should('be.visible');
  });

  it('should show exercise create form modal with fields', () => {
    cy.visit('/create/exercise');

    cy.contains('Create Exercise').click();

    cy.get('[data-testid="prompt"]').should('exist');
    cy.contains('Reference Test').scrollIntoView().should('be.visible');

    getLanguageSelect().should('be.visible');
    getTagSelect().should('be.visible');
    cy.contains('Select Topic').should('be.visible');

    getSubmitButton().should('be.disabled');
    cy.contains('Cancel').should('be.visible');
  });

  it('should show module create form modal with fields', () => {
    cy.visit('/create/module');

    cy.contains('Create Module').click();

    getTopicSelect().should('be.visible');
    getLanguageSelect().should('be.visible');
    getResourceSelect().should('be.visible');

    getSubmitButton().should('be.disabled');
    cy.contains('Cancel').should('be.visible');
  });

  it('should show course create form modal with fields', () => {
    cy.visit('/create/course');

    cy.contains('Create Course').click();

    getTitleInput().should('be.visible');
    getLanguageSelect().should('be.visible');
    getModuleSelect().should('be.visible');
    getInstructorSelect().should('be.visible');
    getRosterSelect().should('be.visible');

    getSubmitButton().should('be.disabled');
    cy.contains('Cancel').should('be.visible');
  });

  it('should show demo create form modal with fields', () => {
    cy.visit('/create/demo');

    cy.contains('Create Demo').click();

    getLanguageSelect().should('be.visible');
    getTopicSelect().should('be.visible');
    getTagSelect().should('be.visible');
    getYoutubeIdInput().should('be.visible');
    getTitleInput().should('be.visible');
    getExerciseSelect().should('be.visible');

    getSubmitButton().should('be.disabled');
    cy.contains('Cancel').should('be.visible');
  });
});

describe.only('Testing Read Page', () => {
  beforeEach(() => {
    mockNonAdminUser();
    interceptReadPage();

    cy.visit('/read/1');
    cy.wait('@getReadPage');
    cy.wait('@getUserInfo');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('should show demo title', () => {
    getDemoTitle().should('be.visible');
  });

  it('should show like button', () => {
    getLikeButton().should('be.visible');
  });

  it('should show author tags', () => {
    getAuthorTags().should('be.visible');
  });

  it('should show related demos', () => {
    getRelatedDemos().should('be.visible');
    getRelatedDemos().find('summary').click();
    getRelatedDemos().find('.overflow-x-auto').should('be.visible');
  });

  it('should show helpful links', () => {
    getHelpfulLinks().should('be.visible');
    getHelpfulLinks().find('summary').click();
    getHelpfulLinks().find('.space-y-2').should('be.visible');
  });

  it('should display code editor', () => {
    getCodeEditor().should('be.visible');

    getCodeEditor().contains('Hello').should('not.exist');
  });

  it('should show reset button', () => {
    getResetButton().should('be.visible');
  });

  it('should show submit button', () => {
    getSubmitButton().should('be.visible');
  });

  it('should display checklist with results and test items', () => {
    getCheckList().should('be.visible');
    getCheckList().contains('Results').should('be.visible');
  });
});

describe('Exercise creation functionality', () => {
  beforeEach(() => {
    cy.visit('/create/exercise');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('prevents form submission with empty prompt', () => {
    cy.get('form').within(() => {
      getSubmitButton().should('be.disabled');
    });
    cy.url().should('include', '/create/exercise');
  });

  it('allows a user to create a new exercise', () => {
    getExercisePrompt().type('New Exercise Prompt');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getLanguageSelect().select('cpp');
    cy.get('form').submit();
    cy.contains('New Exercise Prompt').should('be.visible');
  });

  it('allows a user to edit an existing exercise', () => {
    cy.get('[id="edit-0"]').click();
    getExercisePrompt().clear();
    getExercisePrompt().type('Updated Exercise Prompt');
    getLanguageSelect().select('Java');
    cy.get('form').submit();
    cy.contains('Updated Exercise').should('be.visible');
  });

  it('exercise post throws error and navigates to error page', () => {
    cy.intercept('POST', '/exercises', {
      statusCode: 500,
      body: {
        message: 'Internal server error',
      },
    }).as('createExerciseError');
    getExercisePrompt().type('Second Exercise Prompt');
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getLanguageSelect().select('Java');
    cy.get('form').submit();
    cy.wait('@createExerciseError');
    cy.contains('Something Went Wrong...').should('be.visible');
  });

  it('exercise patch throws error and navigates to error page', () => {
    cy.intercept('PATCH', '/exercises/*', {
      statusCode: 500,
      body: {
        message: 'Internal server error',
      },
    }).as('createExercisePatchError');
    cy.get('[id="edit-0"]').click();
    getExercisePrompt().clear();
    getExercisePrompt().type('Updated Exercise Prompt');
    cy.get('form').submit();
    cy.wait('@createExercisePatchError');
    cy.contains('Something Went Wrong...').should('be.visible');
  });

  it('allows a user to delete an exercise', () => {
    cy.get('[id="delete-0"]').click();
    cy.contains('Updated Exercise Prompt').should('not.exist');
  });

  it('allows a user to create another new exercise', () => {
    getExercisePrompt().type('Second Exercise Prompt');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getLanguageSelect().select('cpp');
    cy.get('form').submit();
    cy.contains('Second Exercise Prompt').should('be.visible');
  });
});

describe.only('test out create form functionality', () => {
  beforeEach(() => {
    cy.visit('/create');
  });

  it('allows users to enter a video title', () => {
    cy.get('input[name="title"]').type('New Demo Title');
    cy.get('input[name="title"]').should('have.value', 'New Demo Title');
  });

  it('displays an error if the API call fails while fetching videos', () => {
    cy.intercept('GET', 'https://www.googleapis.com/youtube/v3/search*', {
      statusCode: 500,
    }).as('getVideosFail');
    cy.wait('@getVideosFail');
    cy.contains('Failed to fetch videos. Please try again later.').should(
      'be.visible'
    );
  });

  it('fills and submits a new demo exercise with an exercise', () => {
    cy.intercept('GET', 'https://www.googleapis.com/youtube/v3/search*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: { videoId: '9Z6mWJXR-6M' },
            snippet: { title: 'Mock Video Title' },
          },
        ],
      },
    }).as('getVideos');
    cy.wait('@getVideos');
    cy.get('input[name="title"]').type('2nd Demo Exercise');
    cy.get('[id="youtube_id"]').type('Mock Video Title{enter}');
    cy.get('div[id="exercise-select"]').click();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get('[id="exercise-select"]')
      .click()
      .type('Second Exercise Prompt{enter}');
    getSubmitButton().click();
    cy.contains('2nd Demo Exercise').should('be.visible');
    cy.contains('1 Exercises').should('be.visible');
  });

  it('fills and submits a new demo with no exercises', () => {
    cy.intercept('GET', 'https://www.googleapis.com/youtube/v3/search*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: { videoId: '9Z6mWJXR-6M' },
            snippet: { title: 'Mock Video Title' },
          },
        ],
      },
    }).as('getVideos');
    cy.wait('@getVideos');
    cy.get('input[name="title"]').type('New Demo');
    cy.get('[id="youtube_id"]').type('Mock Video Title{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getSubmitButton().click();
    cy.contains('New Demo').should('be.visible');
    cy.contains('0 Exercises').should('be.visible');
  });
});

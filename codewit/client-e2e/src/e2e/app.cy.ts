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
  getExerciseReferenceTest
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

  it('should show resource create form modal with fields', () => {
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

describe('Testing Read Page', () => {
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
    mockAdminUser();
    cy.visit('/create/exercise');
    cy.wait('@getUserInfo');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('prevents form submission with empty prompt', () => {
    cy.contains('Create Exercise').click();
    getSubmitButton().should('be.disabled');
  });

  it('allows a user to create a new exercise', () => {
    cy.contains('Create Exercise').click();
    getExercisePrompt().type('New Exercise Prompt');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getExerciseReferenceTest().click().type('console.log("Hello World");');

    // intercept exercise and return 200
    cy.intercept('POST', '/exercises', {
      statusCode: 200,
      body: {
        id: 1,
        prompt: 'New Exercise Prompt',
        tags: ['console io', 'customtag'],
        topic: 'console io',
        language: {
          name: 'cpp'
        } 
      }
    }).as('createExercise');

    getSubmitButton().click();
    cy.wait('@createExercise');
  });

  it('exercise post throws error and error toast pops up', () => {
    cy.intercept('POST', '/exercises', {
      statusCode: 500,
      body: {
        message: 'Internal server error',
      },
    }).as('createExerciseError');
    cy.contains('Create Exercise').click();
    getExercisePrompt().type('New Exercise Prompt');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    getTagSelect().click().type('customtag{enter}');
    getTopicSelect().click().type('console io{enter}');
    getExerciseReferenceTest().click().type('console.log("Hello World");');
    getSubmitButton().click();
    cy.wait('@createExerciseError');
    cy.contains('Error saving the erxercise').should('be.visible');
  });
});

describe.only('Exercise Editing/Delete functionality', () => {
  beforeEach(() => {
    mockAdminUser();
    cy.intercept('GET', '/exercises', {
      statusCode: 200,
      body: [{
        uid: 1,
        prompt: 'New Exercise Prompt',
        referenceTest: 'console.log("Hello World");',
        tags: ['console io', 'customtag'],
        topic: 'console io',
        language: {
          name: 'cpp'
        } 
      }]
    }).as('getExercise');
    cy.visit('/create/exercise');
    cy.wait('@getUserInfo');
    cy.wait('@getExercise');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('edit should show existing data', () => {
    cy.contains('Edit').click();
    getExercisePrompt().contains('New Exercise Prompt').should('be.visible');
  });

  it('edit should throw error', () => {
    cy.contains('Edit').click();
    getSubmitButton().click();
    cy.contains('Error saving the exercise').should('be.visible');
  });

  it('edit should send updated exercise data in PATCH request', () => {
    // intercept PATCH and alias it
    cy.intercept('PATCH', '/exercises/*', (req) => {
      req.alias = 'patchExercise';
    });
  
    // click edit
    cy.contains('Edit').click();
  
    // change the prompt
    getExercisePrompt().clear().type('Edited Exercise Prompt');
  
    // click submit
    getSubmitButton().click();
  
    // wait and check the body
    cy.wait('@patchExercise').its('request.body').should((body) => {
      expect(body.prompt).to.equal('Edited Exercise Prompt');
      expect(body.topic).to.equal('console io');
      expect(body.tags).to.include.members(['console io', 'customtag']);
      expect(body.language).to.equal('cpp');
      expect(body.referenceTest).to.equal('console.log("Hello World");');
    });
  });  

  it.only('should send DELETE request to correct exercise uid', () => {
    cy.intercept('DELETE', '/exercises/1', (req) => {
      req.alias = 'deleteExercise';
    });
  
    cy.contains('Delete').click();
  
    cy.wait('@deleteExercise').its('request.url').should('include', '/exercises/1');
  });
  
});
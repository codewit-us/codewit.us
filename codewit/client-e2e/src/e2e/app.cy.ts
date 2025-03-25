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
  getExerciseReferenceTest,
  getUrlInput,
  getSourceInput
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
    cy.contains('Error saving the exercise').should('be.visible');
  });
});

describe('Exercise Editing/Delete functionality', () => {
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

  it('should send DELETE request to correct exercise uid', () => {
    cy.intercept('DELETE', '/exercises/1', (req) => {
      req.alias = 'deleteExercise';
    });
  
    cy.contains('Delete').click();
  
    cy.wait('@deleteExercise').its('request.url').should('include', '/exercises/1');
  });

});

describe("Resource creations functionlity", () => {
  beforeEach(() => {
    mockAdminUser();
    cy.intercept('GET', '/resources', {
      statusCode: 200,
      body: []
    }).as("getResources");
    cy.visit("/create/resource");
    cy.wait("@getUserInfo");
    cy.wait("@getResources")
  })

  it("should render successfully", () => {
    cy.get('body').should('be.visible');
  })

  it('should prevent form submission with empty form', () => {
    cy.contains('Create Resource').click();
    getSubmitButton().should('be.disabled');
  })
  
  it('should allow a user to create a new resource', () => {
    cy.intercept('POST', '/resources', (req) => {
      expect(req.body).to.deep.equal({
        url: 'https://example.com/resource',
        title: 'New Resource Title',
        source: 'Example',
        likes: 0
      });
    }).as('createResource');
    
    cy.contains('Create Resource').click();
    
    getTitleInput().type('New Resource Title');
    getUrlInput().type('https://example.com/resource');
    getSourceInput().type('Example');
    
    getSubmitButton().click();
    
    cy.wait('@createResource');
  })
})

describe.only("Course creations functionality", () => {
  beforeEach(() => {
    mockAdminUser();
    cy.intercept('GET', '/courses', {
      statusCode: 200,
      body: []
    }).as('getCourse');
    cy.visit('/create/course');
    cy.wait('@getUserInfo');
    cy.wait('@getCourse');
  })

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  })

  it('should prevent form submission with empty form', () => {
    cy.contains('Create Course').click();
    getSubmitButton().should('be.disabled');
  })

  it('should allow a user to create a new course', () => {
    cy.intercept('POST', '/courses', (req) => {
      expect(req.body).to.deep.equal({
        id: 1,
        instructor: 'test instructor',
        language: 'cpp',
        modules: [],
        roster: [],
        title: 'New Course Title'
      })
    }).as('createCourse');

  it('should allow a user to create a new course', () => {
    cy.intercept('POST', '/courses', (req) => {    expect(req.body).to.deep.equal({
        title: 'New Course Title',
        language: 'cpp',
      })
    }).as('createCourse');

    cy.contains('Create Course').click();
    getTitleInput().type('New Course Title');
    getLanguageSelect().type('cpp{enter}');
    getInstructorSelect().type('test instructor{enter}');
    getRosterSelect().type('test student{enter}');
    getModuleSelect().type('test module{enter}');
    getSubmitButton().click();
    cy.wait('@createCourse');
  })
  })
})

describe("Module creations functionality", () => {
  beforeEach(() => {
    mockAdminUser();
    cy.intercept('GET', '/modules', {
      statusCode: 200,
      body: [] 
    }).as('getModules');
    cy.visit('/create/module');
    cy.wait('@getUserInfo');
    cy.wait('@getModules');
  })

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  })

  it('should prevent form submission with empty form', () => {
    cy.contains('Create Module').click();
    getSubmitButton().should('be.disabled');
  })

  it("should allow a user to creat a new moduele", () => {
    cy.intercept('POST', '/modules', (req) => {
      expect(req.body).to.deep.equal({
        language: "cpp",
        resources: [],
        topic: "operation"
      })
    }).as('createModule');

    cy.contains('Create Module').click();
    getTopicSelect().type('operation{enter}');
    getLanguageSelect().type('cpp{enter}');
    getSubmitButton().click();
    cy.wait('@createModule');
  })
})


describe('Demo creation functionality', () => {
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
    cy.visit('/create/demo');
    cy.wait('@getUserInfo');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('prevents form submission with empty form', () => {
    cy.contains('Create Demo').click();
    getSubmitButton().should('be.disabled');
  });

  it('allows a user to create a new demo', () => {
    cy.intercept('POST', '/demos', (req) => {
      expect(req.body).to.deep.equal({
        title: 'New Demo Title',
        youtube_id: '8bc-VU3V7lU',
        youtube_thumbnail: 'https://i.ytimg.com/vi/8bc-VU3V7lU/hqdefault.jpg',
        topic: 'operation',
        language: 'cpp',
        tags: ['console io'],
        exercises: [1]
      });
    }).as('createDemo');
  
    cy.contains('Create Demo').click();
    getDemoTitle().type('New Demo Title');
    getYoutubeIdInput().type('8bc-VU3V7lU{enter}');
    getExerciseSelect().type('New Exercise Prompt{enter}');
    getTagSelect().type('console io{enter}');
    getTopicSelect().type('operation{enter}');
  
    getSubmitButton().click();
  
    cy.wait('@createDemo');
  });

  it('error shows up when posting demo', () => {
  
    cy.contains('Create Demo').click();
    getDemoTitle().type('New Demo Title');
    getYoutubeIdInput().type('8bc-VU3V7lU{enter}');
    getExerciseSelect().type('New Exercise Prompt{enter}');
    getTagSelect().type('console io{enter}');
    getTopicSelect().type('operation{enter}');
  
    getSubmitButton().click();

    cy.contains('An error occurred. Please try again.').should('be.visible');

  });
});

describe('Demo Editing/Deleting functionality', () => {
  beforeEach(() => {
    mockAdminUser();
    cy.intercept('GET', '/demos', {
      statusCode: 200,
      body: [
        {
          uid: 99,
          title: 'New Demo Title',
          youtube_id: '8bc-VU3V7lU',
          youtube_thumbnail: 'https://i.ytimg.com/vi/8bc-VU3V7lU/hqdefault.jpg',
          topic: 'operation',
          language: 'cpp',
          tags: ['console io'],
          exercises: [1],
        },
      ],
    }).as('getDemos');

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

    cy.visit('/create/demo');
    cy.wait('@getUserInfo');
    cy.wait('@getDemos');
  });

  it('should render successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('edit should show existing data', () => {
    cy.contains('Edit').click();
    cy.contains('New Demo Title').should('be.visible');
  });

  it('edit should throw error', () => {
    cy.contains('Edit').click();
    getSubmitButton().click();
    cy.contains('An error occurred. Please try again.').should('be.visible');
  });

  it('edit should send updated demo and verify body', () => {
    cy.intercept('PATCH', '/demos/99', (req) => {
      expect(req.body).to.deep.equal({
        uid: 99,
        title: 'Updated Demo Title',
        youtube_id: '8bc-VU3V7lU',
        youtube_thumbnail: 'https://i.ytimg.com/vi/8bc-VU3V7lU/hqdefault.jpg',
        topic: 'operation',
        language: 'cpp',
        tags: ['console io', 'updated tag'],
        exercises: [1],
      });
    }).as('patchDemo');

    cy.contains('Edit').click();
    cy.get('input[name="title"]').clear().type('Updated Demo Title');
    getTagSelect().type('updated tag{enter}');
    getSubmitButton().click();
    cy.wait('@patchDemo');
  });

  it('delete should call endpoint with correct UID', () => {
    cy.intercept('DELETE', '/demos/99').as('deleteDemo');
    cy.contains('Delete').click();
    cy.wait('@deleteDemo').its('request.url').should('include', '/demos/99');
  });

  it('edit should update the title visually on table', () => {
    cy.intercept('PATCH', '/demos/99', {
      statusCode: 200,
      body: {
        uid: 99,
        title: 'Updated Demo Title',
        youtube_id: '8bc-VU3V7lU',
        youtube_thumbnail: 'https://i.ytimg.com/vi/8bc-VU3V7lU/hqdefault.jpg',
        topic: 'updated topic',
        language: 'cpp',
        tags: ['updated tag'],
        exercises: [1],
      }
    }).as('patchDemoSuccess');

    cy.contains('Edit').click();
    getDemoTitle().clear().type('Updated Demo Title');
    getSubmitButton().click();
    cy.wait('@patchDemoSuccess');

    cy.contains('Updated Demo Title').should('be.visible');
  });
});

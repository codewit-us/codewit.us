import { getSubmitButton, 
         getTagSelect, 
         getLanguageSelect,
         getExercisePrompt,
         getTopicSelect 
      } from "../support/app.po";

describe('Testing App & App Routes', () => {

  it('should render successfully', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('navbar shows up correctly', () => {
    cy.visit('/');
    cy.contains('home').should('be.visible');
    cy.contains('create').should('be.visible');
  });

  it('navbar interaction to create page works correctly', () => {
    cy.visit('/');
    cy.contains('create').click();
    cy.contains('Create Demo Exercise').should('be.visible');
  });

  it('should navigate to the error page when an undefined route is accessed', () => {
    cy.visit('/some/undefined/route');
    cy.contains('404 ERROR').should('be.visible');
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

describe('test out create form functionality', () => {

  beforeEach(() => { cy.visit('/create') });

  it('allows users to enter a video title', () => {
    cy.get('input[name="title"]').type('New Demo Title');
    cy.get('input[name="title"]').should('have.value', 'New Demo Title');
  });

  it('displays an error if the API call fails while fetching videos', () => {
    cy.intercept('GET', 'https://www.googleapis.com/youtube/v3/search*', {
      statusCode: 500,
    }).as('getVideosFail');
    cy.wait('@getVideosFail');
    cy.contains('Failed to fetch videos. Please try again later.').should('be.visible');
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
    cy.get('[id="exercise-select"]').click().type('Second Exercise Prompt{enter}');
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

describe('Testing Home Page & Create/Read Page Functionality', () => {
  
  beforeEach(() => { cy.visit('/') });

  it('sucessfully edits a demo exercise', () => {
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
    cy.get('[data-testid="edit"]').first().click();
    cy.wait('@getVideos');
    cy.get('input[name="title"]').clear();
    cy.get('input[name="title"]').type('New Edited Name Exercise');
    getSubmitButton().click();
    cy.contains('New Edited Name Exercise').should('be.visible');
  });

  it('stops user from submitting form with empty edited title', () => {
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
    cy.get('[data-testid="edit"]').first().click();
    cy.wait('@getVideos');
    cy.get('input[name="title"]').clear();
    getSubmitButton().should('be.disabled');
  });
  
  it('edits a demo and removes an exercise', () => {
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
    cy.get('[data-testid="edit"]').eq(1).click();
    cy.wait('@getVideos');
    cy.get('div[aria-label="Remove Second Exercise Prompt"]').click();
    getSubmitButton().click();
    cy.contains('0 Exercises').should('be.visible');
  });

  it('clicking video takes to read page', () => {
    cy.contains('New Edited Name Exercise').click();
    cy.contains('New Edited Name Exercise').should('be.visible');
  });
  
  it('deletes a demo exercise', () => {
    cy.get('[data-testid="delete"]').first().click();
    cy.contains('New Demo').should('not.exist');
  });

});


describe('Testing Resource Form Functionality', () => {
  
  beforeEach(() => { cy.visit('/create/resource') });

  it('checks submit button is disabled on page load', () => {
    getSubmitButton().should('be.disabled');
  });

  it('allows user to enter a resource title', () => {
    cy.get('input[name="title"]').type('New Resource Title');
    cy.get('input[name="title"]').should('have.value', 'New Resource Title');
    getSubmitButton().should('be.disabled');
  });

  it('allows user to enter a url', () => {
    cy.get('input[name="url"]').type('www.website.com');
    cy.get('input[name="url"]').should('have.value', 'www.website.com');
    getSubmitButton().should('be.disabled');
  });

  it('allows user to enter a source', () => {
    cy.get('input[name="source"]').type('geeks4geeks');
    cy.get('input[name="source"]').should('have.value', 'geeks4geeks');
    getSubmitButton().should('be.disabled');
  });

  it('allows users to submit a new resource', () => {
    cy.get('input[name="title"]').type('New Resource Title');
    cy.get('input[name="url"]').type('www.website.com');
    cy.get('input[name="source"]').type('geeks4geeks');
    getSubmitButton().click();
    cy.contains('New Resource Title').should('be.visible');
  });

  it('edit button properly works and repopulates data', () => {
    cy.get('[id="edit-0"]').click();
    cy.get('input[name="title"]').should('have.value', 'New Resource Title');
    cy.get('input[name="url"]').should('have.value', 'www.website.com');
    cy.get('input[name="source"]').should('have.value', 'geeks4geeks');
  });

  it('submit edited resource', () => {
    cy.get('[id="edit-0"]').click();
    cy.get('input[name="title"]').clear();
    cy.get('input[name="title"]').type('Updated Resource Title');
    getSubmitButton().click();
    cy.contains('Updated Resource Title').should('be.visible');
  });

  it('allows users to submit another new resource', () => {
    cy.get('input[name="title"]').type('Another Resource Title');
    cy.get('input[name="url"]').type('www.website.com');
    cy.get('input[name="source"]').type('geeks4geeks');
    getSubmitButton().click();
    cy.contains('Another Resource Title').should('be.visible');
  });

  it('allows users to delete a resource', () => {
    cy.get('[id="delete-0"]').click();
    cy.contains('Updated Resource Title').should('not.exist');
  });

});

describe.only('Testing Module Form Functionality', () => {
  
  beforeEach(() => { cy.visit('/create/module') });

  it('checks submit button is disabled on page load', () => {
    getSubmitButton().should('be.disabled');
  });

  it('allow users to select a topic', () => {
    getTopicSelect().click().type('console io{enter}');
    cy.contains('console io').should('be.visible');
  });

  it('allow users to select resources', () => {
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get('div[id="resource-select"]').click().type('Another Resource Title{enter}');
    cy.contains('Another Resource Title').should('be.visible');
    getSubmitButton().should('be.disabled');
  });

  it('allow users to select language', () => {
    getLanguageSelect().select('Python');
    getLanguageSelect().should('have.value', 'Python');
    getSubmitButton().should('be.disabled');
  });
  
  it('module submits properly', () => {
    getTopicSelect().click().type('console io{enter}');
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get('div[id="resource-select"]').click().type('Another Resource Title{enter}');
    getLanguageSelect().select('C++');
    getSubmitButton().click();
    // see if edit button exists, since modules dont' have a title
    cy.contains('Edit').should('be.visible');
  });

  it('demo should be linked to module', () => {
    cy.get('[id="edit-0"]').click();
    cy.contains('Linked Demos').should('be.visible');
    cy.contains('New Edited Name Exercise').should('be.visible');
  });

  it('edit button properly works and repopulates data', () => {
    cy.get('[id="edit-0"]').click();
    cy.contains('Another Resource Title').should('be.visible');
    getLanguageSelect().should('have.value', 'cpp');
    cy.contains('Linked Demos').should('be.visible');
  });

  it('create and submit another module', () => {
    getTopicSelect().click().type('console io{enter}');
    getSubmitButton().click();
    // see if edit button exists, since modules dont' have a title
    cy.contains('Edit').should('be.visible');
    cy.get('[id="edit-0"]').click();
    cy.contains('Another Resource Title').should('be.visible');
    getLanguageSelect().should('have.value', 'cpp');
  });

  it('delete module', () => {
    cy.get('[id="delete-0"]').click();
    cy.get('[id="edit-0"]').click();
    cy.contains('New Edited Name Exercise').should('be.visible');
  });

});
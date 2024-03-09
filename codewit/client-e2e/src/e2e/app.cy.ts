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
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/create/exercise');
  });

  it('allows a user to create a new exercise', () => {
    cy.get('[data-testid="prompt"]').type('New Exercise Prompt');
    cy.get('form').submit();
    cy.contains('New Exercise Prompt').should('be.visible');
  });

  it('allows a user to edit an existing exercise', () => {
    cy.get('[data-testid="edit-0"]').click();
    cy.get('[data-testid="prompt"]').clear();
    cy.get('[data-testid="prompt"]').type('Updated Exercise Prompt');
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
    cy.get('[data-testid="prompt"]').type('Second Exercise Prompt');
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
    cy.get('[data-testid="edit-0"]').click();
    cy.get('[data-testid="prompt"]').clear();
    cy.get('[data-testid="prompt"]').type('Updated Exercise Prompt');
    cy.get('form').submit();
    cy.wait('@createExercisePatchError');
    cy.contains('Something Went Wrong...').should('be.visible');
  });

  it('allows a user to delete an exercise', () => {
    cy.get('[data-testid="delete-0"]').click();
    cy.contains('Updated Exercise Prompt').should('not.exist');
  });

  it('allows a user to create another exercise', () => {
    cy.get('[data-testid="prompt"]').type('Second Exercise Prompt');
    cy.get('form').submit();
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

  it('fills and submits a new demo exercise with no exercises', () => {
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
    cy.get('input[name="title"]').type('New Demo Exercise');
    cy.get('input[placeholder="Search for a video"]').type('Mock Video Title');
    cy.contains('li', 'Mock Video Title').click();
    cy.get('button[type="submit"]').click();
    cy.contains('New Demo Exercise').should('be.visible');
    cy.contains('0 Exercises').should('be.visible');
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
    cy.get('input[placeholder="Search for a video"]').type('Mock Video Title');
    cy.contains('li', 'Mock Video Title').click();
    cy.get('div[id="exercise-select"]').click();
    cy.get('div[id="exercise-select"]').find('input').type('second exercise prompt', { force: true });
    cy.contains('div', 'Second Exercise Prompt').click(); 
    cy.get('button[type="submit"]').click();
    cy.contains('2nd Demo Exercise').should('be.visible');
    cy.contains('1 Exercises').should('be.visible');
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
    cy.get('button[type="submit"]').click();
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
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/create');
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
    cy.get('[data-testid="edit"]').first().click();
    cy.wait('@getVideos');
    cy.get('div[aria-label="Remove Second Exercise Prompt"]').click();
    cy.get('button[type="submit"]').click();
    cy.contains('0 Exercises').should('be.visible');
  });

  it('clicking video takes to read page', () => {
    cy.contains('New Edited Name Exercise').click();
    cy.contains('New Edited Name Exercise').should('be.visible');
  });
  
  it('deletes a demo exercise', () => {
    cy.get('[data-testid="delete"]').first().click();
    cy.contains('New Edited Name Exercise').should('not.exist');
  });

});
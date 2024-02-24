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

describe('test out create form functionality', () => {

  beforeEach(() => { cy.visit('/create') });

  it('allows users to enter a video title', () => {
    cy.get('input[name="title"]').type('New Demo Title');
    cy.get('input[name="title"]').should('have.value', 'New Demo Title');
  });

  it('adds an exercise successfully', () => {
    cy.contains('add exercise').click();
    cy.get('[data-testid="exercise-0"]').should('have.length', 1);
  });

  it('removes an exercise successfully', () => {
    cy.contains('add exercise').click();
    cy.get('[data-testid="exercise-0"]').should('exist');
    cy.get('[data-testid="remove-exercise"]').click();
    cy.get('[data-testid="exercise-0"]').should('not.exist');
  });

  it('updates exercise prompt successfully', () => {
    cy.contains('add exercise').click();
    cy.contains('add exercise').click();
    cy.get('[data-testid="exercise-0"]').type('Updated exercise prompt');
    cy.get('[data-testid="exercise-1"]').type('Updated 2nd exercise prompt');
    cy.get('[data-testid="exercise-0"]').should('have.value', 'Updated exercise prompt');
    cy.get('[data-testid="exercise-1"]').should('have.value', 'Updated 2nd exercise prompt');
  });

  it('displays an error if the API call fails while fetching videos', () => {
    cy.intercept('GET', 'https://www.googleapis.com/youtube/v3/search*', {
      statusCode: 500,
    }).as('getVideosFail');
    // wait for the failed API call
    cy.wait('@getVideosFail');
    // check for an error message displayed to the user
    cy.contains('Failed to fetch videos. Please try again later.').should('be.visible');
  });

  it('fills and submits a new demo exercise', () => {
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
    // wait for the yt api call to be intercepted 
    cy.wait('@getVideos');
    // fill out form
    cy.get('input[name="title"]').type('New Demo Exercise');
    cy.get('select').select('9Z6mWJXR-6M');
    cy.contains('add exercise').click();
    cy.get('textarea').first().type('Exercise 1 description'); 
    // submit 
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3001/');
    cy.contains('New Demo Exercise').should('be.visible');
  });
});


describe('Testing Home Page & Create/Read Page Functionality', () => {
  
  it('sucessfully edits a demo exercise', () => {
    cy.visit('/');
    cy.get('[data-testid="edit"]').click();
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
    // wait for the yt api call to be intercepted 
    cy.wait('@getVideos');
    // fill out form
    cy.get('input[name="title"]').type('New Edited Name Exercise');
    cy.get('select').select('9Z6mWJXR-6M');
    // submit 
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3001/');
    cy.contains('New Edited Name Exercise').should('be.visible');
  });
  
  it('sucessfully edits a demo exercise', () => {
    cy.visit('/');
    cy.get('[data-testid="edit"]').click();
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
    // wait for the yt api call to be intercepted 
    cy.wait('@getVideos');
    // fill out form
    cy.get('input[name="title"]').type('New Edited Name Exercise');
    cy.get('select').select('9Z6mWJXR-6M');
    // submit 
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3001/');
    cy.contains('New Edited Name Exercise').should('be.visible');
  });

  it('clicking video takes to read page', () => {
    cy.visit('/');
    cy.get('New Edited Name Exercise').click();
    // video title should be visible
    cy.contains('New Edited Name Exercise').should('be.visible');
    // exercise description should be visible
    cy.contains('Exercise 1 description').should('be.visible');
  });
  
  it('deletes a demo exercise', () => {
    cy.visit('/');
    cy.get('[data-testid="delete"]').click();
    cy.contains('New Edited Name Exercise').should('not.exist');
  });

});
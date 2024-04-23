export const getGreeting = () => cy.get('h1');
export const getExercisePrompt = () => cy.get('[data-testid="prompt"]');
export const getSubmitButton = () => cy.get('button[type="submit"]');
export const getTagSelect = () => cy.get('[id="tag-select"]');
export const getTopicSelect = () => cy.get('[id="single-tag-select"]');
export const getLanguageSelect = () => cy.get('select[name="language"]');
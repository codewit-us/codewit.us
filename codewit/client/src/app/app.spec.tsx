import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes } from 'react-router-dom';
import App from './app';

describe('App', () => {
  
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByText(/home/i)).toBeTruthy();
  });

  it('should navigate to the create page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/create/gi));
    expect(screen.getByText(/create demo exercise/i)).toBeTruthy();
  });

  it('should navigate to the error page when an undefined route is accessed', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    window.history.pushState({}, '', '/some/undefined/route');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/404 error/i)).toBeTruthy();
  });
  
});

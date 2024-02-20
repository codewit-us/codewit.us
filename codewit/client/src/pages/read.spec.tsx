import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Read from './read';

// Correct the mocks for other components
vi.mock('../pages/notfound', () => ({
  default: () => <div>NotFoundComponent</div>,
}));
vi.mock('../components/loading/loading', () => ({
  default: () => <div>LoadingComponent</div>,
}));

const demoData = [
  {
    "uid": 1,
    "youtube_id": "9Z6mWJXR-6M",
    "title": "Beginning C++",
    "likes": 0,
    "exercises": [
      {
        "uid": 1,
        "prompt": "Add #include <iostream> to the beginning of the file"
      },
      {
        "uid": 2,
        "prompt": "Add using namespace std; after that"
      },
      {
        "uid": 3,
        "prompt": "Start you code by writing it in int main() {}"
      }
    ]
  }
];

describe('Read Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    localStorage.setItem('demos', JSON.stringify(demoData));
  });

  it('renders page successfully', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/read/1']}>
        <Read />
      </MemoryRouter>
    );

    waitFor(() => expect(queryByText('Beginning C++')).toBeTruthy());
  });
  
  it('error page loads successfully', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/read/doesnotexist']}>
        <Read />
      </MemoryRouter>
    );

    waitFor(() => expect(queryByText('NotFoundComponent')).toBeTruthy());
  });

  it('exercises loads successfully', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/read/1']}>
        <Read />
      </MemoryRouter>
    );

    waitFor(() => expect(queryByText('Add #include <iostream> to the beginning of the file')).toBeTruthy());
    waitFor(() => expect(queryByText('Add #include <iostream> to the beginning of the file')).toBeTruthy());
    waitFor(() => expect(queryByText('Add #include <iostream> to the beginning of the file')).toBeTruthy());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './home';

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
  },
  {
    "uid": 2,
    "youtube_id": "vlsUmcmAsXg",
    "title": "Recursion",
    "likes": 0,
    "exercises": [
      {
        "uid": 1,
        "prompt": "Create a basic template "
      }
    ]
  }
];

describe('Home Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    localStorage.setItem('demos', JSON.stringify(demoData));
  });

  test('expect videos from local storage to be on page', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const videoOneTitle = queryByText(/Beginning C\+\+/i);
    const videoTwoTitle = queryByText(/Recursion/i);
    expect(videoOneTitle).toBeTruthy();
    expect(videoTwoTitle).toBeTruthy();
  });

  test('see that non-existent video does not exist on page', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const nonExistentVideoTitle = queryByText(/Finishing C\-\-/i);
    expect(nonExistentVideoTitle).toBeNull();
  });  

  test('delete video from page and expect it to not exist', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const nonExistentVideoTitle = queryByText(/Finishing C\-\-/i);
    expect(nonExistentVideoTitle).toBeNull();
  });  

  test('delete "Beginning C++" video from page and expect it to not exist', async () => {
    const { container, queryByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );  
    const deleteButtons = container.querySelectorAll('.text-red-600');
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    } else {
      throw new Error('Delete button not found');
    }
  
    const beginningCppTitle = queryByText(/Beginning C\+\+/i);
    expect(beginningCppTitle).toBeNull();

    const recursionTitle = queryByText(/Recursion/i);
    expect(recursionTitle).toBeTruthy();
  });
  
  test('delete both videos from page and expect them to not exist', async () => {
    const { container, queryByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );  
    const deleteButtons = container.querySelectorAll('.text-red-600');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);
    const beginningCppTitle = queryByText(/Beginning C\+\+/i);
    expect(beginningCppTitle).toBeNull();

    const recursionTitle = queryByText(/Recursion/i);
    expect(recursionTitle).toBeNull();
  }); 

});

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './notfound';

describe('Error Page', () => {

  test('Expect Error Page To Render', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    const Error = queryByText(/404 ERROR/i);
    const PageNotFound = queryByText(/Page not found/i);
    expect(Error).toBeTruthy();
    expect(PageNotFound).toBeTruthy();
  });

});

import React from 'react';
import { fireEvent, getByTestId, render } from '@testing-library/react';
import Create from './create';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';


vi.mock('../components/form/videoselect', () => ({
  __esModule: true,
  default: ({ onSelectVideo }: { onSelectVideo: (videoId: string) => void }) => (
    <select data-testid="video-select" onChange={(e) => onSelectVideo(e.target.value)}>
      <option value="">Select a video</option>
      <option value="video1">Video 1</option>
    </select>
  ),
}));

describe('create component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    localStorage.setItem('uid', '0');
  });

  test('renders without crashing', () => {
    const { getByText } = render(<MemoryRouter><Create /></MemoryRouter>);
    expect(getByText(/Create Demo Exercise/i)).toBeTruthy();
  });

  test('allows users to enter a video title', () => {
    const { getByLabelText } = render(<MemoryRouter><Create /></MemoryRouter>);
    const titleInput = getByLabelText(/title/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'New Video Title' } });
    expect(titleInput.value).toBe('New Video Title');
  });

  test('allows users to enter number of likes', () => {
    const { getByLabelText } = render(<MemoryRouter><Create /></MemoryRouter>);
    const likesInput = getByLabelText(/likes/i) as HTMLInputElement;
    fireEvent.change(likesInput, { target: { value: 123 } });
    expect(parseInt(likesInput.value)).toBe(123);
  });

  test('make sure like count only expects numbers', () => {
    const { getByLabelText } = render(<MemoryRouter><Create /></MemoryRouter>);
    const likesInput = getByLabelText(/likes/i) as HTMLInputElement;
    fireEvent.change(likesInput, { target: { value: 'abc' } });
    expect(likesInput.value).toBe('');
  });
  
  test('handles video selection', () => {
    const { getByTestId } = render(<MemoryRouter><Create /></MemoryRouter>);
    const selectElement = getByTestId('video-select') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'video1' } });
    expect(selectElement.value).toBe('video1');
  });  

  test('checks if UID input is disabled', () => {
    const { getByTestId } = render(<MemoryRouter><Create /></MemoryRouter>);
    const uidInput = getByTestId('uidbtn') as HTMLInputElement;
    expect(uidInput.disabled).toBe(true);
  });

  test('adds an exercise successfully', async () => {
    const { getByText, queryAllByTestId } = render(<MemoryRouter><Create /></MemoryRouter>);
    const addButton = getByText(/add exercise/i); 
  
    fireEvent.click(addButton);
  
    const exercises = queryAllByTestId('exercise-0');
    expect(exercises).toHaveLength(1);
  });
  
  test('removes an exercise successfully', async () => {
    const { getByText, queryAllByTestId, findByTestId } = render(<MemoryRouter><Create /></MemoryRouter>);
    const addButton = getByText(/add exercise/i); 
  
    fireEvent.click(addButton);
  
    let exercises = queryAllByTestId('exercise-0');
    expect(exercises).toHaveLength(1);
    const removeButton = await findByTestId('remove-exercise');
  
    fireEvent.click(removeButton);  
    exercises = queryAllByTestId('exercise-0');
    expect(exercises).toHaveLength(0);
  });

  test('updates exercise prompt successfully', async () => {
    const { getByText, getByTestId } = render(<MemoryRouter><Create /></MemoryRouter>);
    const addButton = getByText(/add exercise/i);
  
    fireEvent.click(addButton);
    fireEvent.click(addButton);
  
    const promptTextArea = getByTestId('exercise-0') as HTMLTextAreaElement;  
    fireEvent.change(promptTextArea, { target: { value: 'Updated exercise prompt' } });
    const promptTextAreaTwo = getByTestId('exercise-1') as HTMLTextAreaElement;  
    fireEvent.change(promptTextAreaTwo, { target: { value: 'Updated 2nd exercise prompt' } });
  
    expect(promptTextArea.value).toBe('Updated exercise prompt');
    expect(promptTextAreaTwo.value).toBe('Updated 2nd exercise prompt');
  });
  
});

import { render, screen } from '@testing-library/react';
import App from './App';
import { act } from 'react';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Start Your Journey/i);
  expect(linkElement).toBeInTheDocument();
});

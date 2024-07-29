import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ChakraProvider } from '@chakra-ui/react';
import EventDetailsModal from '../src/components/EventDetailsModal';
import { TextEncoder, TextDecoder } from 'util';
import { act } from 'react';

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

// Define mock post data
const mockPost = {
  uid: 'organizer-id',
  Title: 'Test Event',
  Description: 'This is a test event.',
  Date: {
    toDate: () => new Date('2024-07-23T10:00:00'),
  },
  Location: 'Test Location',
  Members: [
    { id: 'member1' },
    { id: 'member2' },
  ],
};

// Mock functions to simulate fetching data
const mockOrganizerData = {
  firstName: 'Organizer',
  Gender: 'Male',
  Major: 'Computer Science',
  hobbies: ['Coding', 'Reading'],
};

const mockMemberData = [
  { uid: 'member1', firstName: 'Member1' },
  { uid: 'member2', firstName: 'Member2' },
];

const mockGetDoc = jest.fn((ref) => {
  if (ref.id === 'organizer-id') {
    return Promise.resolve({ exists: () => true, data: () => mockOrganizerData });
  }
  if (ref.id === 'member1') {
    return Promise.resolve({ exists: () => true, data: () => mockMemberData[0] });
  }
  if (ref.id === 'member2') {
    return Promise.resolve({ exists: () => true, data: () => mockMemberData[1] });
  }
  return Promise.resolve({ exists: () => false });
});

// Override Firebase methods with mocks
beforeAll(() => {
  jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    getDoc: mockGetDoc,
    doc: jest.fn((_, collection, id) => ({ collection, id })),
  }));
});

describe('EventDetailsModal', () => {

  it('displays event details correctly', async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <EventDetailsModal isOpen={true} onClose={() => {}} post={mockPost} />
        </ChakraProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('This is a test event.')).toBeInTheDocument();
      expect(screen.getByText(new Date('2024-07-23T10:00:00').toLocaleString())).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });

});
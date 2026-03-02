/**
 * MSW Server Setup
 * Creates the mock service worker server for Node.js testing environment
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server with default handlers
export const server = setupServer(...handlers);

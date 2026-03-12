/**
 * Auth Hook - Re-exports from useAuth for kebab-case imports
 */

export {
  useAuth,
  useIsAuthenticated,
  useChurchId,
  useRequireAuth,
} from './useAuth';
export { useAuth as default } from './useAuth';

/**
 * Privacy-Aware Display Name System
 * Core utility for consistent, privacy-aware user name display across the application.
 *
 * Default Display Pattern:
 * - Most posts: FirstName + LastInitial (e.g., "John S.") - muted (@username)
 * - Leaders & verified staff: Full name + role badge (e.g., "Pastor John Smith" - (@johnsmith))
 * - Minors/youth: First name only - (@handle)
 * - Private groups with verified members: Full name - (@handle)
 * - Anonymous posts: Show "Anonymous" (no handle)
 * - Name collisions: Add disambiguator (e.g., "John S. - Orcutt Campus")
 */

export type DisplayContext = {
  isPublicFeed: boolean;
  isPrivateGroup: boolean;
  viewerOrgId: string | null;
  churchId?: number | null;
};

export type UserFlags = {
  role: 'pastor' | 'elder' | 'admin' | 'staff' | 'member' | 'youth' | 'child';
  verified: boolean;
  isMinor: boolean;
  displayPref?: 'full' | 'first_last_initial' | 'first' | 'username' | 'anonymous';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isBot?: boolean;
  isAnonymous?: boolean;
};

export type OrgPolicy = 'conservative' | 'balanced' | 'open';

export interface User {
  id: string;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
  role?: string | null | undefined;
  emailVerified?: boolean | null | undefined;
  phoneVerified?: boolean | null | undefined;
  displayPref?: string | null | undefined;
  church?: {
    id: number;
    name: string;
  } | null | undefined;
}

export interface DisplayNameResult {
  displayName: string;
  showHandle: boolean;
  handle: string;
  badge?: string;
  isAnonymous: boolean;
  ariaLabel: string;
}

/**
 * Core function to compose privacy-aware display names
 */
export function composeDisplayName(
  user: User,
  flags: UserFlags,
  context: DisplayContext,
  orgPolicy: OrgPolicy = 'conservative'
): DisplayNameResult {
  // Handle anonymous posts
  if (flags.isAnonymous || flags.displayPref === 'anonymous') {
    return {
      displayName: 'Anonymous',
      showHandle: false,
      handle: '',
      isAnonymous: true,
      ariaLabel: 'Anonymous user post'
    };
  }

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const email = user.email || '';

  // Extract handle from email
  const handle = `@${email.split('@')[0] || 'user'}`;

  // Determine if user is staff (but exclude QA bots so they appear as regular users)
  const isQABot = (user as any).isQaBot === true || (user as any).accountTag === 'QA' ||
                  user.email?.includes('@soapbox-qa.local') || user.id === 'ai-moderation';
  const isStaff = ['pastor', 'elder', 'admin', 'staff'].includes(flags.role) && !isQABot;
  const isVerified = flags.verified || flags.emailVerified || flags.phoneVerified;

  // Determine display policy for this context
  let effectivePolicy = orgPolicy;

  // User can choose MORE private than org setting, not less
  if (flags.displayPref) {
    const userPrefPrivacy = getPrivacyLevel(flags.displayPref);
    const orgPolicyPrivacy = getPrivacyLevel(getDefaultDisplayForPolicy(orgPolicy, context, isStaff));

    // Use user preference only if it's more private
    if (userPrefPrivacy >= orgPolicyPrivacy) {
      effectivePolicy = mapDisplayPrefToPolicy(flags.displayPref);
    }
  }

  // Determine display format based on policy and context
  let displayFormat = getDisplayFormat(effectivePolicy, context, isStaff, flags.isMinor);

  // Override for minors/youth - always first name only for safety
  if (flags.isMinor || flags.role === 'youth' || flags.role === 'child') {
    displayFormat = 'first';
  }

  // Override for staff in all contexts - show full name with badge
  if (isStaff && isVerified) {
    displayFormat = 'full';
  }

  // Generate display name based on format
  let displayName = '';
  let badge = '';

  switch (displayFormat) {
    case 'full':
      displayName = `${firstName} ${lastName}`.trim() || firstName || 'User';
      if (isStaff) {
        badge = getRoleBadge(flags.role, user);
      }
      break;

    case 'first_last_initial':
      const lastInitial = lastName ? ` ${lastName.charAt(0).toUpperCase()}.` : '';
      displayName = `${firstName}${lastInitial}` || firstName || 'User';
      break;

    case 'first':
      displayName = firstName || 'User';
      break;

    case 'username':
      displayName = email.split('@')[0] || 'user';
      break;

    default:
      displayName = firstName || 'User';
  }

  // Handle name collisions by adding disambiguator
  if (isStaff && user.church?.name && displayFormat === 'first_last_initial') {
    displayName += ` - ${user.church.name}`;
  }

  // Determine if we should show handle
  const showHandle = !flags.isMinor && !flags.isAnonymous &&
                    (context.isPublicFeed || (displayFormat !== 'full'));

  // Generate accessible aria-label
  const ariaLabel = generateAriaLabel(displayName, flags.role, isStaff, badge, flags.isMinor);

  return {
    displayName,
    showHandle,
    handle,
    badge,
    isAnonymous: false,
    ariaLabel
  };
}

/**
 * Get privacy level (higher number = more private)
 */
function getPrivacyLevel(displayPref: string): number {
  switch (displayPref) {
    case 'full': return 1;
    case 'first_last_initial': return 2;
    case 'first': return 3;
    case 'username': return 4;
    case 'anonymous': return 5;
    default: return 2;
  }
}

/**
 * Map display preference to equivalent policy
 */
function mapDisplayPrefToPolicy(displayPref: string): OrgPolicy {
  switch (displayPref) {
    case 'full': return 'open';
    case 'first': return 'conservative';
    default: return 'balanced';
  }
}

/**
 * Get default display format for policy and context
 */
function getDefaultDisplayForPolicy(policy: OrgPolicy, context: DisplayContext, isStaff: boolean): string {
  if (isStaff) return 'full';

  switch (policy) {
    case 'conservative':
      return 'first_last_initial';
    case 'balanced':
      return context.isPrivateGroup ? 'full' : 'first_last_initial';
    case 'open':
      return 'full';
    default:
      return 'first_last_initial';
  }
}

/**
 * Determine display format based on policy, context and user flags
 */
function getDisplayFormat(policy: OrgPolicy, context: DisplayContext, isStaff: boolean, isMinor: boolean): string {
  if (isMinor) return 'first';
  if (isStaff) return 'full';

  return getDefaultDisplayForPolicy(policy, context, isStaff);
}

/**
 * Get role badge for staff members (but hide for QA bots)
 */
function getRoleBadge(role: string, user: User): string {
  // Hide role badges for QA bots so they appear as regular users
  if ((user as any).isQaBot === true || (user as any).accountTag === 'QA' ||
      user.email?.includes('@soapbox-qa.local') || user.id === 'ai-moderation') {
    return '';
  }

  switch (role.toLowerCase()) {
    case 'pastor': return 'Pastor';
    case 'elder': return 'Elder';
    case 'admin': return 'Admin';
    case 'staff': return 'Staff';
    default: return '';
  }
}

/**
 * Generate accessible aria-label
 */
function generateAriaLabel(displayName: string, role: string, isStaff: boolean, _badge: string, isMinor: boolean): string {
  let label = `Post by ${displayName}`;

  if (isStaff) {
    label += `, ${role}`;
  }

  if (isMinor) {
    label += `, youth member`;
  }

  return label;
}

/**
 * Format engagement numbers with K/M suffixes
 */
export function formatEngagementCount(count: number): string {
  if (count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const formatted = (count / 1000).toFixed(1);
    return `${formatted.endsWith('.0') ? Math.floor(count / 1000) : formatted}K`;
  }
  const formatted = (count / 1000000).toFixed(1);
  return `${formatted.endsWith('.0') ? Math.floor(count / 1000000) : formatted}M`;
}

/**
 * Get display context based on current route/feed type
 */
export function getDisplayContext(
  feedType: 'public' | 'community' | 'private',
  churchId?: number | null,
  viewerChurchId?: number | null
): DisplayContext {
  return {
    isPublicFeed: feedType === 'public',
    isPrivateGroup: feedType === 'private' || (feedType === 'community' && churchId === viewerChurchId),
    viewerOrgId: viewerChurchId?.toString() || null,
    churchId: churchId || null
  };
}

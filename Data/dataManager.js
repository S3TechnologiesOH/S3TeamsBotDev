const fs = require('fs');

// Load the permissions configuration from JSON
let permissionsConfig;
try {
  const data = fs.readFileSync('./permissions.json', 'utf8');
  permissionsConfig = JSON.parse(data);
} catch (error) {
  console.error('Failed to load permissions.json:', error);
  permissionsConfig = { roles: {}, rolePermissions: {} };
}

const { roles, rolePermissions } = permissionsConfig;

/**
 * Check if a user has permission to access a command group.
 * @param {string} email - The email of the user.
 * @param {string} commandGroup - The group the user wants to access.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
async function hasCommandPermission(email, commandGroup) {
  // Admin override: Check if the user is in the admin role
  const adminUsers = roles.admin || [];
  if (adminUsers.includes(email)) {
    console.log(`Admin override: ${email} has permission to access any group.`);
    return true;
  }

  // Get the user's role
  const userRole = findUserRole(email);
  if (!userRole) {
    console.error(`No role found for user: ${email}`);
    return false;
  }

  // Check if the user's role has access to the command group
  const roleHasAccess = rolePermissions[userRole]?.includes(commandGroup);
  if (roleHasAccess) {
    return true;
  }

  // Fallback: Check if the user has guest access
  const guestUsers = roles.guest || [];
  if (guestUsers.includes(email)) {
    console.log(`Guest access: ${email} has fallback guest permission.`);
    return true;
  }

  console.error(`Permission denied for ${email} to access ${commandGroup}.`);
  return false;
}

/**
 * Find the user's role based on their email.
 * @param {string} email - The email of the user.
 * @returns {string|null} - The role if found, otherwise null.
 */
function findUserRole(email) {
  for (const [role, users] of Object.entries(roles)) {
    if (users.includes(email)) {
      return role;
    }
  }
  return null;
}

module.exports = { hasCommandPermission };

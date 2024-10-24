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
 * @param {string} commandGroup - The command group the user wants to access.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
async function hasCommandPermission(email, commandGroup) {
  // Admin override: Check if the user is in the admin role
  const adminUsers = roles.admin || [];
  if (adminUsers.includes(email)) {
    console.log(`Admin override: ${email} has permission to access any group.`);
    return true;
  }

  // Get all roles for the user
  const userRoles = findUserRoles(email);
  if (userRoles.length === 0) {
    console.error(`No roles found for user: ${email}`);
    return false;
  }

  // Check if any of the user's roles allow access to the command group
  const hasAccess = userRoles.some(role => rolePermissions[role]?.includes(commandGroup));
  if (hasAccess) {
    return true;
  }

  console.error(`Permission denied for ${email} to access ${commandGroup}.`);
  return false;
}

/**
 * Find all roles a user belongs to based on their email.
 * @param {string} email - The email of the user.
 * @returns {string[]} - An array of roles the user belongs to.
 */
function findUserRoles(email) {
  const userRoles = [];
  for (const [role, users] of Object.entries(roles)) {
    if (users.includes(email)) {
      userRoles.push(role);
    }
  }
  return userRoles;
}

module.exports = { hasCommandPermission };

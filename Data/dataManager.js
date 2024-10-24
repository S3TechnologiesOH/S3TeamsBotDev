const fs = require('fs');

// Load the permissions configuration from JSON
const permissionsPath = path.join(__dirname, 'permissions.json');

let permissionsConfig;
try {
  const data = fs.readFileSync(permissionsPath, 'utf8');
  permissionsConfig = JSON.parse(data);
} catch (error) {
  console.error(`Failed to load permissions.json from ${permissionsPath}:`, error);
  permissionsConfig = { roles: {}, commandGroups: {}, rolePermissions: {} };
}
const { roles, commandGroups, rolePermissions } = permissionsConfig;

/**
 * Check if a user has permission to access a command group.
 * @param {string} email - The email of the user.
 * @param {string} commandGroup - The command group the user wants to access.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
async function hasCommandPermission(email, commandGroup) {
  const normalizedEmail = email.trim().toLowerCase();
  console.log("Roles: ", roles);
  console.log("Command Groups: ", commandGroups);
  console.log("Role Permissions: ", rolePermissions);
  // Admin override: Check if the user is in the admin role
  const adminUsers = roles.admin || [];
  if (adminUsers.includes(normalizedEmail)) {
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
 * Find all roles a user belongs to based on their email (case-insensitive).
 * @param {string} email - The email of the user.
 * @returns {string[]} - An array of roles the user belongs to.
 */
function findUserRoles(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const userRoles = [];

  for (const [role, users] of Object.entries(roles)) {
    if (users.some(user => user.trim().toLowerCase() === normalizedEmail)) {
      userRoles.push(role);
    }
  }

  return userRoles;
}

module.exports = { hasCommandPermission };

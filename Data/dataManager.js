const fs = require('fs');
const path = require('path');
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
 * Helper to update the permissions JSON file.
 */

function updatePermissions(roles) {
  let permissionsConfig;
  try {
    permissionsConfig = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));
    permissionsConfig.roles = roles;
    fs.writeFileSync(permissionsPath, JSON.stringify(permissionsConfig, null, 2));
  } catch (error) {
    console.error("Error updating permissions:", error);
  }
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

async function assignUserRole(context, role, email, notify) {
  try {
    const data = fs.readFileSync(permissionsPath, 'utf8');
    const permissionsConfig = JSON.parse(data);

    if (!permissionsConfig.roles[role]) {
      if(notify){
        await context.sendActivity(`Role '${role}' does not exist.`);
      }
      return;
    }

    if (!permissionsConfig.roles[role].includes(email)) {
      permissionsConfig.roles[role].push(email);
      fs.writeFileSync(permissionsPath, JSON.stringify(permissionsConfig, null, 2));
      if(notify){
        await context.sendActivity(`Successfully assigned ${email} to the role '${role}'.`);
      }
    } else {
      if(notify){
        await context.sendActivity(`${email} is already assigned to the role '${role}'.`);
      }
    }
  } catch (error) {
    console.error("Error updating permissions:", error);
    await context.sendActivity("An error occurred while assigning the role. Please try again.");
  }
}

/**
* Check if a user has permission to access a command group.
* @param {string} email - The email of the user.
* @param {string} commandGroup - The command group the user wants to access.
* @returns {boolean} - True if the user has permission, false otherwise.
*/
async function returnAllPermissions(email){

}

async function hasCommandPermission(email, commandGroup) {
  const normalizedEmail = email.trim().toLowerCase();
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
module.exports = { hasCommandPermission, returnAllPermissions, updatePermissions, assignUserRole, permissionsPath };

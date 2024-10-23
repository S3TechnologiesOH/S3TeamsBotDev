const userEmail = undefined;
const userDisplayName = undefined;

const permissions = ["Ticket.Read", "Ticket.Write", "WIP"];
const userPermissions = {
  "catwell@mys3tech.com": ["Ticket.Read", "Ticket.Write"],
  "jlowry@mys3tech.com": ["", "Ticket.Write"], // Fixed the spaces issue
};

module.exports = { userEmail, userDisplayName, permissions, userPermissions };

// Function to check if a user has a specific permission
async function hasCommandPermission(email, permIndex) {
  // Validate the permission index
  if (permIndex < 0 || permIndex >= permissions.length) {
    console.error(`Invalid permission index: ${permIndex}`);
    return false;
  }

  const permissionToCheck = permissions[permIndex];

  // Get the user's permissions or an empty array, trimming spaces from each permission
  const userPerms = (userPermissions[email] || []).map(perm => perm.trim());

  // Check if the required permission exists
  return userPerms.includes(permissionToCheck);
}

module.exports = { hasCommandPermission };

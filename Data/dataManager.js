const userEmail = undefined;
const userDisplayName = undefined;
const permissions = ["Ticket.Read", "Ticket.Write", "WIP"];
const userPermissions = {
    "catwell@mys3tech.com": ["Ticket.Read", "Ticket.Write"],
    "jlowry@mys3tech.com": ["            ", "Ticket.Write"]
  };
module.exports = {userEmail, userDisplayName, permissions, userPermissions};

async function hasCommandPermission(email, permIndex) {
    // Validate the permission index
    if (permIndex < 0 || permIndex >= permissions.length) {
      console.error(`Invalid permission index: ${permIndex}`);
      return false;
    }
  
    const permissionToCheck = permissions[permIndex];
  
    // Check if the user has the required permission
    const userPerms = userPermissions[email] || []; // Get user's permissions or an empty array
    return userPerms.includes(permissionToCheck);
  }
module.exports = { hasCommandPermission };
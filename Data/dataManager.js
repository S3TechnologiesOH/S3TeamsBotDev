const userEmail = undefined;
const userDisplayName = undefined;
const permissions = ["Ticket.Read", "Ticket.Write"];
const userPermissions = [["catwell@mys3tech.com", "Ticket.Read"], ["jlowry@mys3tech.com", ""]];
module.exports = {userEmail, userDisplayName, permissions, userPermissions};

async function hasCommandPermission(email, permIndex){

    if (permIndex < 0 || permIndex >= permissions.length) {
        console.error(`Invalid permission index: ${permIndex}`);
        return false;
      }

    const permissionToCheck = permissions[permIndex];

    return userPermissions.some(
        ([userEmail, userPermission]) =>
          userEmail === email && userPermission === permissionToCheck
      );

}
module.exports = { hasCommandPermission };
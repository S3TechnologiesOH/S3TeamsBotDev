const userEmail = undefined;
const userDisplayName = undefined;
const permissions = ["Ticket.Read", "Ticket.Write"];
const userPermissions = (["catwell@mys3tech.com", "Ticket.Read"], ["jlowry@mys3tech.com", ""]);
module.exports = {userEmail, userDisplayName, permissions, userPermissions};

async function hasCommandPermission(permIndex){
    if(userPermissions.includes(userEmail, permIndex)){
        return true;
    } else {
        return false;
    }
}
module.exports = { hasCommandPermission };
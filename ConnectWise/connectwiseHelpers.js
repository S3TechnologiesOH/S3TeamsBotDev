// Helper function to get an attribute from either an object or dictionary
function get_attr_or_key(data, key) {
    if (data && key in data) {
      return data[key];
    }
    return data ? data[key] : "N/A";
  }
  
  // Helper function to print ticket information
  function print_ticket_info(ticket) {
    return {
      id: get_attr_or_key(ticket, "id"),
      summary: get_attr_or_key(ticket, "summary"),
      status: get_attr_or_key(ticket, "status"),
      company: get_attr_or_key(ticket, "company"),
      assignedTo: get_attr_or_key(ticket, "assignedTo"),
      priority: get_attr_or_key(ticket, "priority"),
    };
  }
  
  module.exports = { get_attr_or_key, print_ticket_info };
  
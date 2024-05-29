import Contact from "../Model/Contact.js";

function listContacts(search = {}) {
  const { filter = {} } = search;
  return Contact.find(filter);
}
function getContact(filter) {
  return Contact.findOne(filter);
}

function removeContact(filter) {
  return Contact.findOneAndDelete(filter);
}

function addContact(data) {
  return Contact.create(data);
}

function updateContact(filter, data) {
  return Contact.findOneAndUpdate(filter, data);
}

function updateStatusContact(filter, body) {
  return Contact.findOneAndUpdate(filter, body);
}

export {
  listContacts,
  getContact,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};

import Contact from "../Model/Contact.js";

function listContacts() {
  return Contact.find();
}

async function getContactById(contactId) {
  const result = await Contact.findById(contactId);

  return result;
}

function removeContact(contactId) {
  return Contact.findByIdAndDelete(contactId);
}

function addContact(data) {
  return Contact.create(data);
}

function updateContactById(contactId, data) {
  return Contact.findByIdAndUpdate(contactId, data);
}

function updateStatusContact(contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body);
}

export {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContactById,
  updateStatusContact,
};

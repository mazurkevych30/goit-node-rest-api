import * as contactsService from "../services/contactsServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  let filter = { owner };
  const fields = "-createdAt -updatedAt";
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  const settings = { skip, limit };
  if (favorite !== undefined) {
    if ((favorite !== "" && favorite === "true") || favorite === "false") {
      filter = {
        ...filter,
        favorite,
      };
    } else {
      throw HttpError(404, "Favorite value must be true or false");
    }
  }

  const result = await contactsService.listContacts({
    filter,
    fields,
    settings,
  });
  const total = await contactsService.countContacts(filter);

  res.json({
    total,
    result,
  });
};

const getOneContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.getContact({ _id, owner });
  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const deleteContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.removeContact({ _id, owner });
  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const createContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await contactsService.addContact({ ...req.body, owner });

  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.updateContact({ _id, owner }, req.body);
  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.updateStatusContact(
    { _id, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};

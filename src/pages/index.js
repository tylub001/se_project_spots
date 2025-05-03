import Api from "../utils/Api.js";
import "./index.css";
import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helper.js";

/*const initialCards = [
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Golden Gate bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
];*/

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "aa3dc09b-4a32-4413-b6a8-5264c7b9cfa3",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    document.querySelector(".profile__name").textContent = userInfo.name;
    document.querySelector(".profile__description").textContent =
      userInfo.about;
    document.querySelector(".profile__avatar").src = userInfo.avatar;
    cards.forEach((item) => {
      renderCard(item);
    });
  })
  .catch(console.error);

//Profile Elements
const profileEditBtn = document.querySelector(".profile__edit-btn");
const profileNewPostBtn = document.querySelector(".profile__add-btn");
const profileAvatar = document.querySelector(".profile__avatar");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

//Modal Containers
const editModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#add-card-modal");
const avatarModal = document.querySelector("#avatar-modal");
const previewModal = document.querySelector("#preview-modal");
const deleteModal = document.querySelector("#delete-modal");

//Edit Modal Elements
const editFormElement = editModal.querySelector(".modal__form");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector("#profile-description-input");

//New Post Modal Elements
const cardFormElement = newPostModal.querySelector(".modal__form");
const cardNameInput = newPostModal.querySelector("#add-card-name-input");
const cardLinkInput = newPostModal.querySelector("#add-card-link-input");
const newPostModalSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

//Avatar Modal Elements
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarBtn = document.querySelector(".profile__avatar-btn");
const avatarInput = document.querySelector("#profile-avatar-input");

//Preview Modal Elements
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

//Delete Confirmation Modal Elements
const deleteForm = deleteModal.querySelector(".modal__delete-form");
const deleteCancelButton = document.querySelector(".modal__cancel-btn");
const deleteCloseBtn = document.querySelector(".delete__close-btn");

//Card & List Elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard = "";
let selectedCardId = "";

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleKeydown);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleKeydown);
}

[deleteCancelButton, deleteCloseBtn].forEach((btn) => {
  btn.addEventListener("click", () => closeModal(deleteModal));
});

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImage = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardRemoveBtn = cardElement.querySelector(".card__remove-btn");

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardNameEl.textContent = data.name;
  cardImage.src = data.link;
  cardImage.alt = data.name;

  function handleLike(evt, id) {
    const isLiked = evt.target.classList.contains("card__like-btn_liked");

    api
      .changeLikeStatus(id, isLiked)
      .then(() => {
        evt.target.classList.toggle("card__like-btn_liked");
      })
      .catch((err) => console.error("Error updating like:", err));
  }

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardImage.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;
  });

  cardRemoveBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  return cardElement;
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Deleting...", "Delete");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Deleting...", "Delete");
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  disableButton(newPostModalSubmitBtn);
  api
    .addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((createdCard) => {
      renderCard(createdCard);
      closeModal(newPostModal);
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

profileEditBtn.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
});

profileNewPostBtn.addEventListener("click", () => {
  openModal(newPostModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleNewPostSubmit);

const closeBtns = document.querySelectorAll(".modal__close-btn");
closeBtns.forEach((btn) => {
  const popup = btn.closest(".modal");
  btn.addEventListener("click", () => closeModal(popup));
});

const modals = document.querySelectorAll(".modal");

avatarBtn.addEventListener("click", () => {
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

modals.forEach((modal) => {
  modal.addEventListener("click", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

function handleKeydown(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function renderCard(data, method = "prepend") {
  const cardElement = getCardElement(data);
  cardsList[method](cardElement);
}

enableValidation(settings);

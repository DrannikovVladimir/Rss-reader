import onChange from 'on-change';
import {
  renderFeeds,
  renderPosts,
  renderFeedback,
  renderContentElements,
  updateModal,
  updateUiLinks,
} from './render';

const rssLoadingHandler = (state, value, elements, i18next) => {
  const { input, submit } = elements;
  const { rssLoading: { error } } = state;
  switch (value) {
    case 'sending':
      input.setAttribute('readonly', true);
      submit.setAttribute('disabled', 'disabled');
      break;
    case 'failed':
      renderFeedback(error, elements, i18next);
      input.classList.add('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      break;
    case 'finished':
      renderFeedback(null, elements, i18next);
      input.classList.remove('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

const formStateHandler = (state, value, elements, i18next) => {
  const { rssForm: { error } } = state;
  const { input, form } = elements;
  switch (value.status) {
    case 'validated':
      input.classList.remove('is-invalid');
      form.reset();
      break;
    case 'failed':
      renderFeedback(error, elements, i18next);
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

export default (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssLoading.status':
        rssLoadingHandler(state, value, elements, i18next);
        break;
      case 'appStatus':
        renderContentElements(elements, i18next);
        break;
      case 'rssForm':
        formStateHandler(state, value, elements, i18next);
        break;
      case 'feeds':
        renderFeeds(value, elements, i18next);
        break;
      case 'posts':
        renderPosts(state, value, elements, i18next);
        break;
      case 'uiState.modal.currentPost':
        updateModal(value, elements, i18next);
        break;
      case 'uiState.viewedPosts':
        updateUiLinks(value, elements, i18next);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

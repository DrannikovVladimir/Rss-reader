import onChange from 'on-change';
import {
  renderFeeds,
  renderPosts,
  renderFeedback,
  renderContentElements,
  updateModal,
  updateUiLinks,
} from './render';

const formStateHandler = (state, value, elements) => {
  const { rssForm: { error } } = state;
  const { processError } = state;
  const { input, submit, form } = elements;
  switch (value) {
    case 'validated':
      submit.setAttribute('disabled', 'disabled');
      input.setAttribute('readonly', true);
      break;
    case 'filling':
      break;
    case 'sending':
      break;
    case 'finished':
      renderFeedback(null, elements);
      input.classList.remove('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      form.reset();
      break;
    case 'failed':
      renderFeedback(error || processError, elements);
      input.classList.add('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

export default (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'appStatus':
        renderContentElements(elements);
        break;
      case 'rssForm.status':
        formStateHandler(state, value, elements);
        break;
      case 'feeds':
        renderFeeds(value, elements);
        break;
      case 'posts':
        renderPosts(state, value, elements);
        break;
      case 'uiState.modal.currentPost':
        updateModal(value, elements);
        break;
      case 'uiState.viewedPosts':
        updateUiLinks(value, elements);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

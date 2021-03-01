import onChange from 'on-change';
import {
  renderFeeds,
  renderPosts,
  renderFeedback,
  renderContentElements,
  updateModal,
  updateUiLinks,
} from './render';

const rssLoadingHandler = (state, value, elements) => {
  const { input, submit } = elements;
  const { rssLoading: { error } } = state;
  switch (value) {
    case 'waiting':
      break;
    case 'failed':
      renderFeedback(error, elements);
      input.classList.add('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      break;
    case 'finished':
      renderFeedback(null, elements);
      input.classList.remove('is-invalid');
      input.removeAttribute('readonly');
      submit.removeAttribute('disabled', 'disabled');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

const formStateHandler = (state, value, elements) => {
  const { rssForm: { error } } = state;
  const { input, form } = elements;
  switch (value.status) {
    case 'validated':
      input.classList.remove('is-invalid');
      form.reset();
      break;
    case 'failed':
      renderFeedback(error, elements);
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

export default (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(path);
    switch (path) {
      case 'rssLoading.status':
        rssLoadingHandler(state, value, elements);
        break;
      case 'appStatus':
        renderContentElements(elements);
        break;
      case 'rssForm':
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

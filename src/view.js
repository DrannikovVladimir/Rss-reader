import onChange from 'on-change';
import render from './render';

const {
  renderFeeds,
  renderPosts,
  renderFeedback,
  renderContentElements,
  updateModal,
  updateUiLinks,
} = render();

const formStateHandler = (state, value, elements) => {
  const { rssForm: { fields: { name: { error } } } } = state;
  const { input, submit, form } = elements;
  switch (value) {
    case 'init':
      renderContentElements(elements);
      break;
    case 'filling':
      submit.removeAttribute('disabled', 'disabled');
      form.reset();
      break;
    case 'sending':
      submit.setAttribute('disabled', 'disabled');
      input.setAttribute('readonly', '');
      break;
    case 'finished':
      renderFeedback(null, elements);
      input.classList.remove('is-invalid');
      input.removeAttribute('readonly');
      break;
    case 'failed':
      renderFeedback(error, elements);
      input.classList.add('is-invalid');
      input.removeAttribute('readonly');
      break;
    default:
      throw new Error(`${value} is unknown state!`);
  }
};

export default (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    // console.log(path, value);
    switch (path) {
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

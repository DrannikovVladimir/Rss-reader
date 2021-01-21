import onChange from 'on-change';
import {
  renderFeeds,
  renderPosts,
  renderFeedback,
  renderContentElements,
} from './render';

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
      input.classList.remove('is-invalid');
      break;
    case 'finished':
      renderFeedback(null, elements);
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
    switch (path) {
      case 'rssForm.status':
        formStateHandler(state, value, elements);
        break;
      case 'feeds':
        renderFeeds(value, elements);
        break;
      case 'posts':
        renderPosts(value, elements);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

import onChange from 'on-change';
import {
  renderFeeds,
  renderPosts,
  renderError,
  renderSuccess,
} from './render';

const handlerStateForm = (formStatus, elements) => {
  const { input, form } = elements;
  switch (formStatus) {
    case 'filling':
      input.value = '';
      break;
    case 'sending':
      input.select();
      form.reset();
      break;
    case 'failed':
      break;
    default:
      throw new Error(`Unknown status ${formStatus}`);
  }
};

export default (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.status':
        elements.input.classList.remove('is-invalid');
        handlerStateForm(value, elements);
        break;
      case 'rssForm.fields.name.error':
        elements.input.classList.add('is-invalid');
        renderError(value, elements);
        break;
      case 'feeds':
        elements.input.classList.remove('is-invalid');
        renderFeeds(value, elements);
        renderSuccess(elements);
        break;
      case 'posts':
        elements.input.classList.remove('is-invalid');
        renderPosts(value, elements);
        renderSuccess(elements);
        break;
      case 'rssForm.processError':
        elements.input.classList.remove('is-invalid');
        renderError(value, elements);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

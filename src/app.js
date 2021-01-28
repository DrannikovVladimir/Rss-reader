import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales';
import watchedState from './view';
import { getNewFeed, updateFeed } from './rss';

const validateSync = (url, feeds) => {
  const links = feeds.map((feed) => feed.link);
  const schema = yup.string().required().url().notOneOf(links);
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err.message;
  }
};

const updateValidationState = (url, watched) => {
  const { feeds, rssForm } = watched;
  const error = validateSync(url, feeds);
  if (error) {
    rssForm.valid = false;
    rssForm.error = error;
    rssForm.status = 'failed';
    return;
  }
  rssForm.valid = true;
  rssForm.error = null;
  rssForm.status = 'validated';
};

const update = (watched) => {
  const { posts, feeds } = watched;
  updateFeed(posts, feeds)
    .then((newPosts) => {
      watched.posts.unshift(...newPosts);
    })
    .catch((err) => {
      throw err.message;
    })
    .finally(() => {
      setTimeout(() => update(watched), 5000);
    });
};

export default () => {
  const state = {
    feeds: [],
    posts: [],
    rssForm: {
      status: 'filling',
      valid: false,
      error: null,
    },
    processError: null,
    uiState: {
      viewedPosts: new Set(),
      modal: {
        currentPost: null,
      },
    },
  };

  const elements = {
    appName: document.querySelector('.display-3'),
    appLead: document.querySelector('.lead'),
    appExample: document.querySelector('.my-1'),
    appCopy: document.querySelector('footer span a'),
    appFeedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input[name="url"]'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLinkPost: document.querySelector('a.full-article'),
    modalClose: document.querySelector('button.close-btn'),
  };

  const watched = watchedState(state, elements);

  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    watched.rssForm.status = 'filling';
    const formData = new FormData(evt.target);
    const url = formData.get('url');
    updateValidationState(url, watched);
    if (!watched.rssForm.valid) {
      return;
    }
    getNewFeed(url)
      .then((data) => {
        const { feed, posts } = data;
        watched.feeds.unshift(feed);
        watched.posts.unshift(...posts);
        watched.rssForm.status = 'finished';
      })
      .catch((err) => {
        watched.processError = err.message;
        watched.rssForm.status = 'failed';
      })
      .finally(() => {
        watched.rssForm.status = 'filling';
      });
  });

  elements.posts.addEventListener('click', (evt) => {
    if (evt.target.tagName.toLowerCase() !== 'button') {
      return;
    }
    const currentId = evt.target.getAttribute('data-id');
    const currentPost = watched.posts.find((post) => post.id === currentId);
    watched.uiState.viewedPosts.add(currentId);
    watched.uiState.modal.currentPost = currentPost;
  });

  update(watched);

  return i18next.init({
    lng: 'en',
    resources,
  }).then(() => {
    watched.rssForm.status = 'init';

    yup.setLocale({
      mixed: {
        required: i18next.t('rssForm.feedback.required'),
        notOneOf: i18next.t('rssForm.feedback.double'),
      },
      string: {
        url: i18next.t('rssForm.feedback.url'),
      },
    });
  });
};

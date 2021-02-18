import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales';
import watchedState from './view';
import { getNewFeed, updateFeed } from './rss';

i18next.init({
  lng: 'ru',
  resources,
});

yup.setLocale({
  mixed: {
    required: 'rssForm.feedback.required',
    notOneOf: 'rssForm.feedback.double',
  },
  string: {
    url: 'rssForm.feedback.url',
  },
});

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
    rssForm.status = 'filling';
    return;
  }
  rssForm.valid = true;
  rssForm.error = null;
  rssForm.status = 'validated';
  rssForm.status = 'filling';
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
    appStatus: 'waiting',
    feeds: [],
    posts: [],
    rssLoading: {
      status: 'waiting',
      processError: null,
    },
    rssForm: {
      status: 'filling',
      valid: false,
      error: null,
    },
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
        watched.rssLoading.status = 'finished';
      })
      .catch(() => {
        watched.rssLoading.processError = 'rssForm.feedback.networkError';
        watched.rssLoading.status = 'failed';
      })
      .finally(() => {
        watched.rssLoading.status = 'waiting';
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

  watched.appStatus = 'init';
  update(state);
};

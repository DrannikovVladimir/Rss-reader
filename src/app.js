import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales';
import watchedState from './view';
import { getNewFeed, updateFeed } from './rss';

const validate = (link, feeds) => {
  const links = feeds.map((feed) => feed.link);
  return yup
    .string()
    .required()
    .url()
    .notOneOf(links)
    .validate(link, { abortEarly: false });
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
      processError: null,
      status: 'filling',
      valid: false,
      fields: {
        name: {
          error: null,
        },
      },
    },
    update: {
      state: 'waiting',
    },
    uiState: {
      viewedPosts: [],
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
    const { feeds } = watched;
    watched.rssForm.status = 'filling';
    validate(url, feeds)
      .then(() => {
        watched.rssForm.valid = true;
        watched.rssForm.fields.name.error = null;
        watched.rssForm.status = 'sending';
        return getNewFeed(url);
      })
      .then((data) => {
        const { feed, posts } = data;
        watched.feeds.unshift(feed);
        watched.posts.unshift(...posts);
        watched.rssForm.status = 'finished';
      })
      .catch((err) => {
        console.log(err);
        watched.rssForm.valid = false;
        watched.rssForm.fields.name.error = err.message;
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
    if (!watched.uiState.viewedPosts.includes(currentId)) {
      watched.uiState.viewedPosts.push(currentId);
    }
    watched.uiState.modal.currentPost = currentPost;
  });

  i18next.init({
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

    update(watched);
  });
};

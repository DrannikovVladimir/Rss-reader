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
  };

  const watched = watchedState(state, elements);

  const update = () => {
    const { posts, feeds } = watched;
    updateFeed(posts, feeds)
      .then((newPosts) => {
        console.log(newPosts);
        watched.posts.unshift(...newPosts);
        watched.update.state = 'processed';
      })
      .catch((err) => {
        console.log(err.message);
        watched.update.state = 'failed';
      })
      .finally(() => {
        setTimeout(update, 30000);
        watched.update.state = 'waiting';
      });
  };

  i18next.init({
    lng: 'en',
    resources,
  }).then(() => {
    console.log('initialized');
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

    elements.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const formData = new FormData(evt.target);
      const url = formData.get('url');
      const { feeds } = watched;
      watched.rssForm.statu = 'filling';
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
          watched.rssForm.valid = false;
          watched.rssForm.fields.name.error = err.message;
          watched.rssForm.status = 'failed';
        })
        .finally(() => {
          watched.rssForm.status = 'filling';
        });
    });

    update(watched);
  });
};

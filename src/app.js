import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales';
import parser from './parser';
import watchedState from './view';
import { renderContentElements } from './render';

const proxy = 'https://api.allorigins.win/raw?url';
const getUrl = (link) => `${proxy}=${link}`;

const validateUrl = (state, url) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(state.links)

  return schema.validate(url)
    .then(() => true)
    .catch((err) => {
      const [textError] = err.errors;
      const { rssForm } = state;
      rssForm.fields.name.error = textError;
      return false;
    });
};

const getData = (urlRss, watched) => {
  const {
    rssForm,
    feeds,
    posts,
  } = watched;

  return axios.get(urlRss)
    .then((response) => {
      rssForm.status = 'sending';
      return parser(response.data);
    })
    .catch((err) => {
      rssForm.status = 'failed';
      rssForm.processError = i18next.t('rssForm.feedback.networkError');
      throw new Error(err);
    })
    .then((data) => {
      rssForm.status = 'filling';
      const { feedsData, postsData } = data;
      feeds.unshift(feedsData);
      posts.unshift(...postsData);
    });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    console.log('initialized');
    renderContentElements(elements);
  });

  yup.setLocale({
    mixed: {
      required: i18next.t('rssForm.feedback.required'),
      notOneOf: i18next.t('rssForm.feedback.double'),
    },
    string: {
      url: i18next.t('rssForm.feedback.url'),
    },
  });

  const state = {
    feeds: [],
    posts: [],
    links: [],
    rssForm: {
      processError: null,
      status: 'filling',
      valid: false,
      fields: {
        name: {
          value: '',
          error: null,
        },
      },
    },
  };

  const elements = {
    appName: document.querySelector('.display-3'),
    appLead: document.querySelector('.lead'),
    appExample: document.querySelector('.my-1'),
    appCopy: document.querySelector('footer span a'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input[name="url"]'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watched = watchedState(state, elements);

  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const value = formData.get('url');
    const validUrl = validateUrl(watched, value);
    validUrl.then((isValid) => {
      if (!isValid) {
        watched.rssForm.valid = false;
        watched.rssForm.fields.name.value = '';
        return;
      }
      const urlRss = getUrl(value);
      watched.links.push(value);
      watched.rssForm.valid = true;
      watched.rssForm.fields.name.value = value;
      watched.rssForm.fields.name.error = null;
      getData(urlRss, watched);
    });
  });
};

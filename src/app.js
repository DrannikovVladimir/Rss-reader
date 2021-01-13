import axios from 'axios';
import * as yup from 'yup';
import parser from './parser';
import watchedState from './view';

const schema = yup.string().trim().url().required();
const proxy = 'https://api.allorigins.win/raw?url';
const getUrl = (link) => `${proxy}=${link}`;

const validateUrl = (state, url) => schema.validate(url)
  .then(() => true)
  .catch((err) => {
    const [textError] = err.errors;
    const { rssForm } = state;
    rssForm.fields.name.error = textError;
    return false;
  });

const findSameFeed = (state, url) => {
  if (state.feeds.length === 0) {
    return null;
  }
  const links = state.feeds.map((feed) => feed.link);
  return links.includes(url);
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
      return parser(response.data, urlRss);
    })
    .catch((err) => {
      rssForm.status = 'failed';
      rssForm.processError = 'Network error!';
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
  const state = {
    feeds: [],
    posts: [],
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
      const sameFeed = findSameFeed(watched, urlRss);
      if (sameFeed) {
        watched.rssForm.valid = false;
        watched.rssForm.fields.name.value = '';
        watched.rssForm.fields.name.error = 'Rss already exists';
        return;
      }
      watched.rssForm.valid = true;
      watched.rssForm.fields.name.value = value;
      watched.rssForm.fields.name.error = null;
      getData(urlRss, watched);
    });
  });
};

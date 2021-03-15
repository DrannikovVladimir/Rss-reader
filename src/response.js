import axios from 'axios';

const PROXY = 'https://hexlet-allorigins.herokuapp.com/get?';

export default (link) => {
  const url = new URL(PROXY);
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return axios.get(url.href, { timeout: 5000 })
    .then((response) => response)
    .catch(() => {
      const error = new Error('Network error');
      error.type = 'network';
      throw error;
    });
};

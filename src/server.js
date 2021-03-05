import axios from 'axios';

const PROXY = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url';
const getUrl = (link) => `${PROXY}=${link}`;

export default (link) => {
  const url = getUrl(link);
  return axios.get(url, { timeout: 5000 })
    .then((response) => response)
    .catch(() => {
      const error = new Error('Network error');
      error.type = 'network';
      throw error;
    });
};

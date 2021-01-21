import axios from 'axios';

const PROXY = 'https://api.allorigins.win/raw?url';
const getUrl = (link) => `${PROXY}=${link}`;

export default (link) => {
  const url = getUrl(link);
  return axios.get(url, { timeout: 5000 })
    .then((response) => response)
    .catch((err) => {
      console.log(err.response);
      throw err;
    });
};

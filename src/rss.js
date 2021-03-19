import axios from 'axios';
import _ from 'lodash';
import parse from './parser';

const addProxy = (link) => {
  const PROXY = 'https://hexlet-allorigins.herokuapp.com/get?';
  const url = new URL(PROXY);
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return url.href;
};

const getContents = (link) => axios.get(addProxy(link), { timeout: 5000 })
  .catch((err) => {
    const error = new Error(err.message);
    error.type = 'network';
    throw error;
  });

const getData = (link) => getContents(link)
  .then(({ data: { contents } }) => parse(contents));

const makeFeed = (feed, link) => {
  const {
    title,
    description,
  } = feed;
  const id = _.uniqueId();
  return {
    id,
    link,
    title,
    description,
  };
};

const makePosts = (feedId, posts) => posts.map((post) => {
  const {
    link,
    title,
    description,
  } = post;
  const id = _.uniqueId();
  return {
    id,
    feedId,
    link,
    title,
    description,
  };
});

const getNewFeed = (link) => getData(link)
  .then((data) => {
    const { channel, list } = data;
    const feed = makeFeed(channel, link);
    const { id: feedId } = feed;
    const posts = makePosts(feedId, list);
    return { feed, posts };
  });

const comparator = (item, post) => item.link === post.link
  && item.description === post.description;

const updateFeeds = (posts, feeds) => {
  const promises = feeds.map((feed) => {
    const { id, link } = feed;
    return getData(link)
      .then((data) => {
        const { list } = data;
        const existedPosts = posts.filter((post) => post.feedId === id);
        const newPostsLinks = _.differenceWith(list, existedPosts, comparator);
        return makePosts(id, newPostsLinks);
      })
      .catch((err) => ({ result: 'error', error: err }));
  });

  const promise = Promise.all(promises).then((data) => _.flatten(data));
  return promise;
};

export {
  getNewFeed,
  updateFeeds,
};

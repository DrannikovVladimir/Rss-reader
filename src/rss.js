import _ from 'lodash';
import getRSS from './response';
import parse from './parser';

const getData = (link) => getRSS(link).then((response) => {
  const { data: { contents } } = response;
  return parse(contents);
});

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
      });
  });

  const promise = Promise.all(promises).then((data) => _.flatten(data));
  return promise;
};

export {
  getNewFeed,
  updateFeeds,
};

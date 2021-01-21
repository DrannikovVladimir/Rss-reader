import _ from 'lodash';
import getRSS from './server';
import parse from './parser';

const getData = (link) => getRSS(link).then((data) => parse(data));

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
    const { feedsData, postsData } = data;
    const feed = makeFeed(feedsData, link);
    const { id: feedId } = feed;
    const posts = makePosts(feedId, postsData);
    return { feed, posts };
  });

const postsComparator = (postData, existedPost) => postData.link === existedPost.link
  && postData.description === existedPost.description;

const updateFeed = (posts, feeds) => {
  const promises = feeds.map((feed) => {
    const { id, link } = feed;
    return getData(link)
      .then((data) => {
        const { postsData } = data;
        const existedPosts = posts.filter((post) => post.feedId === id);
        const newPostsLinks = _.differenceWith(postsData, existedPosts, postsComparator);
        return makePosts(id, newPostsLinks);
      });
  });

  const promise = Promise.all(promises).then((data) => _.flatten(data));
  return promise;
};

export {
  getNewFeed,
  updateFeed,
};

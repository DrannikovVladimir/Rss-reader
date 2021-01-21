import i18next from 'i18next';

const renderContentElements = (elements) => {
  const {
    appName,
    appLead,
    input,
    submit,
    appExample,
    appCopy,
  } = elements;

  appName.textContent = i18next.t('appName');
  appLead.textContent = i18next.t('appLead');
  input.setAttribute('placeholder', i18next.t('rssForm.placeholder'));
  submit.textContent = i18next.t('rssForm.button');
  appExample.textContent = i18next.t('appExample');
  appCopy.textContent = i18next.t('appCopy');
};

const createPost = (post, id) => {
  const {
    title,
    link,
  } = post;
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const a = document.createElement('a');
  a.classList.add('font-weight-bold');
  a.setAttribute('href', link);
  a.textContent = title;
  a.setAttribute('data-id', id);
  a.setAttribute('target', '_blank');

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.type = 'button';
  button.textContent = i18next.t('rssList.button');
  button.setAttribute('data-id', id);

  li.append(a, button);
  return li;
};

const createFeed = (feed) => {
  const { title, description } = feed;

  const itemFeed = document.createElement('li');
  itemFeed.classList.add('list-group-item');

  const titleFeed = document.createElement('h3');
  titleFeed.textContent = title;

  const descriptionFeed = document.createElement('p');
  descriptionFeed.textContent = description;

  itemFeed.append(titleFeed, descriptionFeed);
  return itemFeed;
};

const renderPosts = (posts, elements) => {
  if (posts.length === 0) {
    return;
  }
  const container = elements.posts;
  container.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18next.t('rssList.postsTitle');
  elements.posts.appendChild(postsTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');

  posts.forEach((post) => {
    const postItem = createPost(post);
    postsList.appendChild(postItem);
  });

  elements.posts.appendChild(postsList);
};

const renderFeeds = (feeds, elements) => {
  const container = elements.feeds;
  container.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18next.t('rssList.feedsTitle');
  elements.feeds.appendChild(feedsTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'mb-5');

  feeds.forEach((feed) => {
    const feedItem = createFeed(feed);
    feedsList.appendChild(feedItem);
  });

  elements.feeds.appendChild(feedsList);
};

const renderFeedback = (error, elements) => {
  const { appFeedback } = elements;
  appFeedback.classList.remove('text-danger', 'text-success');
  appFeedback.textContent = '';
  const feedbackText = error || i18next.t('rssForm.feedback.success');
  const feedbackColor = error ? 'text-danger' : 'text-success';
  appFeedback.classList.add(feedbackColor);
  appFeedback.textContent = feedbackText;
};

export {
  renderContentElements,
  renderFeeds,
  renderPosts,
  renderFeedback,
};

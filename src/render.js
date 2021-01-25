import i18next from 'i18next';

export default () => {
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

  const updateModal = (post, elements) => {
    const {
      title,
      description,
      link,
    } = post;

    const {
      modalTitle,
      modalBody,
      modalLinkPost,
      modalClose,
    } = elements;

    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLinkPost.setAttribute('href', link);
    modalLinkPost.textContent = i18next.t('modal.link');
    modalClose.textContent = i18next.t('modal.close');
  };

  const updateUiLinks = (viewedPosts, elements) => {
    const { posts } = elements;
    viewedPosts.forEach((viewedPost) => {
      const currentLink = posts.querySelector(`[data-id="${viewedPost}"]`);
      currentLink.classList.remove('font-weight-bold');
      currentLink.classList.add('font-weight-normal');
    });
  };

  const createButtonPreview = (id) => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm', 'preview');
    button.setAttribute('type', 'button');
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-id', id);
    button.setAttribute('data-target', '#modal');
    button.textContent = i18next.t('rssList.button');

    return button;
  };

  const createPost = (title, link, id, isViewed) => {
    const a = document.createElement('a');
    const fontWeigth = isViewed ? 'font-weight-normal' : 'font-weight-bold';
    a.classList.add(fontWeigth);
    a.setAttribute('href', link);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;

    return a;
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

  const renderPosts = (state, posts, elements) => {
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
      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
      );
      const { id, title, link } = post;
      const postLink = createPost(title, link, id);
      const buttonPreview = createButtonPreview(id);

      li.append(postLink, buttonPreview);
      postsList.appendChild(li);
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
    appFeedback.textContent = feedbackText.trim();
  };

  return {
    renderFeeds,
    renderPosts,
    renderFeedback,
    renderContentElements,
    updateModal,
    updateUiLinks,
  };
};

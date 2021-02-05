export default (contents) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  const error = document.querySelector('parsererror');
  if (error) {
    const err = new Error('rssForm.feedback.validRss');
    throw err;
  }
  const titleChannel = document.querySelector('title').textContent;
  const descriptionChannel = document.querySelector('description').textContent;
  const channel = { title: titleChannel, description: descriptionChannel };

  const items = document.querySelectorAll('item');
  const list = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return {
      title,
      link,
      description,
    };
  });

  return ({
    channel,
    list,
  });
};

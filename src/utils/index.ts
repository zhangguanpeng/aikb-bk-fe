export const arrayToTreeLoop = (nodes: any[]) => {
  const map: any = {};
  const tree = [];

  for (const node of nodes) {
    //@ts-ignore
    map[node.id] = {
      key: node.id,
      value: node.id,
      title: node.name || '默认类目',
      label: node.name || '默认类目',
      parentId: node.parentId || '',
      children: [],
    };
  }

  console.log('node map', map);
  for (const node of Object.values(map)) {
    // @ts-ignore
    if (!node.parentId) {
      tree.push(node);
    } else {
      // console.log('node', node);
      // console.log('map[node.parentId]', map[node.parentId]);
      // @ts-ignore
      map[node.parentId].children.push(node);
    }
  }

  return tree;
};

export const setCookie = (key: string, value: string, expiresDays: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
  // date.setTime(date.getTime() + (2 * 60 * 1000));
  document.cookie = `${key}=${value};expires=${date.toUTCString()}`
}

export const getCookie = (key: string) => {
  const cookieStr = document.cookie;
  const arr = cookieStr.split('; ');
  let cookieValue = '';
  for (let i = 0; i < arr.length; i++) {
    const temp = arr[i].split('=');
    if (temp[0] === key) {
      cookieValue = temp[1];
      break
    }
  }
  return cookieValue;
};

export const parseUrlParams = () => {
  const url = window.location.href;
  const paramsObj: any = {};
  const queryString = url.split('?')[1];
  if (queryString) {
    const paramPairs = queryString.split('&');
    paramPairs.forEach(paramPair => {
      const [key, value] = paramPair.split('=');
      paramsObj[key] = value ? decodeURIComponent(value) : '';
    });
  }
  return paramsObj;
}

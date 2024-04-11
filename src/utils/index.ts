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

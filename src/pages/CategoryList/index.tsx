import { addCategory, deleteCategory, getCategoryData, updateCategory } from '@/services/aikb/api';
import { DeleteOutlined, EditOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Tree } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { DataNode, TreeProps } from 'antd/es/tree';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';

const x = 3;
const y = 2;
const z = 1;
const defaultData: DataNode[] = [];

const generateData = (_level: number, _preKey?: React.Key, _tns?: DataNode[]) => {
  const preKey = _preKey || '0';
  const tns = _tns || defaultData;

  const children: React.Key[] = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: DataNode[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(defaultData);

console.log('dataList', dataList);

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const arrayToTreeLoop = (nodes: any[]) => {
  const map: any = {};
  const tree = [];

  for (const node of nodes) {
    //@ts-ignore
    map[node.id] = {
      key: node.id,
      title: node.name || '默认类目',
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

const CategoryList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [formInModal] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [currentCheckedKey, setCurrentCheckedKey] = useState('');
  const [treeDataList, setTreeDataList] = useState([]);
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');

  const fetchCategoryData = () => {
    getCategoryData()
      .then((res) => {
        console.log('类目列表res', res);
        const treeData = arrayToTreeLoop(res.payload);
        // console.log('接口treeData', treeData);
        //@ts-ignore
        setTreeDataList(treeData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onFinish = (values: any) => {
    console.log(values);

    const { categoryName = '' } = values;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(categoryName) > -1) {
          return getParentKey(item.key, defaultData);
        }
        return null;
      })
      .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));
    setExpandedKeys(newExpandedKeys);
    setSearchValue(categoryName);
    setAutoExpandParent(true);
  };

  const treeData = useMemo(() => {
    const loop = (data: DataNode[]): DataNode[] =>
      data.map((item) => {
        const strTitle = (item.title as string) || '';
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,
        };
      });

    return loop(treeDataList);
  }, [treeDataList, searchValue]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    // @ts-ignore
    setCurrentCheckedKey(selectedKeys[0]);
  };

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = async () => {
    const hide = message.loading('正在删除');
    // if (!selectedRows) return true;
    try {
      await deleteCategory(currentCheckedKey);
      hide();
      message.success('删除成功');
      fetchCategoryData();
      return true;
    } catch (error) {
      hide();
      message.error('删除失败');
      return false;
    }
  };

  const handleAdd = async (categoryName: string) => {
    const hide = message.loading('正在处理');
    // if (!selectedRows) return true;
    try {
      const params = {
        name: categoryName,
        parentId: currentCheckedKey,
      };
      await addCategory(params);
      hide();
      message.success('操作成功');
      setCategoryModalShow(false);
      fetchCategoryData();
      return true;
    } catch (error) {
      hide();
      message.error('操作失败');
      return false;
    }
  };

  const handleUpdate = async (categoryName: string) => {
    const hide = message.loading('正在处理');
    // if (!selectedRows) return true;
    try {
      const params = {
        name: categoryName,
      };
      await updateCategory(currentCheckedKey, params);
      hide();
      message.success('操作成功');
      setCategoryModalShow(false);
      fetchCategoryData();
      return true;
    } catch (error) {
      hide();
      message.error('操作失败');
      return false;
    }
  };

  /**
   *  Delete node
   * @zh-CN 增加子节点
   *
   * @param selectedRows
   */
  const handleAddCategoryOk = () => {
    console.log('formInModal', formInModal.getFieldsValue());
    const { categoryName } = formInModal.getFieldsValue();
    if (actionType === 'add') {
      handleAdd(categoryName);
    } else {
      handleUpdate(categoryName);
    }
  };

  return (
    <div className="category-page">
      <h1>类目管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          name="control-ref"
          onFinish={onFinish}
        >
          <Form.Item name="categoryName" label="类目名称">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            {/* <Button htmlType="button" onClick={onReset}>
							Reset
						</Button> */}
          </Form.Item>
        </Form>
      </div>
      <div className="btn-box">
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          disabled={!currentCheckedKey}
          onClick={handleRemove}
        >
          删除类目
        </Button>
        <Button
          type="link"
          icon={<EditOutlined />}
          disabled={!currentCheckedKey}
          onClick={() => {
            setActionType('update');
            setCategoryModalShow(true);
          }}
        >
          修改类目
        </Button>
        <Button
          type="link"
          icon={<FileAddOutlined />}
          disabled={!currentCheckedKey}
          onClick={() => {
            setActionType('add');
            setCategoryModalShow(true);
          }}
        >
          增加子类目
        </Button>
      </div>
      <div className="common-box">
        {treeData && (
          <Tree
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            treeData={treeData}
            // checkable
            onSelect={onSelect}
            // onCheck={onCheck}
          />
        )}
      </div>
      <Modal
        title={actionType === 'add' ? '增加类目' : '修改类目'}
        open={categoryModalShow}
        onOk={handleAddCategoryOk}
        onCancel={() => {
          setCategoryModalShow(false);
        }}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form layout="inline" form={formInModal} name="control-ref" onFinish={onFinish}>
            <Form.Item name="categoryName" label="类目名称">
              <Input />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;

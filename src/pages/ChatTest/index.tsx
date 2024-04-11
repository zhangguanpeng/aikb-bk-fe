import { getCategoryData, getDocumentData, getTextData } from '@/services/aikb/api';
import { arrayToTreeLoop } from '@/utils';
import { Button, Form, Input, Select, Space, Spin, TreeSelect } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import './index.less';

const ChatTest: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();

  const [treeData, setTreeData] = useState([]);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategoryData = () => {
    getCategoryData()
      .then((res) => {
        console.log('类目列表res', res);
        const treeData = arrayToTreeLoop(res.payload);
        // console.log('接口treeData', treeData);
        //@ts-ignore
        setTreeData(treeData);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const fetchDocumentData = (categoryId?: string) => {
    const params = {
      'categoryId.id': categoryId || '',
      name: '',
      page: 1,
      size: 100000,
      sort: 'createdDate,desc',
    };
    getDocumentData(params)
      .then((res) => {
        console.log('文档列表res', res);
        const { payload = [] } = res;
        const documentOptions = payload.map((docItem: any) => {
          const docOption = {
            label: docItem.name,
            value: docItem.id,
          };

          return docOption;
        });
        setDocumentOptions(documentOptions);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchCategoryData();
    fetchDocumentData();
  }, []);

  const handleInputChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const handleDocChange = () => {};

  const getSearchAnswer = () => {
    console.log('form.getFieldsValue()', form.getFieldsValue());
    const { categoryId, documentId } = form.getFieldsValue();

    const params = {
      categoryIds: categoryId ? [categoryId] : [],
      text: searchText,
      documentIds: documentId ? documentId : [],
    };

    setLoading(true);
    getTextData(params)
      .then((res) => {
        console.log('文本搜索res', res);
        const resData = res.payload || {};
        setKnowledgeData(resData);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const onTreeChange = (newTreeValue: string) => {
    console.log('newTreeValue', newTreeValue);
    fetchDocumentData(newTreeValue);
    setSelectedCategory(newTreeValue);
  };

  const downloadFile = (url: string) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadFile = (id: number) => {
    downloadFile(`/aikb/v1/doc/download?id=${id}`);
  };

  const { reference = [] } = (knowledgeData || [])[0] || {};

  return (
    <div className="chattest-page">
      {/* <Breadcrumb itemRender={itemRender} items={items} />; */}
      <h1>对话测试</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={form}
          name="control-ref"
          // onFinish={onFinish}
        >
          <Form.Item name="categoryId" label="类目">
            <TreeSelect
              showSearch
              style={{ width: 200 }}
              value={selectedCategory}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto', width: 200 }}
              placeholder="请选择"
              allowClear
              treeDefaultExpandAll
              onChange={onTreeChange}
              treeData={treeData}
            />
          </Form.Item>
          <Form.Item name="documentId" label="文档名称">
            <Select
              mode="multiple"
              allowClear
              style={{ width: 200 }}
              placeholder="请选择"
              defaultValue={[]}
              onChange={handleDocChange}
              options={documentOptions}
            />
          </Form.Item>
        </Form>
      </div>
      <div className="common-box">
        <div className="knowledge-content">
          <div className="left">
            {knowledgeData.map((knowledgeItem: any, index: number) => (
              <div key={index}>{knowledgeItem.content}</div>
            ))}
          </div>
          {reference.length > 0 && (
            <div className="right">
              <div className="list-area">
                {reference.map((referenceItem: any, index) => (
                  <div className="item" key={index}>
                    <div className="head">
                      <div className="text1">{`检索文档片段${index + 1}`}</div>
                      <div>
                        <a
                          onClick={() => {
                            handleDownloadFile(referenceItem.docId);
                          }}
                        >
                          {referenceItem.title}
                        </a>
                      </div>
                    </div>
                    <div className="desc text2">{referenceItem.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="请输入问题" onChange={handleInputChange} />
          <Button type="primary" onClick={getSearchAnswer}>
            发送
          </Button>
        </Space.Compact>
        {loading && (
          <div className="page-loading">
            <Spin spinning={loading} tip="我正在思考问题答案，请主人稍等~" size="large">
              <div className="content"> </div>
            </Spin>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTest;

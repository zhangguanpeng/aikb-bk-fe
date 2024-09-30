import { getCategoryData, getDocumentData, getTextData, getTagData } from '@/services/aikb/api';
import { arrayToTreeLoop } from '@/utils';
import { Button, Form, Input, Select, Space, Spin, Modal } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './index.less';

const ChatTest: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();

  const [treeData, setTreeData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [searchText, setSearchText] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('');
  const [splitDetailModalShow, setSplitDetailModalShow] = useState(false);
  const [currentSplitContent, setCurrentSplitContent] = useState('');
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [textReference, setTextReference] = useState([]);
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

  const fetchTagData = () => {
    const params = {
      id: '',
      name: '',
      page: 1,
      size: 100,
      sort: 'createdDate,desc',
    };
    getTagData(params)
      .then((res) => {
        // console.log('标签列表res', res);
        const tagData = res.payload.map((item: any) => {
          const option = {
            label: item.name,
            value: item.id
          };
          return option
        });
        setTagData(tagData);
      })
      .catch((error) => {
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
        // console.log('文档列表res', res);
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
    // fetchCategoryData();
    fetchTagData();
    fetchDocumentData();
  }, []);

  const handleInputChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const handleDocChange = () => {};

  const handleSplitDetail = (content: string) => {
    setCurrentSplitContent(content);
    setSplitDetailModalShow(true);
  };

  const getSearchAnswer = () => {
    console.log('form.getFieldsValue()', form.getFieldsValue());
    const { tags = [], documentId } = form.getFieldsValue();

    const params = {
      'tags.id': tags.join(','),
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

  const getSearchAnswerStream = () => {
    // console.log('form.getFieldsValue()', form.getFieldsValue());
    const { tags = [], documentId } = form.getFieldsValue();

    const params = {
      'tags.id': tags.join(','),
      text: searchText,
      documentIds: documentId ? documentId : [],
      modelConfig: {
        stream: true
      }
    };

    setTextContent('');
    setTextReference([]);
    setLoading(true);

    let delay = 0;

    fetchEventSource('/aikb/v1/search', {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "Accept": 'text/event-stream'
      },
      body: JSON.stringify(params),
      onmessage(event) {
        delay = delay + 10;
        if (!loading) {
          setLoading(false);
        }
        // console.log('收到消息：', event.data);
        const res = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (res.type === 'REFERENCE') {
          setTextReference(JSON.parse(res.body));
        }

        if (res.type === 'MESSAGE') {
          const st = setTimeout(() => {
            setTextContent((preTextContent) => `${preTextContent}${res.body}`);
            
            // console.log('deley', delay);
            if (st) {
              clearTimeout(st);
            }
            
          }, delay);
        }

      },
      onclose() {
        // 关闭流
      },
      onerror(error) {
          console.info(error);
          //返回流报错
      }
    })
  };

  // const onTreeChange = (newTreeValue: string) => {
  //   console.log('newTreeValue', newTreeValue);
  //   fetchDocumentData(newTreeValue);
  //   setSelectedCategory(newTreeValue);
  // };

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
          {/* <Form.Item name="categoryId" label="类目">
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
          </Form.Item> */}
          <Form.Item name="tags" label="标签">
            <Select
              mode="multiple"
              style={{ width: 200 }}
              placeholder="请选择标签"
              defaultValue={[]}
              // onChange={handleChange}
              options={tagData}
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
            {/* {knowledgeData.map((knowledgeItem: any, index: number) => (
              <div key={index}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {textContent}
                </ReactMarkdown>
              </div>
            ))} */}
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {textContent}
            </ReactMarkdown>
          </div>
          {textReference.length > 0 && (
            <div className="right">
              <div className="list-area">
                {textReference.map((referenceItem: any, index) => (
                  <div className="item" key={index}>
                    <div className="head">
                      <div className="text1">
                        <span>{`检索文档片段${index + 1}`}</span>
                        <a
                          onClick={() => {
                            handleSplitDetail(referenceItem.content);
                          }}
                        >
                          查看详情
                          <RightOutlined />
                        </a>
                      </div>
                      <div className="document">
                        <a
                          onClick={() => {
                            handleDownloadFile(referenceItem.docId);
                          }}
                        >
                          {referenceItem.title}
                        </a>
                      </div>
                    </div>
                    <div className="desc text2">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {referenceItem.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="请输入问题" onChange={handleInputChange} />
          <Button type="primary" onClick={getSearchAnswerStream} disabled={loading}>
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
      <Modal
        title='切片详情'
        open={splitDetailModalShow}
        onOk={() => {
          setSplitDetailModalShow(false);
        }}
        width={800}
        closeIcon={false}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
          </>
        )}
        className='split-detail-modal'
      >
        <div style={{ paddingTop: '10px' }}>
          <div className='text-content'>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentSplitContent}
            </ReactMarkdown>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatTest;

import { getCategoryData, getDocumentData, getTextData, getTagData } from '@/services/aikb/api';
import { arrayToTreeLoop } from '@/utils';
import { Button, Form, Input, Select, Space, Spin, TreeSelect } from 'antd';
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
  const [selectedCategory, setSelectedCategory] = useState('');
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

  // {"type":"REFERENCE","body":"[{\"docId\":1105,\"title\":\"《城市建设工程地下水控制技术规范》.docx\",\"content\":\"E.3.3地下水溶质运移数值模拟应在地下水流场模拟基础上进行。地下水溶质运移数值模型包括水流模型和溶质运移模型两部分。![](/aikb/v1/split/image/m:1105-efd3d2bad4374a45be8c862e80f3f32c.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"0.6083333333333333in\\\"}![](/aikb/v1/split/image/m:1105-0479c64f6245444695344439b81ec0b5.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"1.0243055555555556in\\\"}式中:$R$------迟滞系数。![](/aikb/v1/split/image/m:1105-da1104a9095a40158a141115e5257209.png){width\\u003d\\\"2.880249343832021in\\\"\\nheight\\u003d\\\"3.937007874015748in\\\"}初始条件:$$\\\\begin{matrix}\\n\\\\left{ \\\\begin{matrix}\\nC(x,y,z,t) \\u003d C_{0}(x,y,z) \\\\\\n(x,y,z) \\\\in \\\\Omega \\\\\\nt \\u003d 0 \\\\\\n\\\\end{matrix} \\\\right.\\\\ #(E.3.3 - 3) \\\\\\n\\\\end{matrix}$$式中:$C_{0}(x,y,z)$------已知浓度分布;  \\n$\\\\Omega$------模型模拟区域。  \\n边界条件:  \\n(1)第一类边界：给定浓度边界$$\\\\begin{matrix}\\n\\\\left{ \\\\begin{matrix}\\nC(x,y,z,t) \\\\mid \\\\Gamma_{1} \\u003d c(x,y,z,t) \\\\\\n(x,y,z) \\\\in \\\\Gamma_{1} \\\\\\nt \\\\geqq 0 \\\\\\n\\\\end{matrix} \\\\right.\\\\ #(E.3.3 - 4) \\\\\\n\\\\end{matrix}$$式中:$\\\\Gamma_{1}$---给定浓度边界；  \\n$c(x,y,z,t)$------定浓度边界上的浓度分布。  \\n(2)第二类边界：给定弥散通量边界![](/aikb/v1/split/image/m:1105-ed6abbff0905430db3d4775a6b7a7bc8.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"1.5916666666666666in\\\"}式中:$\\\\Gamma_{2}$---通量边界；  \\n$f_{i}(x,y,z,t)$------边界$\\\\Gamma_{2}$上已知的弥散通量函数。  \\n(3)第三类边界:给定溶质通量边界![](/aikb/v1/split/image/m:1105-995160afdd0942f9acafd22c39382d23.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"1.4916666666666667in\\\"}式中:$\\\\Gamma_{3}$---混合边界;$$g(x,y,z,t) - \\\\Gamma_{3}\\\\text{上已知的对} - - - \\\\text{-弥散总的通量函数。}$$\\n\",\"score\":80.0274},{\"docId\":1105,\"title\":\"《城市建设工程地下水控制技术规范》.docx\",\"content\":\"9\\\\.3.12施工降水回灌过程中应加强技术管理，应按表9.3.12中的技术要求进行操作。![](/aikb/v1/split/image/m:1105-29800284979b42b19ee67e972311f115.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"2.922222222222222in\\\"}\\n\",\"score\":79.530266},{\"docId\":1105,\"title\":\"《城市建设工程地下水控制技术规范》.docx\",\"content\":\"E.2.3污染物连续注入含水层---平面连续点源模型如下:![](/aikb/v1/split/image/m:1105-73deb04b000c4f9d97f22086c9079114.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"1.6861111111111111in\\\"}式中:$x,y$---计算点处的位置坐标;  \\n$t$------时间$(d)$；![](/aikb/v1/split/image/m:1105-9e5b776bed5b45838b2ba844290356cc.jpeg){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"0.4in\\\"}$M$------承压含水层厚度$(m)$；  \\n$m_{t}$------单位时间注入的污染物质量（$\\\\left. \\\\ kg/d \\\\right)$；  \\n$u$------地下水流速度$(m/d)$；  \\n$n$------有效孔隙度；  \\n$D_{L}$------纵向弥散系数$\\\\left( m^{2}/d \\\\right)$;  \\n$D_{T}$---横向弥散系数$\\\\left( m^{2}/d \\\\right)$；  \\n$K_{0}(\\\\beta)$------第二类零阶修正贝塞尔函数;![](/aikb/v1/split/image/m:1105-a71cf8974166446da57207bc5c758208.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"1.479861111111111in\\\"}\\n\",\"score\":78.90775},{\"docId\":1105,\"title\":\"《城市建设工程地下水控制技术规范》.docx\",\"content\":\"B.4.2地下水在孔隙介质中的三维空间中流动应采用下列偏微分方程表示：  \\n1控制方程![](/aikb/v1/split/image/m:1105-8163ce8fa13042d7b09c3dd3ab2e9835.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"0.7479166666666667in\\\"}式中：$m_{s}$---贮水率$(1/m)$；  \\n$h$------水位(m);  \\n$K_{x},K_{y},K_{z}$------分别为$x,y,z$方向上的渗透系数$(m/d)$；  \\n$t$------时间${}^{(}$);  \\n$W$------源汇项$(1/d)$。  \\n2初始条件$$\\\\begin{matrix}\\n\\\\left{ \\\\begin{matrix}\\nh(x,y,z,t) \\u003d h_{0}(x,y,z) \\\\\\n(x,y,z) \\\\in \\\\Omega \\\\\\nt \\u003d 0 \\\\\\n\\\\end{matrix} \\\\right.\\\\ #(B.4.2 - 2) \\\\\\n\\\\end{matrix}$$式中:$h_{0}(x,y,z)$---初始水位分布;  \\n$\\\\Omega$-模型模拟区域。  \\n3边界条件  \\n1）第一类边界:$$\\\\begin{matrix}\\n\\\\left{ \\\\begin{matrix}\\nh(x,y,z,t) \\\\mid \\\\Gamma_{1} \\u003d h(x,y,z,t) \\\\\\n(x,y,z) \\\\in \\\\Gamma_{1} \\\\\\nt \\\\geq 0 \\\\\\n\\\\end{matrix} \\\\right.\\\\ #(B.4.2 - 3) \\\\\\n\\\\end{matrix}$$式中:$h(x,y,z,t)$---一类边界上的已知水位函数;  \\n$\\\\Gamma_{1}$---------类边界。  \\n2）第二类边界：$$\\\\begin{matrix}\\n\\\\left{ \\\\begin{matrix}\\n\\\\left. \\\\ k\\\\frac{\\\\partial h}{\\\\partial n} \\\\right|{\\\\Gamma{2}} \\u003d q(x,y,z,t) \\\\\\n(x,y,z) \\\\in \\\\Gamma_{2} \\\\\\nt \\\\\\u003e 0 \\\\\\n\\\\end{matrix} \\\\right.\\\\ #(B.4.2 - 4) \\\\\\n\\\\end{matrix}$$式中：$k$------三维空间上的渗透系数张量；$$q(x,y,z,t)——\\\\text{二类边界上已知流量函数;}$$$n$------边界$\\\\Gamma_{2}$的外法线方向；  \\n$\\\\Gamma_{2}$------二类边界  \\n3\\\\)第三类边界:$$\\\\begin{matrix}\\n\\\\left. \\\\ \\\\left( k(h - z)\\\\frac{\\\\partial h}{\\\\partial\\\\bar{n}} + \\\\text{αh} \\\\right) \\\\right|{\\\\Gamma{3}} \\u003d q(x,y,z)#(B.4.2 - 5) \\\\\\n\\\\end{matrix}$$式中：  \\n$\\\\alpha$一已知函数；  \\n$\\\\Gamma_{3}$一三类边界  \\n$k$---三维空间上的渗透系数张量；  \\n$n$---_边界$\\\\Gamma_{3}$的外法线方向；  \\n$q(x,y,z)$---三三类边界上已知的流量函数。  \\n\\n\",\"score\":78.695755},{\"docId\":1105,\"title\":\"《城市建设工程地下水控制技术规范》.docx\",\"content\":\"5\\\\.4.6帷幕桩水泥浆液的水灰比及水泥掺量宜取下表中数值:![](/aikb/v1/split/image/m:1105-e6e809dbdf8442359d26fab3e9de76a9.png){width\\u003d\\\"6.0in\\\"\\nheight\\u003d\\\"2.0944444444444446in\\\"}\\n\",\"score\":78.18595}]"}
  // {"type":"MESSAGE","body":"液"}
  // {"type":"MESSAGE","body":"。"}

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
    </div>
  );
};

export default ChatTest;

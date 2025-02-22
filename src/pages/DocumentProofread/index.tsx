import {
  getTagData,
  getDocumentData,
} from '@/services/aikb/api';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { history } from '@umijs/max';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import './index.less';

const DocumentProofread: React.FC = () => {
  const [form] = useForm();
  const [tagData, setTagData] = useState([]);

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
        console.log('标签列表res', res);
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

  useEffect(() => {
    fetchTagData();
  }, []);

  const fetchDocumentData = (pageInfo: any, formValues: any) => {
    const { documentName = '', tags = [] } = formValues || form.getFieldsValue();
    // console.log('formValues', formValues);
    const params = {
      'tags.id': tags.join(','),
      name: documentName,
      page: pageInfo.page,
      size: pageInfo.size,
      sort: 'createdDate,desc',
    };
    getDocumentData(params)
      .then((res) => {
        // console.log('文档列表res', res);
        setDocumentData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };


  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchDocumentData(pageInfo, null);
  };

  useEffect(() => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchDocumentData(pageInfo, null);
  }, []);

  return (
    <div className="document-page">
      <h1>文档管理</h1>
      <div className="common-box query-box">

      </div>
      <div className="btn-box">
        <Button type="link" icon={<UploadOutlined />} onClick={() => {
            setDocumentSettingModalShow(true);
          }}
        >
          上传文档
        </Button>
      </div>
      <div className="common-box">

      </div>
    </div>
  );
};

export default DocumentProofread;

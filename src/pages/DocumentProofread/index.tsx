import { getTagData } from '@/services/aikb/api';
import {
  PlayCircleOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';
import { Button } from 'antd';
import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { MdEditor, ExposeParam } from 'md-editor-rt';
import ScreenShot from "js-web-screen-shot";

import 'md-editor-rt/lib/style.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './index.less';

const DocumentProofread: React.FC = () => {
  const [tagData, setTagData] = useState([]);
  const [docContent, setDocContent] = useState('');
  const [docContentInsertFrom, setDocContentInsertFrom] = useState(0);
  const [insertEnabled, setInsertEnabled] = useState(false);
  const editorRef = useRef<ExposeParam>();
  // const [currentPdfPage, setCurrentPdfPage] = useState(1);
  // const [pdfPageNumber, setPdfPageNumber] = useState(1);

  const handleScreenShot = () => {
    new ScreenShot({
      enableWebRtc: false,//关闭webRtc
      level: 99999,
      wrcWindowMode: true,
      hiddenToolIco: {
        square: true,
        round: true,
        rightTop: true,
        brush: true,
        mosaicPen: true,
        text: true,
        separateLine: true,
        save: false,
        undo: true
      },
      // screenShotDom: document.getElementById('mainContainer'),//使用html2canvas获取节点区域
      completeCallback: () => {},
      triggerCallback: () => {}
   })
  };

  const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          // CurrentPageInput,
          CurrentPageLabel,
          // Download,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          // Print,
          // ShowSearchPopover,
          Zoom,
          ZoomIn,
          ZoomOut,
        } = slots;
        return (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              width: '100%',
            }}
          >
            {/* <div style={{ padding: '0px 2px' }}>
              <ShowSearchPopover />
            </div> */}
            <div style={{ padding: '0px 2px' }}>
              <ZoomOut />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <Zoom />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <ZoomIn />
            </div>
            <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
              <GoToPreviousPage />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <CurrentPageLabel /> / <NumberOfPages />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <GoToNextPage />
            </div>
            <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
              <EnterFullScreen />
            </div>
            {/* <div style={{ padding: '0px 2px' }}>
              <Download />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <Print />
            </div> */}
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      // defaultTabs[1], // Bookmarks tab
      // defaultTabs[0], // Thumbnails tab
      // defaultTabs[2], // Attachments tab
    ],
    renderToolbar
  });

  const handleMdEditorFocus = (event: any) => {
    const insertFrom = event.target?.cmView?.newSel;
    const selection = window.getSelection();
    console.log('selection', selection);
    // console.log('event', event);
    // console.log('insertFrom', insertFrom);
    setDocContentInsertFrom(insertFrom);
    setInsertEnabled(true);
  };

  const handleInsertStr = () => {
    // const newDocContent = docContent.substring(0, docContentInsertFrom) + '\n@#@\n' + docContent.substring(docContentInsertFrom);
    // setDocContent(newDocContent);
    editorRef.current?.insert((selectedText: string) => {
      /**
       * @return targetValue    待插入内容
       * @return select         插入后是否自动选中内容，默认：true
       * @return deviationStart 插入后选中内容鼠标开始位置，默认：0
       * @return deviationEnd   插入后选中内容鼠标结束位置，默认：0
       */
      return {
        targetValue: '\n@#@\n',
        select: false,
        deviationStart: 0,
        deviationEnd: 0,
      };
    });
  }

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
            value: item.id,
          };
          return option;
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

  // const handlePageChange = (page: number, pageSize: number) => {
  //   console.log(page);
  //   setCurrentPage(page);
  //   const pageInfo = {
  //     page,
  //     size: pageSize,
  //   };
  //   fetchDocumentData(pageInfo, null);
  // };

  useEffect(() => {
    // renderPdfPage(1);
    // loadPDF();
  }, []);

  return (
    <div className="document-page">
      <h1>文档校对</h1>
      <div className="btn-box">
        <Button type="link" icon={<ScissorOutlined />} onClick={handleScreenShot}>
          截图
        </Button>
        <Button disabled={!insertEnabled} type="link" icon={<PlusCircleOutlined />} onClick={handleInsertStr}>
          插入切片符
        </Button>
        <Button type="link" icon={<PlayCircleOutlined />} onClick={() => {}}>
          开始切片
        </Button>
        <Button type="text" icon={<RollbackOutlined />} onClick={() => {}}>
          返回
        </Button>
      </div>
      <div className="content-box">
        <div className="left">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/legacy/build/pdf.worker.js">
            <Viewer
              fileUrl="test.pdf"
              // initialPage={1}
              plugins={[defaultLayoutPluginInstance]}
              // defaultScale={SpecialZoomLevel.PageFit}
              // defaultScale={1}
              // plugins={plugins}
              // theme="dark"
              // renderError={(error) => console.log(error)}
            />
          </Worker>
        </div>
        <div className="right">
          <MdEditor
            modelValue={docContent}
            toolbars={['image']}
            noImgZoomIn
            onChange={(text) => { setDocContent(text) }}
            ref={editorRef}
            onFocus={handleMdEditorFocus}
            onBlur={() => { setInsertEnabled(false); }}
            // onUploadImg={onUploadImg}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentProofread;

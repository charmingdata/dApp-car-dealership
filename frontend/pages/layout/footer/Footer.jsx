import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import { Footer as AntdFooter } from 'antd/lib/layout/layout';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import { copyText } from 'copy-clipboard-js';


const Footer = () => {
  const [lastCommitHash, setLastCommitHash] = useState('');

  useEffect(() => {
    fetch('/api/getCommitHash')
      .then((response) => response.json())
      .then((data) => setLastCommitHash(data.lastCommitHash))
      .catch((error) => console.error('Error fetching last commit hash:', error));
  }, []);


  const [api, contextHolder] = notification.useNotification();

  const copyLink = () => {
    copyText(lastCommitHash);
    api.open({
      key: lastCommitHash,
      message: 'Trace ID copied to clipboard',
      description: `ID: ${lastCommitHash}`,
      duration: 2,
      closeIcon: <div />,
    });
  };

  return (
    <>
      {contextHolder}
      <AntdFooter style={{
        position: "sticky",
        bottom: "0px",
        marginTop: "auto"
      }}>
        <div style={{
          textAlign: "center"
        }}>
          <div>
            Trace: {lastCommitHash}
            <CopyOutlined onClick={() => copyLink()} />
          </div>
          <div>
            &copy; {new Date().getFullYear()} - <a href='https://github.com/charmingdata/dApp-car-dealership/graphs/contributors'>Developers - dApp-car-dealership</a>
          </div>
        </div>
      </AntdFooter>
    </>
  );
};

export default Footer;

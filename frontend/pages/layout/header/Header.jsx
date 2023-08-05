import React from 'react';
import { Header as AntdHeader } from 'antd/lib/layout/layout';
import PageHeader from 'antd/lib/page-header';
import { Button, Input } from 'antd';
import {
  HeartOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const Header = () => (
  <AntdHeader style={{ backgroundColor: 'transparent' }}>
    <PageHeader
      title="NFT Cars"
      extra={[
        <Input.Search
          key="search"
          placeholder="Used Volkswagon Golf..."
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />,
        <div key="space" className="w-8" />,
        <Button key="saved" type="primary" icon={<HeartOutlined />} />,
        <Button key="message" type="primary" icon={<MessageOutlined />} />,
        <Button key="notification" type="primary" icon={<BellOutlined />} />,
        <Button key="profile" type="primary" icon={<UserOutlined />} />,
      ]}
    />
  </AntdHeader>
);

export default Header;

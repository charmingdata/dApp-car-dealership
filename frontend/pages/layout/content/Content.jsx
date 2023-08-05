import React from 'react';
import { Layout } from 'antd';

const { Content: AntdContent } = Layout;

class Content extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '67%', margin: '40px' }}>
          <AntdContent>{this.props.children}</AntdContent>
        </div>
      </div>
    );
  }
}

export default Content;

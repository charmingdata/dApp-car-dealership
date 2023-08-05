import React from 'react';
import Layout from 'antd/lib/layout';
import Header from './header/Header';
import Content from './content/Content';
import Footer from './footer/Footer';


class CustomLayout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content>
          {children}
        </Content>
        <Footer />
      </Layout>
    );
  }
}

export default CustomLayout ;

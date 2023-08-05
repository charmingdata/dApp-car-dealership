import '@/styles/globals.css'
import 'antd/dist/antd.css';
import CustomLayout from './layout/CustomLayout'

export default function App({ Component, pageProps }) {
  return <CustomLayout>
    <Component {...pageProps} />
  </CustomLayout> 
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        colorBgLayout: '#001529',
        colorBgContainer: '#001e3c',
        colorBgElevated: '#002a4e',
        colorBorder: '#004080',
        colorText: '#e6f4ff',
        colorTextSecondary: '#91caff',
        borderRadius: 4,
        fontSize: 14
      },
      components: {
        Layout: {
          headerBg: '#000c17',
          siderBg: '#000c17',
          bodyBg: '#001529'
        },
        Menu: {
          darkItemBg: '#000c17',
          darkSubMenuItemBg: '#001529',
          darkItemSelectedBg: '#1677ff',
          itemBg: '#001e3c'
        },
        Table: {
          headerBg: '#003060',
          headerColor: '#e6f4ff',
          rowHoverBg: '#002a4e',
          borderColor: '#004080'
        },
        Card: {
          headerBg: '#002a4e',
          borderColor: '#004080'
        },
        Modal: {
          headerBg: '#002a4e',
          contentBg: '#001e3c'
        }
      }
    }}
  >
    <AntdApp>
      <App />
    </AntdApp>
  </ConfigProvider>
)

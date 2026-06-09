import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Badge, Button, Space, Tooltip, Tag, App as AntdApp } from 'antd'
import {
  BellOutlined, DashboardOutlined, ApiOutlined, VideoCameraOutlined,
  FileTextOutlined, TeamOutlined, BarChartOutlined,
  WarningOutlined, UserOutlined, ClockCircleOutlined,
  MinusOutlined, BorderOutlined, CloseOutlined,
  ThunderboltOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import { useStore } from './store/useStore'
import AlarmMonitor from './pages/AlarmMonitor'
import FloorPlan from './pages/FloorPlan'
import DeviceStatus from './pages/DeviceStatus'
import VideoPoints from './pages/VideoPoints'
import DutyLog from './pages/DutyLog'
import ContactList from './pages/ContactList'
import ReviewStats from './pages/ReviewStats'
import AlarmModal from './components/AlarmModal'
import CameraModal from './components/CameraModal'
import DisposalModal from './components/DisposalModal'
import PrintModal from './components/PrintModal'
import dayjs from 'dayjs'

const { Header, Sider, Content, Footer } = Layout

const menuItems = [
  { key: 'alarm', icon: <BellOutlined />, label: '报警监视' },
  { key: 'floor', icon: <DashboardOutlined />, label: '楼层平面' },
  { key: 'device', icon: <ApiOutlined />, label: '设备状态' },
  { key: 'video', icon: <VideoCameraOutlined />, label: '视频点位' },
  { key: 'duty', icon: <FileTextOutlined />, label: '值班日志' },
  { key: 'contact', icon: <TeamOutlined />, label: '联络清单' },
  { key: 'stats', icon: <BarChartOutlined />, label: '复盘统计' }
]

const App = () => {
  const [activeKey, setActiveKey] = useState('alarm')
  const [currentTime, setCurrentTime] = useState(dayjs())
  const {
    systemStatus, currentUser, alarmModalOpen, activeAlarm, closeAlarmModal,
    triggerAlarm, pendingTasks, getPendingAlarms, cameraModalOpen, closeCamera, selectedCamera,
    disposalModalOpen, closeDisposalModal, selectedAlarmForDisposal,
    printModalOpen, closePrintModal, selectedAlarmForPrint
  } = useStore()
  const { modal, notification } = AntdApp.useApp()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const alarmTimer = setInterval(() => {
      if (Math.random() < 0.08) {
        triggerAlarm()
      }
    }, 30000)
    return () => clearInterval(alarmTimer)
  }, [triggerAlarm])

  const pendingAlarms = getPendingAlarms()
  const incompleteTasks = pendingTasks.filter(t => !t.completed).length

  const handleMinimize = () => window.electronAPI?.minimizeWindow?.()
  const handleMaximize = () => window.electronAPI?.maximizeWindow?.()
  const handleClose = () => {
    modal.confirm({
      title: '确认退出',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出消防控制室值守系统吗？请确保完成交接班。',
      okText: '确定退出',
      cancelText: '取消',
      onOk: () => window.electronAPI?.closeWindow?.()
    })
  }

  const renderPage = () => {
    switch (activeKey) {
      case 'alarm': return <AlarmMonitor />
      case 'floor': return <FloorPlan />
      case 'device': return <DeviceStatus />
      case 'video': return <VideoPoints />
      case 'duty': return <DutyLog />
      case 'contact': return <ContactList />
      case 'stats': return <ReviewStats />
      default: return <AlarmMonitor />
    }
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 60, borderBottom: '1px solid #004080'
      }}>
        <Space size={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #ff4d4f, #ff7a45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ThunderboltOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>
                消防控制室值守台
              </div>
              <div style={{ color: '#91caff', fontSize: 11 }}>FIRE CONTROL MONITORING SYSTEM v1.0</div>
            </div>
          </div>
        </Space>

        <Space size={24}>
          <Space size={20}>
            <Tooltip title={`设备总数: ${systemStatus.totalDevices}`}>
              <Space size={4}>
                <ApiOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <span style={{ color: '#e6f4ff', fontSize: 13 }}>
                  在线 <span style={{ color: '#52c41a', fontWeight: 600 }}>{systemStatus.onlineDevices}</span>
                  /{systemStatus.totalDevices}
                </span>
              </Space>
            </Tooltip>

            <Tooltip title={`故障设备: ${systemStatus.faultDevices}`}>
              <Space size={4}>
                <WarningOutlined style={{
                  color: systemStatus.faultDevices > 0 ? '#ff4d4f' : '#8c8c8c', fontSize: 16
                }} />
                <span style={{
                  color: systemStatus.faultDevices > 0 ? '#ff4d4f' : '#8c8c8c',
                  fontSize: 13, fontWeight: 600
                }}>
                  故障 {systemStatus.faultDevices}
                </span>
              </Space>
            </Tooltip>

            <Tooltip title={`防火门未关闭: ${systemStatus.fireDoorsOpen}`}>
              <Space size={4}>
                <ExclamationCircleOutlined style={{
                  color: systemStatus.fireDoorsOpen > 0 ? '#faad14' : '#8c8c8c', fontSize: 16
                }} />
                <span style={{
                  color: systemStatus.fireDoorsOpen > 0 ? '#faad14' : '#8c8c8c',
                  fontSize: 13, fontWeight: 600
                }}>
                  防火门 {systemStatus.fireDoorsOpen}
                </span>
              </Space>
            </Tooltip>

            <Tooltip title="今日报警数">
              <Space size={4}>
                <BellOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                <span style={{ color: '#e6f4ff', fontSize: 13, fontWeight: 600 }}>
                  今日 {systemStatus.todayAlarms}
                </span>
              </Space>
            </Tooltip>

            {pendingAlarms.length > 0 && (
              <Badge count={pendingAlarms.length} size="small" offset={[-2, 2]}>
                <Tag color="red" style={{ margin: 0 }} className="blink-alarm">
                  <WarningOutlined /> 待处理警情
                </Tag>
              </Badge>
            )}

            {incompleteTasks > 0 && (
              <Badge count={incompleteTasks} size="small" offset={[-2, 2]}>
                <Tag color="orange" style={{ margin: 0 }}>
                  <ClockCircleOutlined /> 待办事项
                </Tag>
              </Badge>
            )}
          </Space>

          <Space split={<span style={{ color: '#004080' }}>|</span>}>
            <div style={{ color: '#e6f4ff', fontSize: 13 }}>
              <ClockCircleOutlined style={{ marginRight: 6, color: '#1677ff' }} />
              {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </div>

            <Space size={6}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              <span style={{ color: '#e6f4ff', fontSize: 13 }}>
                {currentUser.name}
                <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>{currentUser.shift}</Tag>
              </span>
            </Space>
          </Space>

          <Space size={4} style={{ marginLeft: 8 }}>
            <Tooltip title="最小化">
              <Button
                type="text" size="small" icon={<MinusOutlined />}
                onClick={handleMinimize}
                style={{ color: '#91caff', width: 32 }}
              />
            </Tooltip>
            <Tooltip title="最大化/还原">
              <Button
                type="text" size="small" icon={<BorderOutlined />}
                onClick={handleMaximize}
                style={{ color: '#91caff', width: 32 }}
              />
            </Tooltip>
            <Tooltip title="关闭">
              <Button
                type="text" size="small" icon={<CloseOutlined />}
                onClick={handleClose}
                style={{ color: '#ff4d4f', width: 32 }}
              />
            </Tooltip>
          </Space>
        </Space>
      </Header>

      <Layout>
        <Sider width={200} style={{ borderRight: '1px solid #004080' }}>
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[activeKey]}
            onClick={({ key }) => setActiveKey(key)}
            items={menuItems}
            style={{ height: '100%', borderRight: 0, paddingTop: 8 }}
          />

          <div style={{ padding: 16, borderTop: '1px solid #004080' }}>
            <Button
              type="primary" danger block
              icon={<ThunderboltOutlined />}
              onClick={() => {
                triggerAlarm()
                notification.warning({
                  message: '模拟报警触发',
                  description: '已生成一条模拟报警记录用于测试',
                  duration: 3
                })
              }}
            >
              模拟报警测试
            </Button>
          </div>
        </Sider>

        <Content style={{
          margin: 0, padding: 16, overflow: 'auto',
          background: '#001529'
        }} className="scrollbar-thin">
          {renderPage()}
        </Content>
      </Layout>

      {alarmModalOpen && activeAlarm && (
        <AlarmModal open={alarmModalOpen} alarm={activeAlarm} onClose={closeAlarmModal} />
      )}

      {cameraModalOpen && selectedCamera && (
        <CameraModal open={cameraModalOpen} camera={selectedCamera} onClose={closeCamera} />
      )}

      {disposalModalOpen && selectedAlarmForDisposal && (
        <DisposalModal
          open={disposalModalOpen}
          alarm={selectedAlarmForDisposal}
          onClose={closeDisposalModal}
        />
      )}

      {printModalOpen && selectedAlarmForPrint && (
        <PrintModal
          open={printModalOpen}
          alarm={selectedAlarmForPrint}
          onClose={closePrintModal}
        />
      )}
    </Layout>
  )
}

export default App

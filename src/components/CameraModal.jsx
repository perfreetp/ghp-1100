import React, { useState, useEffect } from 'react'
import { Modal, Button, Space, Row, Col, Descriptions, Tag, Tabs, Badge } from 'antd'
import {
  PlaySquareOutlined, PauseCircleOutlined, SnippetsOutlined,
  FullscreenOutlined, EnvironmentOutlined, ApiOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const CameraModal = ({ open, camera, onClose }) => {
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (playing && open) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }
  }, [playing, open])

  const renderVideoArea = () => (
    <div style={{
      width: '100%', height: 420,
      background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)`,
      borderRadius: 4, position: 'relative', overflow: 'hidden',
      border: '1px solid #004080'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: 12, display: 'flex', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        zIndex: 10
      }}>
        <Space>
          <Badge status={camera?.status === 'online' ? 'success' : 'error'} />
          <span style={{ color: '#fff', fontSize: 13 }}>{camera?.name}</span>
          <Tag color="blue">{camera?.floor}</Tag>
        </Space>
        <Space>
          {playing && <span className="blink-alarm" style={{ color: '#ff4d4f' }}>● REC</span>}
          <span style={{ color: '#fff', fontSize: 13 }}>
            {dayjs(currentTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        </Space>
      </div>

      <div style={{ width: '100%', height: '100%', position: 'relative', padding: 40 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#00ff88" strokeWidth="0.3" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />
          <rect x="20" y="40" width="80" height="60" fill="#2a2a3e" stroke="#00ff88" strokeWidth="0.5" opacity="0.6"/>
          <rect x="120" y="30" width="100" height="80" fill="#2a2a3e" stroke="#00ff88" strokeWidth="0.5" opacity="0.6"/>
          <rect x="240" y="50" width="60" height="70" fill="#2a2a3e" stroke="#00ff88" strokeWidth="0.5" opacity="0.6"/>
          <rect x="320" y="35" width="60" height="90" fill="#2a2a3e" stroke="#00ff88" strokeWidth="0.5" opacity="0.6"/>
          <rect x="30" y="150" width="70" height="120" fill="#3a3a4e" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
          <rect x="130" y="140" width="90" height="130" fill="#3a3a4e" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
          <rect x="250" y="160" width="80" height="110" fill="#3a3a4e" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
          <rect x="350" y="150" width="40" height="120" fill="#3a3a4e" stroke="#00ff88" strokeWidth="0.5" opacity="0.5"/>
          <circle cx="200" cy="150" r="30" fill="none" stroke="#ff6b6b" strokeWidth="1" opacity="0.6" className="pulse-alarm"/>
          <circle cx="200" cy="150" r="5" fill="#ff6b6b" className="blink-alarm"/>
          <path d="M 170 150 L 230 150 M 200 120 L 200 180" stroke="#ff6b6b" strokeWidth="1" opacity="0.6"/>
          <text x="200" y="200" textAnchor="middle" fill="#ff6b6b" fontSize="10">检测到移动目标</text>
        </svg>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 12, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Space size={12}>
          <Button type="text" icon={playing ? <PauseCircleOutlined /> : <PlaySquareOutlined />}
            style={{ color: '#fff', fontSize: 20 }} onClick={() => setPlaying(!playing)} />
          <span style={{ color: '#aaa', fontSize: 12 }}>{camera?.resolution}</span>
          <Tag color="default" style={{ margin: 0 }}>{camera?.type}</Tag>
        </Space>
        <Space>
          <Button type="text" icon={<SnippetsOutlined />} style={{ color: '#fff' }}>截图</Button>
          <Button type="text" icon={<FullscreenOutlined />} style={{ color: '#fff' }}>全屏</Button>
        </Space>
      </div>
    </div>
  )

  const renderPlayback = () => (
    <div style={{ padding: 20, textAlign: 'center', color: '#8c8c8c' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📼</div>
      <div>选择日期和时间范围查看回放录像</div>
      <div style={{ marginTop: 8, fontSize: 12 }}>系统默认保存最近 30 天录像</div>
    </div>
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      title={
        <Space>
          <span style={{ fontSize: 16 }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            视频监控 - {camera?.name}
          </span>
        </Space>
      }
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary">导出录像</Button>
        </Space>
      }
    >
      <Tabs
        defaultActiveKey="live"
        items={[
          { key: 'live', label: '实时画面', icon: <PlaySquareOutlined />, children: renderVideoArea() },
          { key: 'playback', label: '录像回放', icon: <SnippetsOutlined />, children: renderPlayback() }
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="摄像头编号" span={1}>{camera?.id}</Descriptions.Item>
          <Descriptions.Item label="所属楼层" span={1}>
            <Tag color="blue">{camera?.floor}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="设备类型" span={1}>{camera?.type}</Descriptions.Item>
          <Descriptions.Item label="分辨率" span={1}>{camera?.resolution}</Descriptions.Item>
          <Descriptions.Item label="安装位置" span={1}>
            <EnvironmentOutlined /> ({camera?.position?.x}%, {camera?.position?.y}%)
          </Descriptions.Item>
          <Descriptions.Item label="关联探测器" span={1}>
            <ApiOutlined /> {camera?.relatedDetectorId || '无'}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  )
}

export default CameraModal

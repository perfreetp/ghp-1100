import React, { useState, useMemo, useEffect } from 'react'
import {
  Row, Col, Card, Tag, Button, Space, Select, Input, Grid, Empty,
  Badge, App as AntdApp
} from 'antd'
import {
  VideoCameraOutlined, PlaySquareOutlined, FullscreenOutlined,
  SearchOutlined, ReloadOutlined, FilterOutlined,
  WarningOutlined, CheckCircleOutlined, EnvironmentOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { floors } from '../data/mockData'
import dayjs from 'dayjs'

const { Option } = Select
const { Search } = Input
const { useBreakpoint } = Grid

const VideoPoints = () => {
  const { message } = AntdApp.useApp()
  const { cameras, openCamera, alarms, currentFloor, setCurrentFloor } = useStore()
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [activeView, setActiveView] = useState('grid')
  const [gridSize, setGridSize] = useState(4)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredCameras = useMemo(() => {
    return cameras.filter(c => {
      if (floorFilter !== 'all' && c.floor !== floorFilter) return false
      if (statusFilter === 'online' && c.status !== 'online') return false
      if (statusFilter === 'offline' && c.status !== 'offline') return false
      if (keyword) {
        const kw = keyword.toLowerCase()
        return c.name.toLowerCase().includes(kw) || c.id.toLowerCase().includes(kw)
      }
      return true
    })
  }, [cameras, floorFilter, statusFilter, keyword])

  const camerasWithAlarm = useMemo(() => {
    const alarmFloors = new Set(alarms.filter(a => a.status === 'pending').map(a => a.floor))
    return filteredCameras.map(c => ({
      ...c,
      hasNearbyAlarm: alarmFloors.has(c.floor)
    }))
  }, [filteredCameras, alarms])

  const renderVideoThumbnail = (camera, index) => {
    const seed = (camera.id.charCodeAt(5) + index * 7) % 10
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(${135 + seed * 20}deg, #0a0a0a, #1a1a3a, #0a1a2a)`,
        position: 'relative', overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id={`vgrid-${camera.id}`} width="20" height="15" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 15" fill="none" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.15"/>
            </pattern>
          </defs>
          <rect width="200" height="120" fill={`url(#vgrid-${camera.id})`} />
          <rect x="10" y="15" width="50" height="30" fill="#2a2a4e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.6"/>
          <rect x="70" y="10" width="55" height="40" fill="#2a2a4e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.6"/>
          <rect x="135" y="20" width="55" height="35" fill="#2a2a4e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.6"/>
          <rect x="15" y="60" width="50" height="45" fill="#3a3a5e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.5"/>
          <rect x="75" y="65" width="45" height="40" fill="#3a3a5e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.5"/>
          <rect x="130" y="70" width="60" height="35" fill="#3a3a5e" stroke={camera.hasNearbyAlarm ? '#ff6b6b' : '#00ff88'} strokeWidth="0.3" opacity="0.5"/>
          {camera.hasNearbyAlarm && (
            <>
              <circle cx="100" cy="60" r="18" fill="none" stroke="#ff6b6b" strokeWidth="1" opacity="0.6">
                <animate attributeName="r" values="10;25;10" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="100" cy="60" r="4" fill="#ff6b6b" className="blink-alarm"/>
            </>
          )}
        </svg>

        {camera.status === 'online' ? (
          <>
            <div style={{
              position: 'absolute', top: 6, left: 6, right: 6,
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#fff'
            }}>
              <Space size={4}>
                <Badge status="success" />
                <span style={{ fontSize: 9 }}>LIVE</span>
              </Space>
              <Space size={4}>
                {camera.hasNearbyAlarm && (
                  <span style={{ color: '#ff6b6b' }} className="blink-alarm">● 附近报警</span>
                )}
                <span style={{ color: '#ff6b6b' }} className="blink-alarm">●REC</span>
              </Space>
            </div>

            <div style={{
              position: 'absolute', bottom: 6, left: 6, right: 6,
              display: 'flex', justifyContent: 'space-between',
              fontSize: 9, color: '#ccc'
            }}>
              <span>{dayjs(currentTime).format('MM-DD HH:mm:ss')}</span>
              <span>{camera.resolution}</span>
            </div>
          </>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', color: '#8c8c8c'
          }}>
            <WarningOutlined style={{ fontSize: 28, marginBottom: 8 }} />
            <div style={{ fontSize: 12 }}>设备离线</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>无法连接</div>
          </div>
        )}
      </div>
    )
  }

  const renderGrid = () => {
    const cols = gridSize
    const colSpan = 24 / cols
    return (
      <Row gutter={[12, 12]}>
        {camerasWithAlarm.map((camera, idx) => (
          <Col span={colSpan} key={camera.id}>
            <Card
              size="small"
              hoverable
              className={camera.hasNearbyAlarm ? 'pulse-alarm' : ''}
              style={{
                borderColor: camera.hasNearbyAlarm ? '#ff4d4f60' : '#004080',
                background: camera.hasNearbyAlarm ? 'rgba(255,77,79,0.05)' : undefined
              }}
              bodyStyle={{ padding: 6 }}
              cover={
                <div
                  style={{ height: 180, cursor: camera.status === 'online' ? 'pointer' : 'not-allowed' }}
                  onClick={() => {
                    if (camera.status === 'online') openCamera(camera)
                    else message.warning('设备离线，无法查看')
                  }}
                >
                  {renderVideoThumbnail(camera, idx)}
                </div>
              }
              actions={[
                <Button type="link" size="small" key="play"
                  icon={<PlaySquareOutlined />}
                  disabled={camera.status !== 'online'}
                  onClick={() => openCamera(camera)}
                >实时</Button>,
                <Button type="link" size="small" key="full"
                  icon={<FullscreenOutlined />}
                  disabled={camera.status !== 'online'}
                  onClick={() => openCamera(camera)}
                >全屏</Button>
              ]}
            >
              <Card.Meta
                title={
                  <Space size={4}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{camera.name}</span>
                    <Tag color="blue" style={{ fontSize: 10 }}>{camera.floor}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <span style={{ fontSize: 10, color: '#8c8c8c', fontFamily: 'monospace' }}>{camera.id}</span>
                    <Space size={4}>
                      <Tag color={camera.status === 'online' ? 'success' : 'default'} style={{ fontSize: 10, margin: 0 }}>
                        {camera.status === 'online' ? '在线' : '离线'}
                      </Tag>
                      <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{camera.type}</Tag>
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const renderList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {camerasWithAlarm.map((camera, idx) => (
        <div key={camera.id} style={{
          display: 'flex', gap: 12, padding: 8,
          background: camera.hasNearbyAlarm ? 'rgba(255,77,79,0.08)' : 'rgba(0,42,78,0.5)',
          border: `1px solid ${camera.hasNearbyAlarm ? '#ff4d4f60' : '#004080'}`,
          borderRadius: 4
        }} className={camera.hasNearbyAlarm ? 'pulse-alarm' : ''}>
          <div style={{ width: 260, height: 140, flexShrink: 0, borderRadius: 4, overflow: 'hidden' }}
            onClick={() => camera.status === 'online' && openCamera(camera)}
          >
            {renderVideoThumbnail(camera, idx)}
          </div>
          <div style={{ flex: 1, padding: '4px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{camera.name}</span>
                <Tag color="blue">{camera.floor}</Tag>
                <Tag color={camera.status === 'online' ? 'success' : 'default'}>
                  {camera.status === 'online' ? '在线' : '离线'}
                </Tag>
                {camera.hasNearbyAlarm && <Tag color="red" className="blink-alarm">附近有报警</Tag>}
              </Space>
              <Space>
                <Button type="primary" size="small" icon={<PlaySquareOutlined />}
                  disabled={camera.status !== 'online'}
                  onClick={() => openCamera(camera)}>查看实时</Button>
              </Space>
            </div>
            <Row gutter={[16, 8]} style={{ fontSize: 12, color: '#91caff' }}>
              <Col span={8}><span style={{ color: '#8c8c8c' }}>设备编号：</span>{camera.id}</Col>
              <Col span={8}><span style={{ color: '#8c8c8c' }}>设备类型：</span>{camera.type}</Col>
              <Col span={8}><span style={{ color: '#8c8c8c' }}>分辨率：</span>{camera.resolution}</Col>
              <Col span={8}><span style={{ color: '#8c8c8c' }}>安装位置：</span>
                <EnvironmentOutlined /> ({camera.position.x}%, {camera.position.y}%)
              </Col>
              <Col span={8}><span style={{ color: '#8c8c8c' }}>关联探测器：</span>{camera.relatedDetectorId || '无'}</Col>
            </Row>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(114,46,209,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <VideoCameraOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>总点位</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{cameras.length}</div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(82,196,26,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>在线</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
                    {cameras.filter(c => c.status === 'online').length}
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}> / {cameras.length}</span>
                  </div>
                </div>
              </Space>
              <Tag color="success" style={{ fontSize: 11 }}>
                {Math.round(cameras.filter(c => c.status === 'online').length / cameras.length * 100)}%
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(140,140,140,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <WarningOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>离线/异常</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: cameras.filter(c => c.status !== 'online').length > 0 ? '#faad14' : '#8c8c8c' }}>
                    {cameras.filter(c => c.status !== 'online').length}
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(255,77,79,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <DashboardOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>关联报警楼层</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#ff4d4f' }}>
                    {new Set(alarms.filter(a => a.status === 'pending').map(a => a.floor)).size}
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <Space>
            <FilterOutlined style={{ color: '#1677ff' }} />
            <span>视频监控（{filteredCameras.length} 路）</span>
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="搜索摄像头..."
              size="small" style={{ width: 180 }}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
            <Select size="small" value={floorFilter} style={{ width: 110 }} onChange={setFloorFilter}
              prefix={<span style={{ color: '#8c8c8c' }}>楼层</span>}>
              <Option value="all">全部</Option>
              {floors.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
            <Select size="small" value={statusFilter} style={{ width: 110 }} onChange={setStatusFilter}
              prefix={<span style={{ color: '#8c8c8c' }}>状态</span>}>
              <Option value="all">全部</Option>
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
            </Select>
            <Button.Group size="small">
              <Button type={activeView === 'grid' ? 'primary' : 'default'} onClick={() => setActiveView('grid')}>网格</Button>
              <Button type={activeView === 'list' ? 'primary' : 'default'} onClick={() => setActiveView('list')}>列表</Button>
            </Button.Group>
            {activeView === 'grid' && (
              <Select size="small" value={gridSize} style={{ width: 100 }} onChange={setGridSize}>
                <Option value={2}>2分屏</Option>
                <Option value={4}>4分屏</Option>
                <Option value={6}>6分屏</Option>
                <Option value={8}>8分屏</Option>
              </Select>
            )}
            <Button size="small" icon={<ReloadOutlined />}>刷新</Button>
          </Space>
        }
        className="glass-card"
        style={{ minHeight: 560 }}
      >
        {filteredCameras.length === 0 ? (
          <div style={{ padding: 80 }}>
            <Empty description="没有找到符合条件的摄像头" />
          </div>
        ) : (
          <div className="scrollbar-thin" style={{ maxHeight: 720, overflow: 'auto', paddingRight: 4 }}>
            {activeView === 'grid' ? renderGrid() : renderList()}
          </div>
        )}
      </Card>
    </Space>
  )
}

export default VideoPoints

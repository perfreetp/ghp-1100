import React, { useMemo, useState } from 'react'
import {
  Row, Col, Card, Segmented, Space, Tag, Button, Tooltip, List,
  Avatar, App as AntdApp, Divider
} from 'antd'
import {
  EnvironmentOutlined, EyeOutlined, BellOutlined,
  VideoCameraOutlined, ApiOutlined, DashboardOutlined,
  FireOutlined, SafetyOutlined, ThunderboltOutlined,
  ZoomInOutlined, ZoomOutOutlined, SearchOutlined
} from '@ant-design/icons'
const FanOutlined = ThunderboltOutlined
import { useStore } from '../store/useStore'
import { floors, detectorTypes } from '../data/mockData'
import dayjs from 'dayjs'

const FloorPlan = () => {
  const { message } = AntdApp.useApp()
  const {
    currentFloor, setCurrentFloor, detectors, fireDoors, exhausts,
    cameras, alarms, openAlarmModal, openCamera, toggleFireDoor, toggleExhaust, setDeviceFilter
  } = useStore()

  const [layerVisible, setLayerVisible] = useState({
    detector: true,
    fireDoor: true,
    exhaust: true,
    camera: true,
    alarm: true
  })

  const [zoom, setZoom] = useState(1)
  const [hoveredDevice, setHoveredDevice] = useState(null)

  const floorDetectors = detectors.filter(d => d.floor === currentFloor)
  const floorFireDoors = fireDoors.filter(d => d.floor === currentFloor)
  const floorExhausts = exhausts.filter(e => e.floor === currentFloor)
  const floorCameras = cameras.filter(c => c.floor === currentFloor)
  const activeAlarms = alarms.filter(a => a.floor === currentFloor && a.status === 'pending')

  const activeDetectorIds = useMemo(() =>
    new Set(activeAlarms.map(a => a.detectorId)), [activeAlarms])

  const handleFloorClick = (floorId) => {
    setCurrentFloor(floorId)
    message.success(`切换到 ${floors.find(f => f.id === floorId)?.name}`)
  }

  const handleDeviceClick = (type, device) => {
    if (type === 'camera') {
      openCamera(device)
    } else if (type === 'alarm') {
      openAlarmModal(device)
    } else if (type === 'fireDoor') {
      toggleFireDoor(device.id)
      message.success(`${device.name} 已${device.status === 'closed' ? '打开' : '关闭'}`)
    } else if (type === 'exhaust') {
      toggleExhaust(device.id)
      message.success(`${device.name} 已${device.status === 'running' ? '切换为待机' : '启动运行'}`)
    }
  }

  const renderFloorPlan = () => {
    const floorData = floors.find(f => f.id === currentFloor)
    return (
      <div style={{
        position: 'relative', width: '100%', height: 560,
        background: `
          linear-gradient(135deg, #001a33 0%, #002a4e 50%, #001529 100%)
        `,
        borderRadius: 8,
        border: '1px solid #004080',
        overflow: 'hidden'
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 560"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.3s' }}
        >
          <defs>
            <pattern id="floorGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#004080" strokeWidth="0.5" opacity="0.4" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0055aa" />
              <stop offset="100%" stopColor="#003366" />
            </linearGradient>
          </defs>

          <rect width="1000" height="560" fill="url(#floorGrid)" />

          <rect
            x="40" y="40" width="920" height="480" rx="8"
            fill="none" stroke="url(#wallGrad)" strokeWidth="4"
          />

          <line x1="40" y1="220" x2="360" y2="220" stroke="#004080" strokeWidth="3" />
          <line x1="400" y1="40" x2="400" y2="520" stroke="#004080" strokeWidth="3" />
          <line x1="680" y1="40" x2="680" y2="300" stroke="#004080" strokeWidth="3" />
          <line x1="400" y1="340" x2="960" y2="340" stroke="#004080" strokeWidth="3" />

          <g opacity="0.6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <line key={`v-${i}`} x1={100 + i * 100} y1={40} x2={100 + i * 100} y2={520}
                stroke="#004080" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <line key={`h-${i}`} x1={40} y1={90 + i * 60} x2={960} y2={90 + i * 60}
                stroke="#004080" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
            ))}
          </g>

          <g>
            <rect x="740" y="40" width="80" height="80" fill="#002a4e" stroke="#0055aa" strokeWidth="1.5" />
            <text x="780" y="85" textAnchor="middle" fill="#91caff" fontSize="14">电梯厅</text>
            <circle cx="765" cy="75" r="12" fill="none" stroke="#1677ff" strokeWidth="2" />
            <circle cx="795" cy="75" r="12" fill="none" stroke="#1677ff" strokeWidth="2" />
            <rect x="757" y="63" width="16" height="24" fill="#004080" opacity="0.5" />
            <rect x="787" y="63" width="16" height="24" fill="#004080" opacity="0.5" />

            <rect x="450" y="380" width="140" height="110" fill="#002a4e" stroke="#0055aa" strokeWidth="1.5" />
            <text x="520" y="440" textAnchor="middle" fill="#91caff" fontSize="14">机电设备间</text>

            <rect x="100" y="260" width="100" height="80" fill="#002a4e" stroke="#0055aa" strokeWidth="1.5" />
            <text x="150" y="305" textAnchor="middle" fill="#91caff" fontSize="13">储物间</text>

            <rect x="750" y="380" width="160" height="110" fill="#002a4e" stroke="#0055aa" strokeWidth="1.5" />
            <text x="830" y="440" textAnchor="middle" fill="#91caff" fontSize="14">办公区A</text>

            <rect x="100" y="400" width="240" height="90" fill="#002a4e" stroke="#0055aa" strokeWidth="1.5" />
            <text x="220" y="450" textAnchor="middle" fill="#91caff" fontSize="14">办公区B</text>
          </g>

          {layerVisible.detector && floorDetectors.map(d => {
            const type = detectorTypes[d.type]
            const x = d.position.x * 9.2 + 40
            const y = d.position.y * 4.8 + 40
            const isActive = activeDetectorIds.has(d.id)
            return (
              <g
                key={d.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setDeviceFilter({ floor: currentFloor })
                  const alarm = alarms.find(a => a.detectorId === d.id && a.status === 'pending')
                  if (alarm) openAlarmModal(alarm)
                }}
                onMouseEnter={() => setHoveredDevice({ type: 'detector', data: d })}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                {isActive && (
                  <>
                    <circle r="20" fill="none" stroke="#ff4d4f" strokeWidth="2"
                      opacity="0.6" className="pulse-alarm">
                      <animate attributeName="r" values="12;24;12" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
                <circle r="10"
                  fill={isActive ? '#ff4d4f' : d.status === 'normal' ? type.color : '#faad14'}
                  stroke="#fff" strokeWidth="1.5"
                  filter={isActive ? 'url(#glow)' : undefined}
                  className={isActive ? 'blink-alarm' : ''}
                />
                <text y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  {d.type === 'smoke' ? '烟' : d.type === 'heat' ? '温' : d.type === 'manual' ? '手' : '火'}
                </text>
              </g>
            )
          })}

          {layerVisible.fireDoor && floorFireDoors.map(d => {
            const x = d.position.x * 9.2 + 40
            const y = d.position.y * 4.8 + 40
            const isOpen = d.status === 'open'
            return (
              <g
                key={d.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeviceClick('fireDoor', d)}
                onMouseEnter={() => setHoveredDevice({ type: 'fireDoor', data: d })}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                <rect x="-12" y="-16" width="24" height="32"
                  fill={isOpen ? '#001529' : '#004080'}
                  stroke={isOpen ? '#faad14' : '#52c41a'}
                  strokeWidth="2"
                  rx="2"
                />
                {isOpen ? (
                  <line x1="-12" y1="16" x2="8" y2="8" stroke="#faad14" strokeWidth="2" />
                ) : (
                  <line x1="-2" y1="-16" x2="-2" y2="16" stroke="#002a4e" strokeWidth="1" />
                )}
                <circle cx="6" cy="-2" r="1.5" fill={isOpen ? '#faad14' : '#52c41a'} />
              </g>
            )
          })}

          {layerVisible.exhaust && floorExhausts.map(e => {
            const x = e.position.x * 9.2 + 40
            const y = e.position.y * 4.8 + 40
            const isRunning = e.status === 'running'
            return (
              <g
                key={e.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeviceClick('exhaust', e)}
                onMouseEnter={() => setHoveredDevice({ type: 'exhaust', data: e })}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                <rect x="-14" y="-10" width="28" height="20"
                  fill="#002a4e"
                  stroke={e.status === 'fault' ? '#ff4d4f' : isRunning ? '#1677ff' : '#8c8c8c'}
                  strokeWidth="2"
                  rx="3"
                />
                <g transform={isRunning ? '' : undefined}
                  style={{ transformOrigin: 'center', transform: isRunning ? 'rotate(45deg)' : 'none' }}
                >
                  <path d="M -6,-6 L 0,0 L 6,-6 L 6,6 L 0,0 L -6,6 Z" fill={isRunning ? '#1677ff' : '#444'} />
                </g>
                {isRunning && (
                  <text y="-14" textAnchor="middle" fill="#1677ff" fontSize="8" className="blink-alarm">
                    运转中
                  </text>
                )}
              </g>
            )
          })}

          {layerVisible.camera && floorCameras.map(c => {
            const x = c.position.x * 9.2 + 40
            const y = c.position.y * 4.8 + 40
            return (
              <g
                key={c.id}
                transform={`translate(${x}, ${y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeviceClick('camera', c)}
                onMouseEnter={() => setHoveredDevice({ type: 'camera', data: c })}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                <circle r="8" fill={c.status === 'online' ? '#002a4e' : '#3a1a1a'}
                  stroke={c.status === 'online' ? '#1677ff' : '#8c8c8c'} strokeWidth="1.5" />
                <circle r="3" fill={c.status === 'online' ? '#1677ff' : '#555'} />
                {c.status === 'online' && (
                  <>
                    <path d="M 0,-12 L -6,-20 M 0,-12 L 6,-20 M 0,-12 L 0,-22"
                      stroke="#1677ff" strokeWidth="1" opacity="0.6" />
                  </>
                )}
              </g>
            )
          })}

          {layerVisible.alarm && activeAlarms.map((a, i) => {
            const x = a.position.x * 9.2 + 40
            const y = a.position.y * 4.8 + 40
            return (
              <g key={`alarm-${a.id}`} transform={`translate(${x}, ${y - 35})`}
                className="pulse-alarm"
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeviceClick('alarm', a)}
              >
                <rect x="-40" y="-18" width="80" height="20" rx="4"
                  fill="#ff4d4f" stroke="#fff" strokeWidth="1" filter="url(#glow)" />
                <text y="-4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  报警 #{i + 1}
                </text>
                <polygon points="0,4 -4,0 4,0" fill="#ff4d4f" />
              </g>
            )
          })}

          <text x="920" y="500" textAnchor="end" fill="#0055aa" fontSize="20" fontWeight="bold" opacity="0.5">
            {floorData?.name} PLAN
          </text>
        </svg>

        {hoveredDevice && (
          <div style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #004080',
            borderRadius: 4,
            padding: 12,
            minWidth: 220,
            zIndex: 100
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#91caff' }}>
              {hoveredDevice.type === 'detector' && <><ApiOutlined /> 探测器</>}
              {hoveredDevice.type === 'fireDoor' && <><SafetyOutlined /> 防火门</>}
              {hoveredDevice.type === 'exhaust' && <><FanOutlined /> 排烟设备</>}
              {hoveredDevice.type === 'camera' && <><VideoCameraOutlined /> 监控摄像头</>}
            </div>
            {hoveredDevice.type === 'detector' && (
              <>
                <div style={{ fontSize: 12 }}>名称：{hoveredDevice.data.name}</div>
                <div style={{ fontSize: 12 }}>编号：{hoveredDevice.data.id}</div>
                <div style={{ fontSize: 12 }}>类型：{hoveredDevice.data.typeName}</div>
                <div style={{ fontSize: 12 }}>状态：
                  <Tag color={hoveredDevice.data.status === 'normal' ? 'green' : 'orange'} style={{ marginLeft: 4 }}>
                    {hoveredDevice.data.status === 'normal' ? '正常' : '异常'}
                  </Tag>
                </div>
              </>
            )}
            {hoveredDevice.type === 'fireDoor' && (
              <>
                <div style={{ fontSize: 12 }}>名称：{hoveredDevice.data.name}</div>
                <div style={{ fontSize: 12 }}>编号：{hoveredDevice.data.id}</div>
                <div style={{ fontSize: 12 }}>级别：{hoveredDevice.data.doorType}</div>
                <div style={{ fontSize: 12 }}>位置：{hoveredDevice.data.location}</div>
                <div style={{ fontSize: 12 }}>状态：
                  <Tag color={hoveredDevice.data.status === 'closed' ? 'green' : 'orange'} style={{ marginLeft: 4 }}>
                    {hoveredDevice.data.status === 'closed' ? '已关闭' : '开启中'}
                  </Tag>
                </div>
              </>
            )}
            {hoveredDevice.type === 'exhaust' && (
              <>
                <div style={{ fontSize: 12 }}>名称：{hoveredDevice.data.name}</div>
                <div style={{ fontSize: 12 }}>编号：{hoveredDevice.data.id}</div>
                <div style={{ fontSize: 12 }}>功率：{hoveredDevice.data.power}</div>
                <div style={{ fontSize: 12 }}>风量：{hoveredDevice.data.airflow}</div>
                <div style={{ fontSize: 12 }}>状态：
                  <Tag color={
                    hoveredDevice.data.status === 'running' ? 'blue'
                      : hoveredDevice.data.status === 'fault' ? 'red' : 'default'
                  } style={{ marginLeft: 4 }}>
                    {hoveredDevice.data.status === 'running' ? '运转中'
                      : hoveredDevice.data.status === 'fault' ? '故障' : '待机'}
                  </Tag>
                </div>
              </>
            )}
            {hoveredDevice.type === 'camera' && (
              <>
                <div style={{ fontSize: 12 }}>名称：{hoveredDevice.data.name}</div>
                <div style={{ fontSize: 12 }}>编号：{hoveredDevice.data.id}</div>
                <div style={{ fontSize: 12 }}>类型：{hoveredDevice.data.type}</div>
                <div style={{ fontSize: 12 }}>分辨率：{hoveredDevice.data.resolution}</div>
                <div style={{ fontSize: 12 }}>状态：
                  <Tag color={hoveredDevice.data.status === 'online' ? 'green' : 'default'} style={{ marginLeft: 4 }}>
                    {hoveredDevice.data.status === 'online' ? '在线' : '离线'}
                  </Tag>
                </div>
              </>
            )}
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8 }}>点击查看详情/操作</div>
          </div>
        )}

        <div style={{
          position: 'absolute', right: 12, top: 12,
          background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: 6,
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <Tooltip title="放大">
            <Button type="text" size="small" icon={<ZoomInOutlined />}
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              style={{ color: '#91caff' }} />
          </Tooltip>
          <Tooltip title="缩小">
            <Button type="text" size="small" icon={<ZoomOutOutlined />}
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              style={{ color: '#91caff' }} />
          </Tooltip>
          <Tooltip title="重置">
            <Button type="text" size="small" onClick={() => setZoom(1)}
              style={{ color: '#91caff', padding: '0 4px', fontSize: 11 }}>1:1</Button>
          </Tooltip>
        </div>
      </div>
    )
  }

  const stats = {
    detectors: { total: floorDetectors.length, normal: floorDetectors.filter(d => d.status === 'normal').length },
    fireDoors: { total: floorFireDoors.length, closed: floorFireDoors.filter(d => d.status === 'closed').length },
    exhausts: { total: floorExhausts.length, running: floorExhausts.filter(e => e.status === 'running').length,
      fault: floorExhausts.filter(e => e.status === 'fault').length },
    cameras: { total: floorCameras.length, online: floorCameras.filter(c => c.status === 'online').length }
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={4}>
          <Card size="small" title={<Space><DashboardOutlined />楼层选择</Space>} className="glass-card">
            <Segmented
              vertical
              value={currentFloor}
              onChange={handleFloorClick}
              style={{ width: '100%' }}
              options={floors.map(f => ({
                label: (
                  <div style={{ padding: '4px 8px', width: '100%' }}>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                      {detectors.filter(d => d.floor === f.id).length}个探测点
                    </div>
                  </div>
                ),
                value: f.id
              }))}
            />
          </Card>
        </Col>

        <Col span={20}>
          <Card
            size="small"
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#1677ff' }} />
                <span>{floors.find(f => f.id === currentFloor)?.name} - 平面布局图</span>
                {activeAlarms.length > 0 && (
                  <Tag color="red" className="blink-alarm">
                    <BellOutlined /> {activeAlarms.length} 个报警
                  </Tag>
                )}
                <Space style={{ marginLeft: 16 }} size={8}>
                  <Button size="small" type={layerVisible.detector ? 'primary' : 'default'}
                    onClick={() => setLayerVisible(v => ({ ...v, detector: !v.detector }))}>
                    <ApiOutlined /> 探测器
                  </Button>
                  <Button size="small" type={layerVisible.fireDoor ? 'primary' : 'default'}
                    onClick={() => setLayerVisible(v => ({ ...v, fireDoor: !v.fireDoor }))}>
                    <SafetyOutlined /> 防火门
                  </Button>
                  <Button size="small" type={layerVisible.exhaust ? 'primary' : 'default'}
                    onClick={() => setLayerVisible(v => ({ ...v, exhaust: !v.exhaust }))}>
                    <FanOutlined /> 排烟
                  </Button>
                  <Button size="small" type={layerVisible.camera ? 'primary' : 'default'}
                    onClick={() => setLayerVisible(v => ({ ...v, camera: !v.camera }))}>
                    <VideoCameraOutlined /> 摄像头
                  </Button>
                </Space>
              </Space>
            }
            className="glass-card"
          >
            {renderFloorPlan()}
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: 'rgba(82,196,26,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ApiOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>探测器</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {stats.detectors.normal}<span style={{ fontSize: 12, color: '#8c8c8c' }}>/{stats.detectors.total}</span>
                  </div>
                </div>
              </Space>
              <Tag color={stats.detectors.normal === stats.detectors.total ? 'green' : 'orange'}>
                正常 {Math.round(stats.detectors.normal / stats.detectors.total * 100)}%
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: 'rgba(250,173,20,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <SafetyOutlined style={{ color: '#faad14', fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>防火门</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {stats.fireDoors.closed}<span style={{ fontSize: 12, color: '#8c8c8c' }}>/{stats.fireDoors.total}</span>
                  </div>
                </div>
              </Space>
              <Tag color={stats.fireDoors.closed === stats.fireDoors.total ? 'green' : 'orange'}>
                已关闭 {Math.round(stats.fireDoors.closed / stats.fireDoors.total * 100)}%
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: 'rgba(22,119,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FanOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>排烟设备</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {stats.exhausts.running}<span style={{ fontSize: 12, color: '#8c8c8c' }}>/{stats.exhausts.total}</span>
                  </div>
                </div>
              </Space>
              <Space>
                {stats.exhausts.fault > 0 && <Tag color="red">故障{stats.exhausts.fault}</Tag>}
                <Tag color="blue">运行中</Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: 'rgba(114,46,209,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <VideoCameraOutlined style={{ color: '#722ed1', fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>监控点位</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {stats.cameras.online}<span style={{ fontSize: 12, color: '#8c8c8c' }}>/{stats.cameras.total}</span>
                  </div>
                </div>
              </Space>
              <Tag color={stats.cameras.online === stats.cameras.total ? 'green' : 'orange'}>
                在线 {Math.round(stats.cameras.online / stats.cameras.total * 100)}%
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card size="small"
            title={<Space><FireOutlined style={{ color: '#ff4d4f' }} /><span>图例说明</span></Space>}
            className="glass-card"
          >
            <Row gutter={[16, 12]}>
              <Col span={8}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#91caff' }}>探测器</div>
                {Object.entries(detectorTypes).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                    <span style={{
                      display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                      background: v.color, border: '1px solid #fff'
                    }} />
                    {v.name}
                  </div>
                ))}
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#91caff' }}>防火门</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 14, height: 18,
                    background: '#004080', border: '2px solid #52c41a', borderRadius: 2
                  }} />
                  已关闭
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 14, height: 18,
                    background: '#001529', border: '2px solid #faad14', borderRadius: 2
                  }} />
                  开启中
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#91caff' }}>排烟设备</div>
                <div style={{ fontSize: 12, marginBottom: 4 }}><Tag color="blue">运转中</Tag></div>
                <div style={{ fontSize: 12, marginBottom: 4 }}><Tag color="default">待机</Tag></div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#91caff' }}>摄像头</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                    background: '#002a4e', border: '1.5px solid #1677ff'
                  }} />
                  在线
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                    background: '#3a1a1a', border: '1.5px solid #8c8c8c'
                  }} />
                  离线
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#91caff' }}>报警标识</div>
                <div style={{ fontSize: 12, marginBottom: 4 }}><Tag color="red" className="blink-alarm">报警中</Tag></div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small"
            title={<Space><SearchOutlined style={{ color: '#1677ff' }} /><span>设备快速定位</span></Space>}
            className="glass-card"
          >
            <List
              size="small"
              dataSource={[
                ...floorDetectors.slice(0, 3).map(d => ({ ...d, kind: 'detector' })),
                ...floorFireDoors.slice(0, 2).map(d => ({ ...d, kind: 'fireDoor' })),
                ...floorCameras.slice(0, 2).map(c => ({ ...c, kind: 'camera' }))
              ]}
              renderItem={item => (
                <List.Item
                  style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #00408030' }}
                  onClick={() => setHoveredDevice({ type: item.kind, data: item })}
                >
                  <List.Item.Meta
                    avatar={
                      item.kind === 'detector'
                        ? <Avatar style={{ background: detectorTypes[item.type]?.color || '#52c41a' }} icon={<ApiOutlined />} />
                        : item.kind === 'fireDoor'
                          ? <Avatar style={{ background: item.status === 'closed' ? '#52c41a' : '#faad14' }} icon={<SafetyOutlined />} />
                          : <Avatar style={{ background: item.status === 'online' ? '#1677ff' : '#8c8c8c' }} icon={<VideoCameraOutlined />} />
                    }
                    title={<span style={{ fontSize: 12 }}>{item.name || item.detectorName}</span>}
                    description={
                      <Space size={8}>
                        <Tag color="default" style={{ fontSize: 10 }}>{item.id}</Tag>
                        {item.kind === 'detector' && (
                          <Tag color={item.status === 'normal' ? 'green' : 'orange'} style={{ fontSize: 10 }}>
                            {item.status === 'normal' ? '正常' : '异常'}
                          </Tag>
                        )}
                        {item.kind === 'fireDoor' && (
                          <Tag color={item.status === 'closed' ? 'green' : 'orange'} style={{ fontSize: 10 }}>
                            {item.status === 'closed' ? '已关' : '开启'}
                          </Tag>
                        )}
                        {item.kind === 'camera' && (
                          <Tag color={item.status === 'online' ? 'green' : 'default'} style={{ fontSize: 10 }}>
                            {item.status}
                          </Tag>
                        )}
                      </Space>
                    }
                  />
                  <Button type="link" size="small" onClick={(e) => {
                    e.stopPropagation()
                    if (item.kind === 'camera') openCamera(item)
                  }}>
                    <EyeOutlined /> 查看
                  </Button>
                </List.Item>
              )}
              style={{ maxHeight: 170, overflow: 'auto' }}
              className="scrollbar-thin"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default FloorPlan

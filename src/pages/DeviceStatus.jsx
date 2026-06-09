import React, { useMemo, useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Select, Statistic,
  Tabs, Switch, App as AntdApp, Tooltip, Divider
} from 'antd'
import {
  ApiOutlined, SafetyOutlined,
  FilterOutlined, SearchOutlined, ReloadOutlined,
  CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  EyeOutlined, SettingOutlined, ThunderboltOutlined, VideoCameraOutlined
} from '@ant-design/icons'
const FanOutlined = ThunderboltOutlined
import { useStore } from '../store/useStore'
import { floors } from '../data/mockData'

const { Option } = Select

const DeviceStatus = () => {
  const { message } = AntdApp.useApp()
  const {
    detectors, fireDoors, exhausts, cameras,
    deviceFilter, setDeviceFilter, toggleFireDoor, toggleExhaust, openCamera
  } = useStore()

  const summary = useMemo(() => {
    const calcStats = (list, okStatuses) => {
      const total = list.length
      const ok = list.filter(d => okStatuses.includes(d.status)).length
      const fault = total - ok
      return { total, ok, fault }
    }
    return {
      detector: calcStats(detectors, ['normal']),
      fireDoor: calcStats(fireDoors, ['closed']),
      exhaust: calcStats(exhausts, ['running', 'standby']),
      camera: calcStats(cameras, ['online'])
    }
  }, [detectors, fireDoors, exhausts, cameras])

  const filteredDetectors = useMemo(() => detectors.filter(d => {
    if (deviceFilter.floor !== 'all' && d.floor !== deviceFilter.floor) return false
    if (deviceFilter.status !== 'all') {
      if (deviceFilter.status === '在线' && d.status !== 'normal') return false
      if (deviceFilter.status === '异常' && d.status !== 'fault') return false
    }
    return true
  }), [detectors, deviceFilter])

  const filteredFireDoors = useMemo(() => fireDoors.filter(d => {
    if (deviceFilter.floor !== 'all' && d.floor !== deviceFilter.floor) return false
    if (deviceFilter.status !== 'all') {
      if (deviceFilter.status === '在线' && d.status !== 'closed') return false
      if (deviceFilter.status === '异常' && d.status !== 'open') return false
    }
    return true
  }), [fireDoors, deviceFilter])

  const filteredExhausts = useMemo(() => exhausts.filter(e => {
    if (deviceFilter.floor !== 'all' && e.floor !== deviceFilter.floor) return false
    if (deviceFilter.status !== 'all') {
      if (deviceFilter.status === '在线' && !['running', 'standby'].includes(e.status)) return false
      if (deviceFilter.status === '异常' && e.status !== 'fault') return false
    }
    return true
  }), [exhausts, deviceFilter])

  const filteredCameras = useMemo(() => cameras.filter(c => {
    if (deviceFilter.floor !== 'all' && c.floor !== deviceFilter.floor) return false
    if (deviceFilter.status !== 'all') {
      if (deviceFilter.status === '在线' && c.status !== 'online') return false
      if (deviceFilter.status === '异常' && c.status !== 'offline') return false
    }
    return true
  }), [cameras, deviceFilter])

  const detectorColumns = [
    { title: '楼层', dataIndex: 'floor', width: 80, render: t => <Tag color="blue">{t}</Tag> },
    { title: '设备编号', dataIndex: 'id', width: 140,
      render: t => <span style={{ fontFamily: 'monospace', color: '#91caff' }}>{t}</span> },
    { title: '设备名称', dataIndex: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'typeName', width: 110 },
    { title: '安装日期', dataIndex: 'installDate', width: 110 },
    { title: '上次检查', dataIndex: 'lastCheck', width: 110 },
    { title: '状态', dataIndex: 'status', width: 90,
      render: s => (
        <Tag color={s === 'normal' ? 'green' : 'orange'}
          icon={s === 'normal' ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {s === 'normal' ? '正常' : '异常'}
        </Tag>
      )
    }
  ]

  const fireDoorColumns = [
    { title: '楼层', dataIndex: 'floor', width: 80, render: t => <Tag color="blue">{t}</Tag> },
    { title: '设备编号', dataIndex: 'id', width: 140,
      render: t => <span style={{ fontFamily: 'monospace', color: '#91caff' }}>{t}</span> },
    { title: '名称', dataIndex: 'name' },
    { title: '防火等级', dataIndex: 'doorType', width: 90 },
    { title: '安装位置', dataIndex: 'location', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100,
      render: s => (
        <Tag color={s === 'closed' ? 'green' : 'orange'}
          icon={s === 'closed' ? <SafetyOutlined /> : <ExclamationCircleOutlined />}>
          {s === 'closed' ? '已关闭' : '开启中'}
        </Tag>
      )
    },
    { title: '控制', width: 120,
      render: (_, r) => (
        <Switch
          checked={r.status === 'closed'}
          checkedChildren="已关"
          unCheckedChildren="开启"
          onChange={() => { toggleFireDoor(r.id); message.success('状态已更新') }}
        />
      )
    }
  ]

  const exhaustColumns = [
    { title: '楼层', dataIndex: 'floor', width: 80, render: t => <Tag color="blue">{t}</Tag> },
    { title: '设备编号', dataIndex: 'id', width: 140,
      render: t => <span style={{ fontFamily: 'monospace', color: '#91caff' }}>{t}</span> },
    { title: '名称', dataIndex: 'name' },
    { title: '功率', dataIndex: 'power', width: 100 },
    { title: '风量', dataIndex: 'airflow', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100,
      render: s => {
        const config = {
          running: { color: 'blue', text: '运转中', icon: <FanOutlined spin /> },
          standby: { color: 'default', text: '待机', icon: <CheckCircleOutlined /> },
          fault: { color: 'red', text: '故障', icon: <WarningOutlined /> }
        }
        const c = config[s]
        return <Tag color={c.color} icon={c.icon}>{c.text}</Tag>
      }
    },
    { title: '控制', width: 120,
      render: (_, r) => (
        <Button
          type={r.status === 'running' ? 'default' : 'primary'}
          size="small"
          danger={r.status !== 'running'}
          disabled={r.status === 'fault'}
          onClick={() => { toggleExhaust(r.id); message.success('状态已更新') }}
        >
          {r.status === 'running' ? '停止' : r.status === 'standby' ? '启动' : '故障'}
        </Button>
      )
    }
  ]

  const cameraColumns = [
    { title: '楼层', dataIndex: 'floor', width: 80, render: t => <Tag color="blue">{t}</Tag> },
    { title: '设备编号', dataIndex: 'id', width: 140,
      render: t => <span style={{ fontFamily: 'monospace', color: '#91caff' }}>{t}</span> },
    { title: '名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type', width: 80 },
    { title: '分辨率', dataIndex: 'resolution', width: 110 },
    { title: '状态', dataIndex: 'status', width: 90,
      render: s => (
        <Tag color={s === 'online' ? 'green' : 'default'}
          icon={s === 'online' ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {s === 'online' ? '在线' : '离线'}
        </Tag>
      )
    },
    { title: '操作', width: 100,
      render: (_, r) => (
        <Button type="primary" size="small" icon={<EyeOutlined />}
          onClick={() => r.status === 'online' && openCamera(r)}
          disabled={r.status !== 'online'}
        >
          查看
        </Button>
      )
    }
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(82,196,26,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ApiOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>探测器总数</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {summary.detector.total}
                    <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 6 }}>
                      {summary.detector.ok}正常
                    </span>
                  </div>
                </div>
              </Space>
              {summary.detector.fault > 0 && (
                <Tag color="red" style={{ fontSize: 12 }}>故障 {summary.detector.fault}</Tag>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(250,173,20,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <SafetyOutlined style={{ color: '#faad14', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>防火门总数</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {summary.fireDoor.total}
                    <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 6 }}>
                      {summary.fireDoor.ok}已关
                    </span>
                  </div>
                </div>
              </Space>
              {summary.fireDoor.fault > 0 && (
                <Tag color="orange" style={{ fontSize: 12 }}>开启 {summary.fireDoor.fault}</Tag>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(22,119,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FanOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>排烟设备</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {summary.exhaust.total}
                    <span style={{ fontSize: 12, color: '#1677ff', marginLeft: 6 }}>
                      {summary.exhaust.ok}正常
                    </span>
                  </div>
                </div>
              </Space>
              {summary.exhaust.fault > 0 && (
                <Tag color="red" style={{ fontSize: 12 }}>故障 {summary.exhaust.fault}</Tag>
              )}
            </div>
          </Card>
        </Col>
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
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>监控点位</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {summary.camera.total}
                    <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 6 }}>
                      {summary.camera.ok}在线
                    </span>
                  </div>
                </div>
              </Space>
              {summary.camera.fault > 0 && (
                <Tag color="default" style={{ fontSize: 12 }}>离线 {summary.camera.fault}</Tag>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <Space>
            <FilterOutlined style={{ color: '#1677ff' }} />
            <span>设备筛选条件</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              size="small" value={deviceFilter.floor} style={{ width: 120 }}
              onChange={v => setDeviceFilter({ floor: v })}
              prefix={<span style={{ color: '#8c8c8c' }}>楼层</span>}
            >
              <Option value="all">全部楼层</Option>
              {floors.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
            </Select>
            <Select
              size="small" value={deviceFilter.type} style={{ width: 120 }}
              onChange={v => setDeviceFilter({ type: v })}
              prefix={<span style={{ color: '#8c8c8c' }}>类型</span>}
            >
              <Option value="all">全部类型</Option>
              <Option value="探测器">探测器</Option>
              <Option value="防火门">防火门</Option>
              <Option value="排烟设备">排烟设备</Option>
              <Option value="摄像头">摄像头</Option>
            </Select>
            <Select
              size="small" value={deviceFilter.status} style={{ width: 120 }}
              onChange={v => setDeviceFilter({ status: v })}
              prefix={<span style={{ color: '#8c8c8c' }}>状态</span>}
            >
              <Option value="all">全部状态</Option>
              <Option value="在线">正常/在线</Option>
              <Option value="异常">异常/离线</Option>
            </Select>
            <Button size="small" icon={<ReloadOutlined />}
              onClick={() => setDeviceFilter({ floor: 'all', type: 'all', status: 'all' })}>
              重置
            </Button>
          </Space>
        }
        className="glass-card"
      >
        <Tabs
          defaultActiveKey="detector"
          size="small"
          items={[
            {
              key: 'detector',
              label: <span><ApiOutlined /> 探测器 ({filteredDetectors.length})</span>,
              children: (
                <Table
                  size="small"
                  dataSource={filteredDetectors}
                  columns={detectorColumns}
                  rowKey="id"
                  scroll={{ y: 440, x: 900 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 台设备` }}
                />
              )
            },
            {
              key: 'fireDoor',
              label: <span><SafetyOutlined /> 防火门 ({filteredFireDoors.length})</span>,
              children: (
                <Table
                  size="small"
                  dataSource={filteredFireDoors}
                  columns={fireDoorColumns}
                  rowKey="id"
                  scroll={{ y: 440, x: 900 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 樘防火门` }}
                />
              )
            },
            {
              key: 'exhaust',
              label: <span><FanOutlined /> 排烟设备 ({filteredExhausts.length})</span>,
              children: (
                <Table
                  size="small"
                  dataSource={filteredExhausts}
                  columns={exhaustColumns}
                  rowKey="id"
                  scroll={{ y: 440, x: 900 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 台设备` }}
                />
              )
            },
            {
              key: 'camera',
              label: <span><VideoCameraOutlined /> 摄像头 ({filteredCameras.length})</span>,
              children: (
                <Table
                  size="small"
                  dataSource={filteredCameras}
                  columns={cameraColumns}
                  rowKey="id"
                  scroll={{ y: 440, x: 900 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 个点位` }}
                />
              )
            }
          ]}
        />
      </Card>
    </Space>
  )
}

export default DeviceStatus

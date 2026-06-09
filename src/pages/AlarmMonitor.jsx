import React, { useState, useMemo } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Select, Statistic,
  Timeline, Badge, App as AntdApp, Tooltip, Popconfirm
} from 'antd'
import {
  WarningOutlined, BellOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, SearchOutlined, PrinterOutlined, FileTextOutlined,
  FireOutlined, ThunderboltOutlined, EnvironmentOutlined, FilterOutlined,
  VideoCameraOutlined, ExclamationCircleFilled
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { floors, alarmLevelConfig } from '../data/mockData'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const AlarmMonitor = () => {
  const { message, modal } = AntdApp.useApp()
  const {
    alarms, openAlarmModal, triggerAlarm, confirmAlarm, markFalseAlarm,
    openCamera, openDisposalModal, openPrintModal, cameras, currentUser,
    systemStatus
  } = useStore()

  const [statusFilter, setStatusFilter] = useState('all')
  const [floorFilter, setFloorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [keyword, setKeyword] = useState('')

  const filteredAlarms = useMemo(() => {
    return alarms.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (floorFilter !== 'all' && a.floor !== floorFilter) return false
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (keyword) {
        const kw = keyword.toLowerCase()
        return a.detectorName.toLowerCase().includes(kw) ||
          a.id.toLowerCase().includes(kw) ||
          a.floor.toLowerCase().includes(kw)
      }
      return true
    })
  }, [alarms, statusFilter, floorFilter, typeFilter, keyword])

  const todayAlarms = alarms.filter(a =>
    dayjs(a.createdAt).isSame(dayjs(), 'day')
  )
  const pendingCount = alarms.filter(a => a.status === 'pending').length
  const confirmedCount = alarms.filter(a => a.status === 'confirmed').length
  const falseCount = alarms.filter(a => a.status === 'false').length
  const avgResponse = confirmedCount > 0
    ? Math.round(alarms.filter(a => a.status === 'confirmed').reduce((s, a) => s + a.responseTime, 0) / confirmedCount)
    : 0

  const columns = [
    {
      title: '报警时间',
      dataIndex: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{dayjs(v).format('MM-DD HH:mm:ss')}</span>
          <span style={{ fontSize: 11, color: '#8c8c8c' }}>{dayjs(v).fromNow()}</span>
        </Space>
      )
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 80,
      render: (_, r) => {
        const colors = ['#f5222d', '#ff4d4f', '#faad14', '#8c8c8c']
        return (
          <Tag color={colors[r.level - 1]} style={{ fontWeight: 600 }}>
            {r.level === 1 ? 'Ⅰ' : r.level === 2 ? 'Ⅱ' : r.level === 3 ? 'Ⅲ' : 'Ⅳ'}
          </Tag>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'typeName',
      width: 100,
      render: (t, r) => (
        <Tag color={r.color} icon={r.level <= 2 ? <ThunderboltOutlined /> : <BellOutlined />}>
          {t}
        </Tag>
      )
    },
    {
      title: '编号',
      dataIndex: 'id',
      width: 120,
      render: t => <span style={{ fontFamily: 'monospace', color: '#91caff' }}>{t}</span>
    },
    {
      title: '楼层/区域',
      dataIndex: 'floor',
      width: 100,
      render: (t, r) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: r.color }} />
          <Tag color="blue">{t}</Tag>
        </Space>
      )
    },
    {
      title: '触发设备',
      dataIndex: 'detectorName',
      ellipsis: true,
      render: (t, r) => (
        <Tooltip title={t}>
          <Space>
            {r.status === 'pending' && <span className="blink-alarm" style={{ color: '#ff4d4f' }}>●</span>}
            {t}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '响应时长',
      dataIndex: 'responseTime',
      width: 100,
      render: (v, r) => {
        if (r.status === 'pending') {
          const elapsed = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 1000)
          return (
            <Tag color="red" className="blink-alarm">
              {Math.floor(elapsed / 60)}分{elapsed % 60}秒
            </Tag>
          )
        }
        if (v > 0) {
          const color = v < 60 ? 'green' : v < 180 ? 'orange' : 'red'
          return <Tag color={color}>{Math.floor(v / 60)}分{v % 60}秒</Tag>
        }
        return <span style={{ color: '#8c8c8c' }}>—</span>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s) => {
        const config = {
          pending: { color: 'red', text: '待处理', icon: <WarningOutlined spin /> },
          confirmed: { color: 'blue', text: '已确认', icon: <CheckCircleOutlined /> },
          false: { color: 'default', text: '误报', icon: <CloseCircleOutlined /> }
        }
        const c = config[s]
        return <Tag color={c.color} icon={c.icon}>{c.text}</Tag>
      }
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, r) => {
        const relatedCamera = cameras.find(c => c.relatedDetectorId === r.detectorId)
        return (
          <Space size={4}>
            <Button type="link" size="small" onClick={() => openAlarmModal(r)}>
              详情
            </Button>
            {r.status === 'pending' && (
              <>
                <Popconfirm
                  title="确认该警情？"
                  description="确认后将从待处理列表移除"
                  icon={<ExclamationCircleFilled style={{ color: '#ff4d4f' }} />}
                  onConfirm={() => { confirmAlarm(r.id, currentUser.name); message.success('已确认') }}
                >
                  <Button type="primary" size="small">确认</Button>
                </Popconfirm>
                <Button type="link" size="small" danger onClick={() => {
                  modal.confirm({
                    title: '标记为误报',
                    content: '请在详情中填写误报原因，确认标记？',
                    onOk: () => markFalseAlarm(r.id, currentUser.name, '快速标记')
                  })
                }}>误报</Button>
              </>
            )}
            <Button
              type="link" size="small"
              icon={<VideoCameraOutlined />}
              onClick={() => relatedCamera && openCamera(relatedCamera)}
            >视频</Button>
            <Button
              type="link" size="small"
              icon={<FileTextOutlined />}
              onClick={() => openDisposalModal(r)}
            >处置</Button>
            <Button
              type="link" size="small"
              icon={<PrinterOutlined />}
              onClick={() => openPrintModal(r)}
            >打印</Button>
          </Space>
        )
      }
    }
  ]

  const recentPending = alarms.filter(a => a.status === 'pending').slice(0, 5)

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="待处理警情"
              value={pendingCount}
              valueStyle={{ color: pendingCount > 0 ? '#ff4d4f' : '#52c41a' }}
              prefix={
                <Badge dot={pendingCount > 0} status="error">
                  <WarningOutlined />
                </Badge>
              }
              suffix={<span style={{ fontSize: 14 }}>条</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="今日报警"
              value={todayAlarms.length}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FireOutlined />}
              suffix={<span style={{ fontSize: 14 }}>条</span>}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              已确认 {todayAlarms.filter(a => a.status === 'confirmed').length} ·
              误报 {todayAlarms.filter(a => a.status === 'false').length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="平均响应时长"
              value={avgResponse}
              valueStyle={{ color: avgResponse < 60 ? '#52c41a' : avgResponse < 180 ? '#faad14' : '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
              suffix={<span style={{ fontSize: 14 }}>秒</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="累计处理"
              value={confirmedCount + falseCount}
              valueStyle={{ color: '#1677ff' }}
              prefix={<CheckCircleOutlined />}
              suffix={
                <span style={{ fontSize: 14 }}>
                  （误报 {falseCount}）
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={17}>
          <Card
            size="small"
            title={
              <Space>
                <BellOutlined style={{ color: '#1677ff' }} />
                <span>报警记录列表</span>
                <Tag color="blue">{filteredAlarms.length} 条记录</Tag>
              </Space>
            }
            extra={
              <Space>
                <Search
                  placeholder="搜索设备名称/编号..."
                  size="small"
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  allowClear
                />
                <Select
                  size="small" value={statusFilter} style={{ width: 100 }}
                  onChange={setStatusFilter}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="pending">待处理</Option>
                  <Option value="confirmed">已确认</Option>
                  <Option value="false">误报</Option>
                </Select>
                <Select
                  size="small" value={floorFilter} style={{ width: 100 }}
                  onChange={setFloorFilter}
                >
                  <Option value="all">全部楼层</Option>
                  {floors.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}
                </Select>
                <Select
                  size="small" value={typeFilter} style={{ width: 120 }}
                  onChange={setTypeFilter}
                >
                  <Option value="all">全部类型</Option>
                  {Object.entries(alarmLevelConfig).map(([k, v]) => (
                    <Option key={k} value={k}>{v.name}</Option>
                  ))}
                </Select>
                <Button
                  type="primary" danger size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => { triggerAlarm(); message.warning('已触发模拟报警') }}
                >模拟报警</Button>
              </Space>
            }
            className="glass-card"
            style={{ minHeight: 520 }}
          >
            <Table
              size="small"
              dataSource={filteredAlarms}
              columns={columns}
              rowKey="id"
              rowClassName={r => r.status === 'pending' ? 'blink-alarm' : ''}
              scroll={{ x: 1200, y: 440 }}
              pagination={{
                pageSize: 12,
                showSizeChanger: false,
                showTotal: t => `共 ${t} 条`
              }}
            />
          </Card>
        </Col>

        <Col span={7}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card
              size="small"
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#ff4d4f' }} />
                  <span>待处理警情</span>
                  {recentPending.length > 0 && (
                    <Badge count={recentPending.length} style={{ backgroundColor: '#ff4d4f' }} />
                  )}
                </Space>
              }
              className="glass-card"
              style={recentPending.length === 0 ? { minHeight: 200 } : {}}
            >
              {recentPending.length > 0 ? (
                <Timeline
                  mode="left"
                  items={recentPending.map(a => ({
                    color: a.level <= 2 ? 'red' : 'orange',
                    label: dayjs(a.createdAt).format('HH:mm:ss'),
                    children: (
                      <div
                        style={{
                          padding: 8, borderRadius: 4,
                          background: a.level <= 2 ? 'rgba(245,34,45,0.1)' : 'rgba(250,173,20,0.1)',
                          border: `1px solid ${a.level <= 2 ? '#ff4d4f' : '#faad14'}40`,
                          cursor: 'pointer'
                        }}
                        onClick={() => openAlarmModal(a)}
                        className={a.level <= 2 ? 'pulse-alarm' : ''}
                      >
                        <div style={{ fontWeight: 600 }}>
                          <Tag color={a.color} style={{ marginRight: 6 }}>{a.typeName}</Tag>
                          {a.floor}
                        </div>
                        <div style={{ fontSize: 12, color: '#d9d9d9', marginTop: 4 }}>
                          {a.detectorName}
                        </div>
                        <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>
                          <ClockCircleOutlined /> 已等待 {Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60000)}分
                        </div>
                      </div>
                    )
                  }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#52c41a' }}>
                  <CheckCircleOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                  <div style={{ fontSize: 16 }}>暂无待处理警情</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>系统运行正常</div>
                </div>
              )}
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <FilterOutlined style={{ color: '#1677ff' }} />
                  <span>报警类型分布（近30天）</span>
                </Space>
              }
              className="glass-card"
            >
              {Object.entries(alarmLevelConfig).map(([type, cfg]) => {
                const count = alarms.filter(a => a.type === type).length
                const pct = alarms.length > 0 ? Math.round(count / alarms.length * 100) : 0
                return (
                  <div key={type} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>
                        <span style={{
                          display: 'inline-block', width: 10, height: 10,
                          background: cfg.color, borderRadius: 2, marginRight: 6
                        }} />
                        {cfg.name}
                      </span>
                      <span style={{ fontSize: 12, color: '#91caff' }}>{count} 条 · {pct}%</span>
                    </div>
                    <div style={{
                      width: '100%', height: 6, background: '#002a4e', borderRadius: 3, overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)`,
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                )
              })}
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <ExclamationCircleFilled style={{ color: '#faad14' }} />
                  <span>系统提醒</span>
                </Space>
              }
              className="glass-card"
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {systemStatus.faultDevices > 0 && (
                  <Tag color="red" style={{ width: '100%' }}>
                    ⚠ 当前有 {systemStatus.faultDevices} 个设备处于故障状态，请及时处理
                  </Tag>
                )}
                {systemStatus.fireDoorsOpen > 0 && (
                  <Tag color="orange" style={{ width: '100%' }}>
                    🚪 {systemStatus.fireDoorsOpen} 个防火门处于开启状态
                  </Tag>
                )}
                <Tag color="blue" style={{ width: '100%' }}>
                  📋 下次设备巡检：2天后（建议每周一次）
                </Tag>
                <Tag color="purple" style={{ width: '100%' }}>
                  🎯 本月消防演练：已完成1次，还需1次
                </Tag>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

export default AlarmMonitor

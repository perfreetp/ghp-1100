import React, { useState, useMemo } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, DatePicker, Select,
  App as AntdApp, Statistic, Empty, Tabs, Descriptions, Modal,
  InputNumber
} from 'antd'
import {
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  CalendarOutlined, SearchOutlined, FileTextOutlined,
  DownloadOutlined, PrinterOutlined, PlayCircleOutlined,
  ClockCircleOutlined, CheckCircleOutlined, WarningOutlined,
  BellOutlined, ThunderboltOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const ReviewStats = () => {
  const { message, modal } = AntdApp.useApp()
  const { alarms, getAlarmsByDateRange, dutyLogs, notifications, disposalSteps, contacts, detectors } = useStore()

  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()])
  const [floorFilter, setFloorFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drillOpen, setDrillOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [drillSpeed, setDrillSpeed] = useState(1)
  const [drillPlaying, setDrillPlaying] = useState(false)
  const [drillStep, setDrillStep] = useState(0)

  const filteredAlarms = useMemo(() => {
    const rangeAlarms = dateRange && dateRange.length === 2
      ? getAlarmsByDateRange(dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD'))
      : alarms
    return rangeAlarms.filter(a => {
      if (floorFilter !== 'all' && a.floor !== floorFilter) return false
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [alarms, dateRange, floorFilter, typeFilter, statusFilter, getAlarmsByDateRange])

  const stats = useMemo(() => {
    const total = filteredAlarms.length
    const confirmed = filteredAlarms.filter(a => a.status === 'confirmed').length
    const falseAlarms = filteredAlarms.filter(a => a.status === 'false').length
    const pending = filteredAlarms.filter(a => a.status === 'pending').length
    const responseTimes = filteredAlarms.filter(a => a.responseTime > 0).map(a => a.responseTime)
    const avgResponse = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length)
      : 0
    const maxResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0
    const minResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0
    const falseRate = total > 0 ? Math.round(falseAlarms / total * 100) : 0

    const byType = {}
    filteredAlarms.forEach(a => { byType[a.typeName] = (byType[a.typeName] || 0) + 1 })

    const byFloor = {}
    filteredAlarms.forEach(a => { byFloor[a.floor] = (byFloor[a.floor] || 0) + 1 })

    const byDay = {}
    filteredAlarms.forEach(a => {
      const day = dayjs(a.createdAt).format('MM-DD')
      byDay[day] = (byDay[day] || 0) + 1
    })
    const sortedDays = Object.keys(byDay).sort()

    const byStatus = [
      { name: '已确认', value: confirmed, color: '#1677ff' },
      { name: '误报', value: falseAlarms, color: '#8c8c8c' },
      { name: '待处理', value: pending, color: '#ff4d4f' }
    ].filter(i => i.value > 0)

    const responseDistribution = {
      '<1分钟': responseTimes.filter(t => t < 60).length,
      '1-3分钟': responseTimes.filter(t => t >= 60 && t < 180).length,
      '3-5分钟': responseTimes.filter(t => t >= 180 && t < 300).length,
      '>5分钟': responseTimes.filter(t => t >= 300).length
    }

    return {
      total, confirmed, falseAlarms, pending,
      avgResponse, maxResponse, minResponse, falseRate,
      byType, byFloor, byDay: sortedDays.map(d => ({ day: d, count: byDay[d] })),
      byStatus, responseDistribution
    }
  }, [filteredAlarms])

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: stats.byDay.map(d => d.day),
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' },
      splitLine: { lineStyle: { color: '#004080', opacity: 0.3 } }
    },
    series: [{
      data: stats.byDay.map(d => d.count),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#1677ff', width: 3 },
      itemStyle: { color: '#1677ff', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(22,119,255,0.4)' },
            { offset: 1, color: 'rgba(22,119,255,0.02)' }
          ]
        }
      }
    }]
  }

  const typeOption = {
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0, textStyle: { color: '#91caff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#001529',
        borderWidth: 2
      },
      label: { color: '#e6f4ff' },
      data: Object.entries(stats.byType).map(([name, value], idx) => ({
        value, name,
        itemStyle: { color: ['#ff4d4f', '#fa8c16', '#eb2f96', '#f5222d', '#faad14', '#8c8c8c'][idx % 6] }
      }))
    }]
  }

  const floorOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' },
      splitLine: { lineStyle: { color: '#004080', opacity: 0.3 } }
    },
    yAxis: {
      type: 'category',
      data: Object.keys(stats.byFloor),
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' }
    },
    series: [{
      type: 'bar',
      data: Object.values(stats.byFloor),
      barWidth: 18,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#1677ff' },
            { offset: 1, color: '#722ed1' }
          ]
        }
      },
      label: { show: true, position: 'right', color: '#91caff' }
    }]
  }

  const statusOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#91caff' } },
    series: [{
      type: 'pie',
      radius: '60%',
      data: stats.byStatus.map(s => ({ ...s, itemStyle: { color: s.color } })),
      label: { color: '#e6f4ff' }
    }]
  }

  const responseOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: Object.keys(stats.responseDistribution),
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#004080' } },
      axisLabel: { color: '#91caff' },
      splitLine: { lineStyle: { color: '#004080', opacity: 0.3 } }
    },
    series: [{
      type: 'bar',
      data: Object.values(stats.responseDistribution),
      barWidth: 36,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: (params) => {
          const colors = ['#52c41a', '#1677ff', '#faad14', '#ff4d4f']
          return colors[params.dataIndex]
        }
      },
      label: { show: true, position: 'top', color: '#91caff' }
    }]
  }

  const historyColumns = [
    { title: '时间', dataIndex: 'createdAt', width: 150,
      render: v => dayjs(v).format('YYYY-MM-DD HH:mm:ss') },
    { title: '类型', dataIndex: 'typeName', width: 100,
      render: (t, r) => <Tag color={r.color}>{t}</Tag> },
    { title: '楼层', dataIndex: 'floor', width: 80,
      render: t => <Tag color="blue">{t}</Tag> },
    { title: '触发设备', dataIndex: 'detectorName', ellipsis: true },
    { title: '响应时长', dataIndex: 'responseTime', width: 110,
      render: (v, r) => {
        if (r.status === 'pending') return <Tag color="red" className="blink-alarm">未响应</Tag>
        if (v <= 0) return <span style={{ color: '#8c8c8c' }}>—</span>
        const color = v < 60 ? 'green' : v < 180 ? 'orange' : 'red'
        return <Tag color={color}>{Math.floor(v / 60)}分{v % 60}秒</Tag>
      }
    },
    { title: '状态', dataIndex: 'statusText', width: 90,
      render: (t, r) => <Tag color={r.status === 'confirmed' ? 'blue' : r.status === 'false' ? 'default' : 'red'}>{t}</Tag> },
    { title: '确认人', dataIndex: 'confirmedBy', width: 100,
      render: t => t || '—' }
  ]

  const handleGenerateReport = () => {
    const todayAlarms = alarms.filter(a => dayjs(a.createdAt).isSame(dayjs(), 'day'))
    const todayLogs = dutyLogs.filter(l => l.date === dayjs().format('YYYY-MM-DD'))
    const data = {
      date: dayjs().format('YYYY年MM月DD日'),
      generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalAlarms: todayAlarms.length,
      confirmed: todayAlarms.filter(a => a.status === 'confirmed').length,
      falseAlarms: todayAlarms.filter(a => a.status === 'false').length,
      pending: todayAlarms.filter(a => a.status === 'pending').length,
      avgResponse: todayAlarms.filter(a => a.responseTime > 0).length > 0
        ? Math.round(todayAlarms.filter(a => a.responseTime > 0).reduce((s, a) => s + a.responseTime, 0) / todayAlarms.filter(a => a.responseTime > 0).length)
        : 0,
      handovers: todayLogs.length,
      notificationsSent: notifications.filter(n => dayjs(n.notifiedAt).isSame(dayjs(), 'day')).length,
      devicesOnline: detectors.filter(d => d.status === 'normal').length,
      devicesTotal: detectors.length,
      alarmsDetail: todayAlarms
    }
    setReportData(data)
    setReportOpen(true)
  }

  const drillSteps = [
    { time: '00:00', title: '系统启动', desc: '消防监控系统启动，设备自检完成', color: '#52c41a' },
    { time: '00:15', title: '探测器触发', desc: '3层东区烟感探测器报警', color: '#ff4d4f' },
    { time: '00:22', title: '报警弹窗', desc: '中控屏幕显示报警弹窗，声光报警启动', color: '#ff4d4f' },
    { time: '00:45', title: '值班员确认', desc: '值班员确认报警，响应时长23秒', color: '#1677ff' },
    { time: '01:00', title: '视频调取', desc: '调取3层相关监控摄像头查看现场', color: '#722ed1' },
    { time: '01:20', title: '电话通知', desc: '通知安保队长、消防主管、工程维修员', color: '#faad14' },
    { time: '02:10', title: '现场核查', desc: '安保人员到达现场，确认为测试烟雾', color: '#52c41a' },
    { time: '02:40', title: '标记误报', desc: '经核实标记为误报，记录原因', color: '#8c8c8c' },
    { time: '03:00', title: '处置完成', desc: '填写处置记录，恢复系统正常状态', color: '#52c41a' },
    { time: '03:15', title: '报告归档', desc: '生成处置报告并打印存档', color: '#1677ff' }
  ]

  const handlePlayDrill = () => {
    setDrillStep(0)
    setDrillPlaying(true)
  }

  React.useEffect(() => {
    let timer
    if (drillPlaying && drillStep < drillSteps.length - 1) {
      timer = setTimeout(() => setDrillStep(s => s + 1), 2000 / drillSpeed)
    } else if (drillStep >= drillSteps.length - 1) {
      setDrillPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [drillPlaying, drillStep, drillSpeed])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="查询范围内警情"
              value={stats.total}
              valueStyle={{ color: '#1677ff' }}
              prefix={<BellOutlined />}
              suffix={<span style={{ fontSize: 14 }}>起</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="平均响应时长"
              value={stats.avgResponse}
              valueStyle={{ color: stats.avgResponse < 60 ? '#52c41a' : stats.avgResponse < 180 ? '#faad14' : '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
              suffix={<span style={{ fontSize: 14 }}>秒</span>}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              最快 {stats.minResponse}s · 最慢 {stats.maxResponse}s
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <Statistic
              title="误报率"
              value={stats.falseRate}
              valueStyle={{ color: stats.falseRate < 15 ? '#52c41a' : stats.falseRate < 30 ? '#faad14' : '#ff4d4f' }}
              prefix={<WarningOutlined />}
              suffix={<span style={{ fontSize: 14 }}>%</span>}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              误报 {stats.falseAlarms} 起 / 确认 {stats.confirmed} 起
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Statistic
                title="待处理"
                value={stats.pending}
                valueStyle={{ color: stats.pending > 0 ? '#ff4d4f' : '#52c41a' }}
                prefix={stats.pending > 0 ? <ThunderboltOutlined className="blink-alarm" /> : <CheckCircleOutlined />}
              />
              <Space direction="vertical" size={4}>
                <Button size="small" type="primary" icon={<FileTextOutlined />} onClick={handleGenerateReport}>
                  值班日报
                </Button>
                <Button size="small" icon={<PlayCircleOutlined />} onClick={() => { setDrillOpen(true); setDrillStep(0); setDrillPlaying(false) }}>
                  演练回放
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <Space>
            <BarChartOutlined style={{ color: '#1677ff' }} />
            <span>查询与筛选</span>
          </Space>
        }
        extra={
          <Space>
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>时间范围：</span>
            <RangePicker size="small" value={dateRange} onChange={setDateRange} />
            <Select size="small" value={floorFilter} style={{ width: 100 }} onChange={setFloorFilter}>
              <Option value="all">全部楼层</Option>
              {['B1', '1F', '2F', '3F', '4F', '5F'].map(f => <Option key={f} value={f}>{f}</Option>)}
            </Select>
            <Select size="small" value={typeFilter} style={{ width: 110 }} onChange={setTypeFilter}>
              <Option value="all">全部类型</Option>
              <Option value="fire">火警</Option>
              <Option value="smoke">烟雾</Option>
              <Option value="heat">高温</Option>
              <Option value="manual">手动</Option>
              <Option value="fault">故障</Option>
            </Select>
            <Select size="small" value={statusFilter} style={{ width: 110 }} onChange={setStatusFilter}>
              <Option value="all">全部状态</Option>
              <Option value="pending">待处理</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="false">误报</Option>
            </Select>
            <Button size="small" icon={<DownloadOutlined />}>导出</Button>
            <Button size="small" icon={<PrinterOutlined />} onClick={() => window.print()}>打印</Button>
          </Space>
        }
        className="glass-card"
      >
        <Tabs
          size="small"
          items={[
            {
              key: 'charts',
              label: <span><BarChartOutlined /> 数据分析</span>,
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Row gutter={16}>
                    <Col span={14}>
                      <Card size="small" title={<Space><LineChartOutlined />报警趋势</Space>}
                        bodyStyle={{ padding: 8 }}>
                        <ReactECharts option={trendOption} style={{ height: 240 }} notMerge />
                      </Card>
                    </Col>
                    <Col span={10}>
                      <Card size="small" title={<Space><PieChartOutlined />报警类型分布</Space>}
                        bodyStyle={{ padding: 8 }}>
                        {Object.keys(stats.byType).length > 0
                          ? <ReactECharts option={typeOption} style={{ height: 240 }} notMerge />
                          : <Empty style={{ padding: 80 }} />
                        }
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={10}>
                      <Card size="small" title={<Space><BarChartOutlined />各楼层报警</Space>}
                        bodyStyle={{ padding: 8 }}>
                        {Object.keys(stats.byFloor).length > 0
                          ? <ReactECharts option={floorOption} style={{ height: 240 }} notMerge />
                          : <Empty style={{ padding: 80 }} />
                        }
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title={<Space><PieChartOutlined />处理状态</Space>}
                        bodyStyle={{ padding: 8 }}>
                        {stats.byStatus.length > 0
                          ? <ReactECharts option={statusOption} style={{ height: 240 }} notMerge />
                          : <Empty style={{ padding: 80 }} />
                        }
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" title={<Space><ClockCircleOutlined />响应时长分布</Space>}
                        bodyStyle={{ padding: 8 }}>
                        <ReactECharts option={responseOption} style={{ height: 240 }} notMerge />
                      </Card>
                    </Col>
                  </Row>
                </Space>
              )
            },
            {
              key: 'history',
              label: <span><FileTextOutlined /> 历史警情（{filteredAlarms.length}）</span>,
              children: (
                <Table
                  size="small"
                  dataSource={filteredAlarms}
                  columns={historyColumns}
                  rowKey="id"
                  scroll={{ y: 460, x: 900 }}
                  pagination={{ pageSize: 12, showTotal: t => `共 ${t} 条历史记录` }}
                />
              )
            },
            {
              key: 'summary',
              label: <span><CheckCircleOutlined /> 统计汇总</span>,
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card size="small" title="报警处理统计" className="glass-card">
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="总警情">{stats.total} 起</Descriptions.Item>
                        <Descriptions.Item label="已确认">{stats.confirmed} 起</Descriptions.Item>
                        <Descriptions.Item label="误报">{stats.falseAlarms} 起</Descriptions.Item>
                        <Descriptions.Item label="待处理">
                          <Tag color={stats.pending > 0 ? 'red' : 'green'}>{stats.pending} 起</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="误报率">
                          <span style={{ color: stats.falseRate < 15 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                            {stats.falseRate}%
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" title="响应效率统计" className="glass-card">
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="平均响应">
                          <span style={{ color: stats.avgResponse < 60 ? '#52c41a' : '#faad14' }}>
                            {stats.avgResponse} 秒
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="最快响应">{stats.minResponse} 秒</Descriptions.Item>
                        <Descriptions.Item label="最慢响应">
                          <span style={{ color: stats.maxResponse > 180 ? '#ff4d4f' : '#e6f4ff' }}>
                            {stats.maxResponse} 秒
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="达标率(≤3分)">
                          {Object.values(stats.responseDistribution).length > 0 && (
                            <span style={{ color: '#52c41a', fontWeight: 600 }}>
                              {Math.round((stats.responseDistribution['<1分钟'] + stats.responseDistribution['1-3分钟']) /
                                Object.values(stats.responseDistribution).reduce((a, b) => a + b, 1) * 100)}%
                            </span>
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" title="运行指标" className="glass-card">
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="值班记录">{dutyLogs.length} 条</Descriptions.Item>
                        <Descriptions.Item label="通知记录">{notifications.length} 次</Descriptions.Item>
                        <Descriptions.Item label="处置步骤">{disposalSteps.length} 步</Descriptions.Item>
                        <Descriptions.Item label="在岗人员">
                          {contacts.filter(c => !c.isEmergency && c.onDuty).length} 人
                        </Descriptions.Item>
                        <Descriptions.Item label="设备在线率">
                          <span style={{ color: '#52c41a' }}>
                            {Math.round(detectors.filter(d => d.status === 'normal').length / detectors.length * 100)}%
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={drillOpen}
        onCancel={() => setDrillOpen(false)}
        title={<Space><PlayCircleOutlined style={{ color: '#1677ff' }} />消防演练过程回放</Space>}
        width={640}
        footer={[
          <Space key="footer">
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>播放速度：</span>
            <Select size="small" value={drillSpeed} style={{ width: 80 }} onChange={setDrillSpeed}>
              <Option value={0.5}>0.5x</Option>
              <Option value={1}>1x</Option>
              <Option value={2}>2x</Option>
              <Option value={4}>4x</Option>
            </Select>
            <Button size="small" disabled={drillStep >= drillSteps.length - 1}
              icon={<PlayCircleOutlined />}
              onClick={handlePlayDrill}>
              {drillPlaying ? '播放中...' : drillStep > 0 ? '重播' : '开始播放'}
            </Button>
            <Button size="small" onClick={() => { setDrillStep(0); setDrillPlaying(false) }}>重置</Button>
            <Button onClick={() => setDrillOpen(false)}>关闭</Button>
          </Space>
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{
            height: 8, background: '#002a4e', borderRadius: 4, marginBottom: 20, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${((drillStep + 1) / drillSteps.length * 100)}%`,
              background: 'linear-gradient(90deg, #1677ff, #722ed1)',
              transition: 'width 0.5s',
              borderRadius: 4
            }} />
          </div>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {drillSteps.slice(0, drillStep + 1).map((step, idx) => (
              <div key={idx} style={{ position: 'relative', paddingBottom: 20 }}>
                <div style={{
                  position: 'absolute', left: -32, top: 0, width: 20, height: 20,
                  borderRadius: '50%', background: step.color,
                  border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  boxShadow: idx === drillStep ? `0 0 12px ${step.color}` : undefined
                }}>
                  {idx + 1}
                </div>
                <div style={{
                  padding: 12, background: `${step.color}15`,
                  border: `1px solid ${step.color}40`, borderRadius: 4,
                  opacity: idx === drillStep ? 1 : 0.7
                }}>
                  <Space style={{ width: '100%' }}>
                    <Tag color={step.color === '#52c41a' ? 'success' : step.color === '#ff4d4f' ? 'red' : 'blue'}>
                      {step.time}
                    </Tag>
                    <span style={{ fontWeight: 700, color: step.color }}>{step.title}</span>
                  </Space>
                  <div style={{ fontSize: 12, marginTop: 4, color: '#91caff' }}>{step.desc}</div>
                </div>
                {idx < drillStep && (
                  <div style={{
                    position: 'absolute', left: -23, top: 20, width: 2, height: 36,
                    background: `linear-gradient(to bottom, ${drillSteps[idx].color}, ${drillSteps[idx + 1].color})`
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        title={<Space><FileTextOutlined style={{ color: '#1677ff' }} />值班日报 - {reportData?.date}</Space>}
        width={720}
        footer={[
          <Button key="close" onClick={() => setReportOpen(false)}>关闭</Button>,
          <Button key="download" icon={<DownloadOutlined />}>下载PDF</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>打印日报</Button>
        ]}
      >
        {reportData && (
          <div style={{ background: '#fff', color: '#000', padding: 24, borderRadius: 4 }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>消防控制室值班日报</h2>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                日期：{reportData.date} · 生成时间：{reportData.generatedAt}
              </div>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="报警情况" style={{ borderColor: '#999' }}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="本日报警">{reportData.totalAlarms} 起</Descriptions.Item>
                    <Descriptions.Item label="已确认处理">{reportData.confirmed} 起</Descriptions.Item>
                    <Descriptions.Item label="误报/测试">{reportData.falseAlarms} 起</Descriptions.Item>
                    <Descriptions.Item label="待处理">{reportData.pending} 起</Descriptions.Item>
                    <Descriptions.Item label="平均响应">
                      {reportData.avgResponse > 0 ? `${reportData.avgResponse} 秒` : '—'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="运行情况" style={{ borderColor: '#999' }}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="交接班次数">{reportData.handovers} 次</Descriptions.Item>
                    <Descriptions.Item label="电话通知">{reportData.notificationsSent} 次</Descriptions.Item>
                    <Descriptions.Item label="设备在线">{reportData.devicesOnline}/{reportData.devicesTotal}</Descriptions.Item>
                    <Descriptions.Item label="设备在线率">
                      {Math.round(reportData.devicesOnline / reportData.devicesTotal * 100)}%
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            {reportData.alarmsDetail.length > 0 && (
              <>
                <Divider style={{ margin: '16px 0', borderColor: '#999' }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>本日警情明细：</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#000' }}>
                  <thead>
                    <tr>
                      {['时间', '类型', '楼层', '设备', '响应', '状态'].map(h => (
                        <th key={h} style={{ border: '1px solid #333', padding: '6px', background: '#f0f0f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.alarmsDetail.slice(0, 10).map(a => (
                      <tr key={a.id}>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>
                          {dayjs(a.createdAt).format('HH:mm:ss')}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>{a.typeName}</td>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>{a.floor}</td>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>{a.detectorName}</td>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>
                          {a.responseTime > 0 ? `${a.responseTime}秒` : '—'}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '6px' }}>{a.statusText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, fontSize: 12 }}>
              <div>值班员签字：_______________</div>
              <div>主管签字：_______________</div>
              <div>日期：{reportData.date}</div>
            </div>
          </div>
        )}
      </Modal>
    </Space>
  )
}

export default ReviewStats
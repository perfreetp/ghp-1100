import React, { useState, useMemo } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Form, Input,
  Select, DatePicker, App as AntdApp, Modal, Tabs, Descriptions,
  Divider, InputNumber, Checkbox, message as AntdMessage
} from 'antd'
import {
  FileTextOutlined, PlusOutlined, EditOutlined, CheckCircleOutlined,
  UserOutlined, CalendarOutlined, FormOutlined, SaveOutlined,
  PrinterOutlined, BellOutlined, PhoneOutlined, TeamOutlined,
  ClockCircleOutlined, WarningOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const DutyLog = () => {
  const { modal, message } = AntdApp.useApp()
  const {
    dutyLogs, addDutyLog, notifications, disposalSteps, alarms,
    currentUser, contacts, addNotification, addDisposalStep,
    pendingTasks, addPendingTask, completeTask
  } = useStore()

  const [handoverOpen, setHandoverOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [logForm] = Form.useForm()
  const [taskForm] = Form.useForm()
  const [selectedLog, setSelectedLog] = useState(null)
  const [dateRange, setDateRange] = useState(null)

  const filteredLogs = useMemo(() => {
    if (!dateRange || dateRange.length !== 2) return dutyLogs
    const start = dateRange[0].startOf('day').valueOf()
    const end = dateRange[1].endOf('day').valueOf()
    return dutyLogs.filter(l => {
      const t = new Date(l.createdAt).getTime()
      return t >= start && t <= end
    })
  }, [dutyLogs, dateRange])

  const handleHandoverSubmit = () => {
    logForm.validateFields().then(values => {
      const confirmed = alarms.filter(a => a.status !== 'pending').length
      addDutyLog({
        date: values.date.format('YYYY-MM-DD'),
        shift: values.shift,
        onDutyPerson1: values.onDutyPerson1,
        onDutyPerson2: values.onDutyPerson2,
        offDutyPerson1: currentUser.name,
        offDutyPerson2: values.offDutyPerson2 || '',
        alarmCount: confirmed,
        falseAlarmCount: alarms.filter(a => a.status === 'false').length,
        equipmentStatus: values.equipmentStatus,
        handoverNotes: values.handoverNotes,
        signature1: currentUser.name,
        signature2: values.onDutyPerson1
      })
      message.success('交接班记录已保存')
      setHandoverOpen(false)
      logForm.resetFields()
    })
  }

  const handleAddTask = () => {
    taskForm.validateFields().then(values => {
      addPendingTask({
        title: values.title,
        priority: values.priority,
        dueDate: values.dueDate?.format('YYYY-MM-DD HH:mm') || '',
        assignee: values.assignee || '',
        description: values.description || ''
      })
      message.success('待办事项已添加')
      setTaskOpen(false)
      taskForm.resetFields()
    })
  }

  const logColumns = [
    { title: '日期', dataIndex: 'date', width: 110,
      render: t => <Space><CalendarOutlined />{t}</Space> },
    { title: '班次', dataIndex: 'shift', width: 80,
      render: t => <Tag color={t === '白班' ? 'blue' : 'purple'}>{t}</Tag> },
    { title: '交班人员', width: 180,
      render: (_, r) => <Space>
        <span>{r.offDutyPerson1}</span>
        {r.offDutyPerson2 && <span>、{r.offDutyPerson2}</span>}
      </Space> },
    { title: '接班人员', width: 180,
      render: (_, r) => <Space>
        <span>{r.onDutyPerson1}</span>
        {r.onDutyPerson2 && <span>、{r.onDutyPerson2}</span>}
      </Space> },
    { title: '报警数', dataIndex: 'alarmCount', width: 80, align: 'center',
      render: v => <Tag color="orange">{v}</Tag> },
    { title: '误报数', dataIndex: 'falseAlarmCount', width: 80, align: 'center',
      render: v => <Tag>{v}</Tag> },
    { title: '设备状态', dataIndex: 'equipmentStatus', width: 100,
      render: t => <Tag color="green">{t}</Tag> },
    { title: '操作', width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" icon={<FileTextOutlined />}
            onClick={() => setSelectedLog(r)}>详情</Button>
          <Button type="link" size="small" icon={<PrinterOutlined />}>打印</Button>
        </Space>
      )
    }
  ]

  const taskColumns = [
    { title: '任务', dataIndex: 'title', ellipsis: true },
    { title: '优先级', dataIndex: 'priority', width: 90,
      render: t => <Tag color={t === 'high' ? 'red' : t === 'medium' ? 'orange' : 'default'}>
        {t === 'high' ? '高' : t === 'medium' ? '中' : '低'}
      </Tag> },
    { title: '负责人', dataIndex: 'assignee', width: 100,
      render: t => t || '未指派' },
    { title: '截止时间', dataIndex: 'dueDate', width: 140,
      render: t => t || '—' },
    { title: '状态', width: 90,
      render: (_, r) => <Tag color={r.completed ? 'success' : 'warning'}>
        {r.completed ? '已完成' : '待办'}
      </Tag> },
    { title: '操作', width: 100,
      render: (_, r) => !r.completed && (
        <Button type="primary" size="small"
          onClick={() => { completeTask(r.id); message.success('任务已完成') }}>
          完成
        </Button>
      )
    }
  ]

  const recentNotifications = notifications.slice(0, 20)
  const notifyColumns = [
    { title: '时间', dataIndex: 'notifiedAt', width: 150,
      render: v => dayjs(v).format('MM-DD HH:mm:ss') },
    { title: '关联警情', dataIndex: 'alarmId', width: 120,
      render: t => <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 11 }}>{t}</Tag> },
    { title: '联系人', dataIndex: 'contactName', width: 100 },
    { title: '职务', dataIndex: 'contactRole', width: 120 },
    { title: '电话', dataIndex: 'contactPhone', width: 130,
      render: t => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: '方式', dataIndex: 'method', width: 70,
      render: t => <Tag color={t === '电话' ? 'blue' : t === '微信' ? 'green' : 'orange'}>{t}</Tag> },
    { title: '结果', dataIndex: 'result', width: 70,
      render: t => <Tag color={t === '已接通' ? 'success' : 'warning'}>{t}</Tag> }
  ]

  const recentSteps = disposalSteps.slice(0, 20)
  const stepColumns = [
    { title: '警情编号', dataIndex: 'alarmId', width: 120,
      render: t => <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 11 }}>{t}</Tag> },
    { title: '步骤', dataIndex: 'step', width: 60, align: 'center' },
    { title: '处置内容', dataIndex: 'content', ellipsis: true },
    { title: '操作人', dataIndex: 'operator', width: 100 },
    { title: '时间', dataIndex: 'createdAt', width: 150,
      render: v => dayjs(v).format('MM-DD HH:mm:ss') },
    { title: '状态', dataIndex: 'status', width: 80,
      render: t => <Tag color={t === 'done' ? 'success' : 'processing'}>
        {t === 'done' ? '已完成' : '进行中'}
      </Tag> }
  ]

  const todayLogs = dutyLogs.filter(l => l.date === dayjs().format('YYYY-MM-DD'))

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(22,119,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileTextOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>值班记录</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{dutyLogs.length}</div>
                </div>
              </Space>
              <Tag color="blue">今日 {todayLogs.length}</Tag>
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
                  <PhoneOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>通知记录</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{notifications.length}</div>
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
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(114,46,209,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FormOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>处置步骤</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{disposalSteps.length}</div>
                </div>
              </Space>
              <Tag color="processing">
                进行中 {disposalSteps.filter(s => s.status !== 'done').length}
              </Tag>
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
                  <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>待办事项</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: pendingTasks.filter(t => !t.completed).length > 0 ? '#faad14' : '#e6f4ff' }}>
                    {pendingTasks.filter(t => !t.completed).length}
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}> / {pendingTasks.length}</span>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={<Space><FileTextOutlined style={{ color: '#1677ff' }} /><span>值班管理</span></Space>}
        extra={
          <Space>
            <Button size="small" icon={<PlusOutlined />} type="primary" onClick={() => setHandoverOpen(true)}>
              交接班
            </Button>
            <Button size="small" icon={<PlusOutlined />} onClick={() => setTaskOpen(true)}>
              添加待办
            </Button>
          </Space>
        }
        className="glass-card"
      >
        <Tabs
          size="small"
          items={[
            {
              key: 'handover',
              label: <span><TeamOutlined /> 交接班记录 ({filteredLogs.length})</span>,
              children: (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Space>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>日期筛选：</span>
                    <RangePicker size="small" value={dateRange} onChange={setDateRange} />
                    {dateRange && <Button size="small" onClick={() => setDateRange(null)}>清除</Button>}
                  </Space>
                  <Table
                    size="small"
                    dataSource={filteredLogs}
                    columns={logColumns}
                    rowKey="id"
                    scroll={{ y: 380 }}
                    pagination={{ pageSize: 8, showTotal: t => `共 ${t} 条记录` }}
                  />
                </Space>
              )
            },
            {
              key: 'notify',
              label: <span><PhoneOutlined /> 电话通知记录</span>,
              children: (
                <Table
                  size="small"
                  dataSource={recentNotifications}
                  columns={notifyColumns}
                  rowKey="id"
                  scroll={{ y: 420 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
                />
              )
            },
            {
              key: 'steps',
              label: <span><FormOutlined /> 处置步骤记录</span>,
              children: (
                <Table
                  size="small"
                  dataSource={recentSteps}
                  columns={stepColumns}
                  rowKey="id"
                  scroll={{ y: 420 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
                />
              )
            },
            {
              key: 'tasks',
              label: <span><ClockCircleOutlined /> 待办事项提醒</span>,
              children: (
                <Table
                  size="small"
                  dataSource={pendingTasks}
                  columns={taskColumns}
                  rowKey="id"
                  scroll={{ y: 420 }}
                  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={handoverOpen}
        onCancel={() => setHandoverOpen(false)}
        onOk={handleHandoverSubmit}
        width={640}
        title={<Space><TeamOutlined style={{ color: '#1677ff' }} />交接班登记</Space>}
        okText="确认交接"
        cancelText="取消"
      >
        <Form form={logForm} layout="vertical" initialValues={{
          date: dayjs(),
          shift: dayjs().hour() >= 8 && dayjs().hour() < 20 ? '白班' : '夜班',
          equipmentStatus: '运行正常'
        }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="交接班日期" name="date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="班次" name="shift" rules={[{ required: true }]}>
                <Select>
                  <Option value="白班">白班（08:00-20:00）</Option>
                  <Option value="夜班">夜班（20:00-08:00）</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ fontSize: 13, color: '#faad14', marginBottom: 8 }}>交班人（当前值班）</div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="offDutyPerson1" label="交班人1">
                <Input disabled value={currentUser.name} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="offDutyPerson2" label="交班人2">
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ fontSize: 13, color: '#52c41a', marginBottom: 8 }}>接班人（新值班）</div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="onDutyPerson1" label="接班人1" rules={[{ required: true, message: '请输入姓名' }]}>
                <Select showSearch placeholder="选择/输入姓名">
                  {contacts.filter(c => !c.isEmergency).map(c => (
                    <Option key={c.id} value={c.name}>{c.name} - {c.role}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="onDutyPerson2" label="接班人2">
                <Select showSearch placeholder="选择/输入姓名" allowClear>
                  {contacts.filter(c => !c.isEmergency).map(c => (
                    <Option key={c.id} value={c.name}>{c.name} - {c.role}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备整体状态" name="equipmentStatus" rules={[{ required: true }]}>
                <Select>
                  <Option value="运行正常">全部正常</Option>
                  <Option value="轻微故障">轻微故障</Option>
                  <Option value="严重故障">严重故障</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="交接班备注/注意事项" name="handoverNotes">
            <TextArea rows={3} placeholder="请输入需要注意的事项，如设备异常、待处理工作等..." />
          </Form.Item>
          <div style={{
            padding: 12, background: 'rgba(22,119,255,0.1)', borderRadius: 4,
            border: '1px solid #00408080', fontSize: 12
          }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> 提交后将自动生成电子签名：
            <span style={{ color: '#1677ff', marginLeft: 4, fontWeight: 600 }}>{currentUser.name}</span>
            （交班）
          </div>
        </Form>
      </Modal>

      <Modal
        open={taskOpen}
        onCancel={() => setTaskOpen(false)}
        onOk={handleAddTask}
        title={<Space><PlusOutlined style={{ color: '#1677ff' }} />添加待办事项</Space>}
        okText="添加"
        cancelText="取消"
      >
        <Form form={taskForm} layout="vertical" initialValues={{ priority: 'medium' }}>
          <Form.Item label="任务标题" name="title" rules={[{ required: true, message: '请输入任务内容' }]}>
            <Input placeholder="例如：检查3层烟感设备、联系维保单位等" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="优先级" name="priority">
                <Select>
                  <Option value="high"><Tag color="red">高优先级</Tag></Option>
                  <Option value="medium"><Tag color="orange">中优先级</Tag></Option>
                  <Option value="low"><Tag>低优先级</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="指派给" name="assignee">
                <Select showSearch placeholder="选择人员">
                  {contacts.filter(c => !c.isEmergency && c.onDuty).map(c => (
                    <Option key={c.id} value={c.name}>{c.name}（在岗）</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="截止时间" name="dueDate">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="详细说明" name="description">
            <TextArea rows={3} placeholder="详细描述待办内容..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={[<Button key="close" onClick={() => setSelectedLog(null)}>关闭</Button>]}
        width={640}
        title={<Space><FileTextOutlined /> 值班记录详情 - {selectedLog?.date} {selectedLog?.shift}</Space>}
      >
        {selectedLog && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="日期" span={1}>{selectedLog.date}</Descriptions.Item>
              <Descriptions.Item label="班次" span={1}>
                <Tag color={selectedLog.shift === '白班' ? 'blue' : 'purple'}>{selectedLog.shift}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="交班人员" span={2}>
                {selectedLog.offDutyPerson1} {selectedLog.offDutyPerson2 && `、${selectedLog.offDutyPerson2}`}
              </Descriptions.Item>
              <Descriptions.Item label="接班人员" span={2}>
                {selectedLog.onDutyPerson1} {selectedLog.onDutyPerson2 && `、${selectedLog.onDutyPerson2}`}
              </Descriptions.Item>
              <Descriptions.Item label="本班报警" span={1}>
                <Tag color="orange">{selectedLog.alarmCount} 次</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="其中误报" span={1}>
                <Tag>{selectedLog.falseAlarmCount} 次</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="设备状态" span={2}>
                <Tag color="green">{selectedLog.equipmentStatus}</Tag>
              </Descriptions.Item>
            </Descriptions>
            {selectedLog.handoverNotes && (
              <div style={{ padding: 12, background: '#002a4e', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>交接班备注：</div>
                {selectedLog.handoverNotes}
              </div>
            )}
            <Divider style={{ margin: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>交班人签名</div>
                <div style={{
                  fontSize: 18, fontFamily: 'cursive', color: '#1677ff',
                  borderBottom: '1px solid #004080', padding: '0 24px 8px', minWidth: 100
                }}>
                  {selectedLog.signature1 || selectedLog.offDutyPerson1}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>接班人签名</div>
                <div style={{
                  fontSize: 18, fontFamily: 'cursive', color: '#52c41a',
                  borderBottom: '1px solid #004080', padding: '0 24px 8px', minWidth: 100
                }}>
                  {selectedLog.signature2 || selectedLog.onDutyPerson1}
                </div>
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </Space>
  )
}

export default DutyLog

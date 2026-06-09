import React, { useState } from 'react'
import {
  Modal, Button, Space, Row, Col, Table, Tag, Form, Input, Select, DatePicker,
  App as AntdApp, Divider, List, Avatar, Timeline
} from 'antd'
import {
  PhoneOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PlusOutlined, SendOutlined, TeamOutlined, EnvironmentOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { contacts } from '../data/mockData'
import dayjs from 'dayjs'

const DisposalModal = ({ open, alarm, onClose }) => {
  const { notifications, disposalSteps, addNotification, addDisposalStep, currentUser } = useStore()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [stepForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('notify')

  const alarmNotifications = notifications.filter(n => n.alarmId === alarm?.id)
  const alarmSteps = disposalSteps.filter(s => s.alarmId === alarm?.id).sort((a, b) => a.step - b.step)

  const handleAddNotification = () => {
    form.validateFields().then(values => {
      const contact = contacts.find(c => c.id === values.contactId)
      if (!contact) return
      addNotification({
        alarmId: alarm.id,
        contactName: contact.name,
        contactRole: contact.role,
        contactPhone: contact.phone,
        department: contact.department,
        method: values.method,
        result: values.result,
        note: values.note
      })
      message.success('通知记录已添加')
      form.resetFields()
    })
  }

  const handleAddStep = () => {
    stepForm.validateFields().then(values => {
      addDisposalStep({
        alarmId: alarm.id,
        step: alarmSteps.length + 1,
        content: values.content,
        operator: currentUser.name
      })
      message.success('处置步骤已添加')
      stepForm.resetFields()
    })
  }

  const notifyColumns = [
    { title: '通知时间', dataIndex: 'notifiedAt', width: 150,
      render: v => dayjs(v).format('MM-DD HH:mm:ss') },
    { title: '联系人', dataIndex: 'contactName', width: 100,
      render: (t, r) => <Space><Avatar size={24} icon={<UserOutlined />} style={{ background: '#1677ff' }} />{t}</Space> },
    { title: '职务', dataIndex: 'contactRole', width: 120 },
    { title: '联系方式', dataIndex: 'contactPhone', width: 130,
      render: t => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: '部门', dataIndex: 'department', width: 100 },
    { title: '通知方式', dataIndex: 'method', width: 80,
      render: t => <Tag color={t === '电话' ? 'blue' : t === '微信' ? 'green' : 'orange'}>{t}</Tag> },
    { title: '结果', dataIndex: 'result', width: 80,
      render: t => <Tag color={t === '已接通' ? 'success' : 'warning'}>{t}</Tag> }
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={960}
      title={
        <Space>
          <EnvironmentOutlined style={{ color: alarm?.color }} />
          <span style={{ fontSize: 16 }}>警情处置记录 - {alarm?.id}</span>
          <Tag color={alarm?.color}>{alarm?.typeName}</Tag>
          <Tag color="default">{alarm?.floor}</Tag>
        </Space>
      }
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={() => { message.success('处置记录已保存归档'); onClose() }}>
            <CheckCircleOutlined /> 完成归档
          </Button>
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={14}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{
              padding: 12, background: 'rgba(0,64,128,0.3)', borderRadius: 4,
              border: '1px solid #004080'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1677ff' }}>
                <TeamOutlined style={{ marginRight: 6 }} />
                通知记录（{alarmNotifications.length}条）
              </div>
              <Table
                size="small"
                dataSource={alarmNotifications}
                columns={notifyColumns}
                rowKey="id"
                pagination={false}
                scroll={{ y: 180 }}
                locale={{ emptyText: '暂无通知记录' }}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Form form={form} layout="vertical">
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item name="contactId" rules={[{ required: true }]} label="联系人" style={{ margin: 0 }}>
                      <Select size="small" placeholder="选择联系人">
                        {contacts.filter(c => !c.isEmergency).map(c => (
                          <Select.Option key={c.id} value={c.id}>{c.name} - {c.role}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="method" rules={[{ required: true }]} label="方式" style={{ margin: 0 }}>
                      <Select size="small" placeholder="通知方式">
                        <Select.Option value="电话">电话</Select.Option>
                        <Select.Option value="微信">微信</Select.Option>
                        <Select.Option value="对讲机">对讲机</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="result" rules={[{ required: true }]} label="结果" style={{ margin: 0 }}>
                      <Select size="small" placeholder="联系结果">
                        <Select.Option value="已接通">已接通</Select.Option>
                        <Select.Option value="未接">未接</Select.Option>
                        <Select.Option value="留言">留言</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label=" " style={{ margin: 0 }}>
                      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddNotification} block>
                        添加
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>

            <div style={{
              padding: 12, background: 'rgba(0,64,128,0.3)', borderRadius: 4,
              border: '1px solid #004080'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1677ff' }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                处置步骤流程
              </div>
              {alarmSteps.length > 0 ? (
                <Timeline
                  items={alarmSteps.map(s => ({
                    color: s.status === 'done' ? 'green' : 'blue',
                    children: (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          步骤{s.step}：{s.content}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                          {s.operator} · {dayjs(s.createdAt).format('HH:mm:ss')}
                          <Tag color={s.status === 'done' ? 'success' : 'processing'} style={{ marginLeft: 8 }}>
                            {s.status === 'done' ? '已完成' : '进行中'}
                          </Tag>
                        </div>
                      </div>
                    )
                  }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: '#8c8c8c' }}>
                  暂无处置步骤
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <Form form={stepForm} layout="vertical">
                <Row gutter={8}>
                  <Col span={20}>
                    <Form.Item name="content" rules={[{ required: true }]} label="新增处置步骤" style={{ margin: 0 }}>
                      <Input size="small" placeholder="例如：拨打119、启动消防广播、组织人员疏散..." />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label=" " style={{ margin: 0 }}>
                      <Button type="primary" size="small" icon={<SendOutlined />} onClick={handleAddStep} block>
                        添加
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Space>
        </Col>

        <Col span={10}>
          <div style={{
            padding: 12, background: 'rgba(0,64,128,0.3)', borderRadius: 4,
            border: '1px solid #004080', height: '100%'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#faad14' }}>
              <PhoneOutlined style={{ marginRight: 6 }} />
              快速联络
            </div>
            <List
              size="small"
              dataSource={contacts}
              renderItem={item => (
                <List.Item
                  style={{ padding: '8px 4px', borderBottom: '1px solid #00408040' }}
                  actions={[
                    <Button type="link" size="small" icon={<PhoneOutlined />}>
                      {item.phone}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{
                        background: item.isEmergency ? '#ff4d4f'
                          : item.onDuty ? '#52c41a' : '#8c8c8c'
                      }} icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        <span style={{ color: item.isEmergency ? '#ff4d4f' : '#e6f4ff', fontSize: 13 }}>
                          {item.name}
                        </span>
                        {item.isEmergency && <Tag color="red">紧急</Tag>}
                        {item.onDuty && !item.isEmergency && <Tag color="success">在岗</Tag>}
                      </Space>
                    }
                    description={<span style={{ fontSize: 11 }}>{item.role} · {item.department}</span>}
                  />
                </List.Item>
              )}
              style={{ maxHeight: 520, overflow: 'auto' }}
              className="scrollbar-thin"
            />
          </div>
        </Col>
      </Row>
    </Modal>
  )
}

export default DisposalModal

import React, { useState } from 'react'
import {
  Modal, Form, Input, Select, DatePicker, Button, Space, Row, Col,
  Timeline, Table, Tag, App as AntdApp, Divider, Popconfirm
} from 'antd'
import {
  PhoneOutlined, FormOutlined, TeamOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const DisposalModal = ({ open, alarm, onClose }) => {
  const { notifications, disposalSteps, addNotification, addDisposalStep, currentUser, contacts,
          updateDisposalStep, deleteDisposalStep } = useStore()
  const { message } = AntdApp.useApp()

  const [notifyForm] = Form.useForm()
  const [stepForm] = Form.useForm()
  const [editingStep, setEditingStep] = useState(null)
  const [stepModalOpen, setStepModalOpen] = useState(false)

  const alarmId = alarm?.id
  const relatedNotifications = notifications.filter(n => n.alarmId === alarmId)
  const relatedSteps = disposalSteps.filter(s => s.alarmId === alarmId).sort((a, b) => a.step - b.step)

  const handleNotifySubmit = () => {
    notifyForm.validateFields().then(values => {
      const contact = contacts.find(c => c.id === values.contactId)
      if (!contact) return
      addNotification({
        alarmId,
        contactId: contact.id,
        contactName: contact.name,
        contactRole: contact.role,
        contactPhone: contact.phone,
        method: values.method,
        result: values.result,
        operator: currentUser.name,
        notes: values.notes || ''
      })
      message.success('通知记录已保存')
      notifyForm.resetFields()
    })
  }

  const openEditStep = (step) => {
    setEditingStep(step)
    stepForm.setFieldsValue({
      content: step.content,
      status: step.status,
      operator: step.operator
    })
    setStepModalOpen(true)
  }

  const handleCloseStepModal = () => {
    setEditingStep(null)
    setStepModalOpen(false)
    stepForm.resetFields()
  }

  const handleStepSubmit = () => {
    stepForm.validateFields().then(values => {
      if (editingStep) {
        updateDisposalStep(editingStep.id, {
          content: values.content,
          status: values.status
        })
        message.success('处置步骤已更新')
      } else {
        const nextStep = relatedSteps.length + 1
        addDisposalStep({
          alarmId,
          step: nextStep,
          content: values.content,
          operator: currentUser.name,
          status: values.status
        })
        message.success('处置步骤已添加')
      }
      handleCloseStepModal()
    })
  }

  const handleAddStep = () => {
    setEditingStep(null)
    stepForm.resetFields()
    stepForm.setFieldsValue({ status: 'in_progress' })
    setStepModalOpen(true)
  }

  const handleDeleteStep = (step) => {
    deleteDisposalStep(step.id)
    message.success('处置步骤已删除')
  }

  const notifyColumns = [
    { title: '时间', dataIndex: 'notifiedAt', width: 160,
      render: v => dayjs(v).format('YYYY-MM-DD HH:mm:ss') },
    { title: '联系人', dataIndex: 'contactName', width: 100 },
    { title: '职务', dataIndex: 'contactRole', width: 120 },
    { title: '电话', dataIndex: 'contactPhone', width: 130,
      render: t => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: '方式', dataIndex: 'method', width: 70,
      render: t => <Tag color={t === '电话' ? 'blue' : t === '微信' ? 'green' : 'orange'}>{t}</Tag> },
    { title: '结果', dataIndex: 'result', width: 80,
      render: t => <Tag color={t === '已接通' ? 'success' : t === '留言' ? 'warning' : 'default'}>{t}</Tag> },
    { title: '操作人', dataIndex: 'operator', width: 90 },
    { title: '备注', dataIndex: 'notes', ellipsis: true }
  ]

  const quickContacts = contacts.filter(c => !c.isEmergency)
  const emergencyContacts = contacts.filter(c => c.isEmergency)

  return (
    <>
      <Modal
        open={open}
        title={<Space>
          <FormOutlined style={{ color: '#722ed1' }} />
          <span>处置记录</span>
          {alarm && <Tag color="blue">{alarm.id}</Tag>}
          {alarm && <Tag color={alarm.color}>{alarm.floor} {alarm.detectorName}</Tag>}
        </Space>}
        width={1200}
        onCancel={onClose}
        footer={[<Button key="close" onClick={onClose}>关闭</Button>]}
      >
        <Row gutter={16}>
          <Col span={14}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Divider orientation="left" orientationMargin="0" plain>
                  <Space>
                    <PhoneOutlined style={{ color: '#1677ff' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>电话通知记录</span>
                  </Space>
                </Divider>
                <Form form={notifyForm} layout="vertical" style={{ marginBottom: 12 }}>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item name="contactId" label="联系人" rules={[{ required: true }]}>
                        <Select placeholder="选择联系人" showSearch optionFilterProp="children">
                          {contacts.map(c => (
                            <Option key={c.id} value={c.id}>{c.name} - {c.role}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item name="method" label="方式" rules={[{ required: true }]} initialValue="电话">
                        <Select>
                          <Option value="电话">电话</Option>
                          <Option value="微信">微信</Option>
                          <Option value="短信">短信</Option>
                          <Option value="对讲机">对讲机</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item name="result" label="结果" rules={[{ required: true }]} initialValue="已接通">
                        <Select>
                          <Option value="已接通">已接通</Option>
                          <Option value="无人接听">无人接听</Option>
                          <Option value="留言">留言</Option>
                          <Option value="拒绝">拒绝</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label=" " colon={false}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleNotifySubmit}>
                          记录
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="notes" label="备注" style={{ marginBottom: 12 }}>
                    <TextArea rows={1} placeholder="通话内容备注..." />
                  </Form.Item>
                </Form>
                <Table
                  size="small"
                  dataSource={relatedNotifications}
                  columns={notifyColumns}
                  rowKey="id"
                  scroll={{ y: 180 }}
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: '暂无通知记录' }}
                />
              </div>

              <div>
                <Divider orientation="left" orientationMargin="0" plain>
                  <Space>
                    <FormOutlined style={{ color: '#52c41a' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>处置步骤</span>
                    <Button size="small" type="primary" icon={<PlusOutlined />} onClick={handleAddStep}>
                      添加步骤
                    </Button>
                  </Space>
                </Divider>
                {relatedSteps.length === 0 ? (
                  <div style={{
                    padding: 32, textAlign: 'center', color: '#8c8c8c',
                    border: '1px dashed #303030', borderRadius: 8
                  }}>
                    暂无处置步骤，点击「添加步骤」开始记录处置流程
                  </div>
                ) : (
                  <Table
                    size="small"
                    dataSource={relatedSteps}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '步骤', dataIndex: 'step', width: 60, align: 'center',
                        render: s => <Tag color="blue">#{s}</Tag> },
                      { title: '处置内容', dataIndex: 'content', ellipsis: true },
                      { title: '操作人', dataIndex: 'operator', width: 100 },
                      { title: '时间', dataIndex: 'createdAt', width: 150,
                        render: v => dayjs(v).format('MM-DD HH:mm:ss') },
                      { title: '状态', dataIndex: 'status', width: 90,
                        render: t => <Tag color={t === 'done' ? 'success' : t === 'in_progress' ? 'processing' : 'warning'}>
                          {t === 'done' ? '已完成' : t === 'in_progress' ? '进行中' : '待执行'}
                        </Tag> },
                      { title: '操作', width: 120,
                        render: (_, r) => (
                          <Space size={4}>
                            <Button type="link" size="small" icon={<EditOutlined />}
                              onClick={() => openEditStep(r)}>编辑</Button>
                            <Popconfirm
                              title="删除该处置步骤？"
                              onConfirm={() => handleDeleteStep(r)}
                              okText="删除"
                              okButtonProps={{ danger: true }}
                              cancelText="取消"
                            >
                              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                            </Popconfirm>
                          </Space>
                        )
                      }
                    ]}
                  />
                )}
                {relatedSteps.length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(82,196,26,0.1)', borderRadius: 8, border: '1px solid #1a3d0066' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>归档摘要</div>
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                          警情 <Tag color="blue">{alarmId}</Tag> 共记录 {relatedSteps.length} 步处置流程，
                          其中 <Tag color="success">{relatedSteps.filter(s => s.status === 'done').length} 步已完成</Tag>
                          {relatedSteps.filter(s => s.status !== 'done').length > 0 && (
                            <><Tag color="processing">{relatedSteps.filter(s => s.status === 'in_progress').length} 步进行中</Tag></>
                          )}
                        </div>
                      </div>
                    </Space>
                  </div>
                )}
              </div>
            </Space>
          </Col>

          <Col span={10}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Divider orientation="left" orientationMargin="0" plain>
                  <Space>
                    <TeamOutlined style={{ color: '#fa8c16' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>快速联络</span>
                  </Space>
                </Divider>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#ff4d4f', marginBottom: 8 }}>紧急联系方式</div>
                  {emergencyContacts.map(c => (
                    <div key={c.id} onClick={() => notifyForm.setFieldsValue({ contactId: c.id })}
                      style={{
                        padding: '8px 12px', background: 'rgba(255,77,79,0.08)',
                        border: '1px solid #ff1f1f40', borderRadius: 4, marginBottom: 6,
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                      <Space>
                        <PhoneOutlined style={{ color: '#ff4d4f' }} />
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>{c.role}</span>
                      </Space>
                      <span style={{ fontFamily: 'monospace', color: '#ff4d4f', fontWeight: 600 }}>{c.phone}</span>
                    </div>
                  ))}
                </div>
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>在岗人员（点击快速填充到通知）</div>
                  {quickContacts.filter(c => c.onDuty).map(c => (
                    <div key={c.id} onClick={() => notifyForm.setFieldsValue({ contactId: c.id })}
                      style={{
                        padding: '8px 12px', background: 'rgba(22,119,255,0.05)',
                        border: '1px solid #00336640', borderRadius: 4, marginBottom: 6,
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                      <Space>
                        <span style={{ color: '#52c41a', fontSize: 10 }}>●</span>
                        <span>{c.name}</span>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>{c.role}</span>
                      </Space>
                      <span style={{ fontFamily: 'monospace', color: '#1677ff', fontSize: 12 }}>{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Divider orientation="left" orientationMargin="0" plain>
                  <Space>
                    <FormOutlined style={{ color: '#eb2f96' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>当前信息</span>
                  </Space>
                </Divider>
                <div style={{
                  padding: 12, background: '#001529', borderRadius: 8,
                  border: '1px solid #002e5b40', fontSize: 13, lineHeight: 2
                }}>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>警情编号：</span>{alarm?.id}</div>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>报警类型：</span>{alarm?.typeName} ({alarm?.floor})</div>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>触发位置：</span>{alarm?.detectorName}</div>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>发生时间：</span>{alarm?.createdAt && dayjs(alarm.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>当前状态：</span><Tag color={alarm?.status === 'pending' ? 'red' : alarm?.status === 'confirmed' ? 'green' : 'default'}>{alarm?.statusText}</Tag></div>
                  <div><span style={{ color: '#8c8c8c', display: 'inline-block', width: 80 }}>值班员：</span>{currentUser.name}（{currentUser.role}）</div>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Modal>

      <Modal
        open={stepModalOpen}
        onCancel={handleCloseStepModal}
        onOk={handleStepSubmit}
        title={editingStep ? '编辑处置步骤' : '添加处置步骤'}
        okText={editingStep ? '保存修改' : '添加'}
        cancelText="取消"
        destroyOnClose
      >
        <Form form={stepForm} layout="vertical" initialValues={{ status: 'in_progress' }}>
          <Form.Item name="content" label="处置内容" rules={[{ required: true, message: '请输入处置内容' }]}>
            <TextArea rows={4} placeholder="例如：已通知微型消防站、现场确认无明火、排烟设备已启动..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Option value="in_progress"><Tag color="processing">进行中</Tag></Option>
                  <Option value="done"><Tag color="success">已完成</Tag></Option>
                  <Option value="pending"><Tag color="warning">待执行</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="操作人">
                <Input disabled value={editingStep ? editingStep.operator : currentUser.name} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default DisposalModal

import React, { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Form, Input,
  Select, Modal, App as AntdApp, Avatar, Divider, List, message as AntdMessage
} from 'antd'
import {
  TeamOutlined, PhoneOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, UserOutlined, SearchOutlined, PrinterOutlined,
  ExclamationCircleOutlined, SafetyCertificateOutlined,
  EnvironmentOutlined, FileTextOutlined, CrownOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'

const { TextArea } = Input
const { Option } = Select

const ContactList = () => {
  const { modal, message } = AntdApp.useApp()
  const { contacts, addContact, updateContact, deleteContact, openPrintModal, alarms } = useStore()

  const [editOpen, setEditOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [dutyFilter, setDutyFilter] = useState('all')

  const departments = [...new Set(contacts.map(c => c.department))]

  const filteredContacts = contacts.filter(c => {
    if (deptFilter !== 'all' && c.department !== deptFilter) return false
    if (dutyFilter === 'on' && !c.onDuty) return false
    if (dutyFilter === 'off' && c.onDuty) return false
    if (keyword) {
      const kw = keyword.toLowerCase()
      return c.name.toLowerCase().includes(kw) ||
        c.phone.includes(kw) ||
        c.role.toLowerCase().includes(kw)
    }
    return true
  })

  const handleAdd = () => {
    setEditingContact(null)
    form.resetFields()
    setEditOpen(true)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    form.setFieldsValue(contact)
    setEditOpen(true)
  }

  const handleDelete = (contact) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: `确定要删除联系人「${contact.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteContact(contact.id)
        message.success('已删除')
      }
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingContact) {
        updateContact(editingContact.id, values)
        message.success('联系人信息已更新')
      } else {
        addContact(values)
        message.success('已添加新联系人')
      }
      setEditOpen(false)
    })
  }

  const handleCall = (contact) => {
    message.info(`正在拨打 ${contact.name}：${contact.phone}`)
  }

  const handlePrintDisposal = () => {
    const pendingAlarm = alarms.find(a => a.status === 'pending')
    if (pendingAlarm) {
      openPrintModal(pendingAlarm)
    } else if (alarms.length > 0) {
      openPrintModal(alarms[0])
    } else {
      message.warning('暂无警情记录可打印')
    }
  }

  const emergencyContacts = contacts.filter(c => c.isEmergency)
  const internalContacts = filteredContacts.filter(c => !c.isEmergency)
  const onDutyContacts = internalContacts.filter(c => c.onDuty)

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 110,
      render: (t, r) => (
        <Space>
          <Avatar style={{
            background: r.isEmergency ? '#ff4d4f'
              : r.onDuty ? '#52c41a' : '#8c8c8c',
            width: 28, height: 28
          }} icon={<UserOutlined style={{ fontSize: 14 }} />} />
          <span style={{
            fontWeight: r.isEmergency ? 700 : 500,
            color: r.isEmergency ? '#ff4d4f' : '#e6f4ff'
          }}>{t}</span>
          {r.isEmergency && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      )
    },
    { title: '职务/角色', dataIndex: 'role', width: 140,
      render: (t, r) => (
        <Space>
          {t}
          {r.role === '消防主管' && <CrownOutlined style={{ color: '#faad14' }} />}
        </Space>
      )
    },
    { title: '所属部门', dataIndex: 'department', width: 120,
      render: t => <Tag color="blue">{t}</Tag> },
    { title: '联系电话', dataIndex: 'phone', width: 150,
      render: t => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#91caff' }}>{t}</span>
      )
    },
    { title: '状态', dataIndex: 'onDuty', width: 90, align: 'center',
      render: (v, r) => r.isEmergency
        ? <Tag color="red" icon={<ExclamationCircleOutlined />}>紧急</Tag>
        : <Tag color={v ? 'success' : 'default'} icon={v ? <SafetyCertificateOutlined /> : <UserOutlined />}>
            {v ? '在岗' : '休假'}
          </Tag>
    },
    { title: '操作', width: 200, fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button type="primary" size="small" icon={<PhoneOutlined />} onClick={() => handleCall(r)}>
            拨打
          </Button>
          {!r.isEmergency && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>删除</Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        {emergencyContacts.map(c => (
          <Col span={8} key={c.id}>
            <Card
              size="small"
              hoverable
              onClick={() => handleCall(c)}
              style={{
                background: 'linear-gradient(135deg, rgba(255,77,79,0.15), rgba(255,77,79,0.05))',
                borderColor: '#ff4d4f60',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <Avatar size={44} style={{ background: '#ff4d4f' }} icon={<PhoneOutlined />} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ff4d4f' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{c.role} · {c.department}</div>
                  </div>
                </Space>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 22, fontFamily: 'monospace', fontWeight: 700,
                    color: '#ff4d4f', letterSpacing: 1
                  }}>
                    {c.phone}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>点击拨打</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={4}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(22,119,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <TeamOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>联系人总数</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{contacts.length}</div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(82,196,26,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>当前在岗</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
                    {onDutyContacts.length + emergencyContacts.length}
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(250,173,20,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>紧急联络</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#ff4d4f' }}>
                    {emergencyContacts.length}
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space size={12}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>快捷操作：</div>
                <Button size="small" icon={<FileTextOutlined />} onClick={handlePrintDisposal}>
                  打印警情处置单
                </Button>
                <Button size="small" icon={<PrinterOutlined />} onClick={() => window.print()}>
                  打印联络清单
                </Button>
              </Space>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
                新增联系人
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            size="small"
            title={<Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} /><span>在岗人员速查</span></Space>}
            className="glass-card"
            style={{ maxHeight: 540, overflow: 'auto' }}
            bodyStyle={{ padding: 8 }}
          >
            <List
              size="small"
              dataSource={onDutyContacts}
              renderItem={item => (
                <List.Item
                  style={{ padding: '6px 4px', borderBottom: '1px solid #00408030', cursor: 'pointer' }}
                  onClick={() => handleCall(item)}
                  actions={[
                    <Button type="link" size="small" icon={<PhoneOutlined />} style={{ color: '#52c41a' }}>
                      {item.phone}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: '#52c41a', width: 28, height: 28 }} icon={<UserOutlined />} />}
                    title={<span style={{ fontSize: 12 }}>{item.name}</span>}
                    description={<span style={{ fontSize: 10, color: '#8c8c8c' }}>{item.role}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={18}>
          <Card
            size="small"
            title={<Space><TeamOutlined style={{ color: '#1677ff' }} /><span>联络清单（{filteredContacts.length} 人）</span></Space>}
            extra={
              <Space>
                <Input
                  size="small"
                  placeholder="搜索姓名/电话/职务..."
                  style={{ width: 200 }}
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined />}
                />
                <Select size="small" value={deptFilter} style={{ width: 120 }} onChange={setDeptFilter}>
                  <Option value="all">全部部门</Option>
                  {departments.map(d => <Option key={d} value={d}>{d}</Option>)}
                </Select>
                <Select size="small" value={dutyFilter} style={{ width: 110 }} onChange={setDutyFilter}>
                  <Option value="all">全部状态</Option>
                  <Option value="on">在岗</Option>
                  <Option value="off">休假</Option>
                </Select>
              </Space>
            }
            className="glass-card"
          >
            <Table
              size="small"
              dataSource={filteredContacts}
              columns={columns}
              rowKey="id"
              scroll={{ y: 440, x: 800 }}
              pagination={{ pageSize: 10, showTotal: t => `共 ${t} 人` }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSubmit}
        title={<Space><UserOutlined style={{ color: '#1677ff' }} />{editingContact ? '编辑联系人' : '新增联系人'}</Space>}
        okText={editingContact ? '保存修改' : '添加'}
        cancelText="取消"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="职务/角色" name="role" rules={[{ required: true }]}>
                <Select showSearch placeholder="选择或输入">
                  <Option value="消防主管">消防主管</Option>
                  <Option value="监控值班员">监控值班员</Option>
                  <Option value="工程维修员">工程维修员</Option>
                  <Option value="安保队长">安保队长</Option>
                  <Option value="物业经理">物业经理</Option>
                  <Option value="消防维保工程师">消防维保工程师</Option>
                  <Option value="消防中控员">消防中控员</Option>
                  <Option value="行政专员">行政专员</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入电话' }]}>
                <Input placeholder="例如：138-0000-0000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属部门" name="department" rules={[{ required: true }]}>
                <Select showSearch placeholder="选择部门">
                  <Option value="安保部">安保部</Option>
                  <Option value="工程部">工程部</Option>
                  <Option value="物业部">物业部</Option>
                  <Option value="维保单位">维保单位</Option>
                  <Option value="行政部">行政部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="在岗状态" name="onDuty" valuePropName="checked">
            <Select>
              <Option value={true}>当前在岗</Option>
              <Option value={false}>休假/不在岗</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default ContactList

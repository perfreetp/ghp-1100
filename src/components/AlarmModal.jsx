import React, { useState, useEffect } from 'react'
import { Modal, Button, Space, Row, Col, Descriptions, Tag, Input, Radio, App as AntdApp } from 'antd'
import {
  WarningOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EnvironmentOutlined, CalendarOutlined, ApiOutlined,
  VideoCameraOutlined, FileTextOutlined, PrinterOutlined
} from '@ant-design/icons'
import { useStore } from '../store/useStore'
import dayjs from 'dayjs'

const { TextArea } = Input

const AlarmModal = ({ open, alarm, onClose }) => {
  const [mode, setMode] = useState('view')
  const [falseNote, setFalseNote] = useState('')
  const { confirmAlarm, markFalseAlarm, cameras, openCamera, openDisposalModal, openPrintModal, detectors, currentUser } = useStore()
  const { message } = AntdApp.useApp()

  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (open && alarm?.status === 'pending') {
      const timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(alarm.createdAt).getTime()) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [open, alarm])

  const relatedCamera = cameras.find(c => c.floor === alarm?.floor)
  const relatedDetector = detectors.find(d => d.id === alarm?.detectorId)

  const handleConfirm = () => {
    confirmAlarm(alarm.id, currentUser.name)
    message.success(`警情 ${alarm.id} 已确认`)
    onClose()
  }

  const handleFalseAlarm = () => {
    if (!falseNote.trim()) {
      message.warning('请填写误报说明')
      return
    }
    markFalseAlarm(alarm.id, currentUser.name, falseNote)
    message.success(`警情 ${alarm.id} 已标记为误报`)
    onClose()
  }

  const statusConfig = {
    pending: { color: 'red', text: '待处理', icon: <WarningOutlined /> },
    confirmed: { color: 'blue', text: '已确认', icon: <CheckCircleOutlined /> },
    false: { color: 'default', text: '误报', icon: <CloseCircleOutlined /> }
  }
  const st = statusConfig[alarm?.status] || statusConfig.pending

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={760}
      title={
        <Space size={12} align="center">
          <WarningOutlined style={{ color: '#ff4d4f', fontSize: 24 }} className="pulse-alarm" />
          <span style={{ fontSize: 18 }}>{alarm?.typeName}</span>
          <Tag color={st.color} icon={st.icon}>{st.text}</Tag>
          {alarm?.status === 'pending' && (
            <Tag color="red" className="blink-alarm">
              响应时长: {Math.floor(elapsed / 60)}分{elapsed % 60}秒
            </Tag>
          )}
        </Space>
      }
      footer={alarm?.status === 'pending' && mode === 'view' ? (
        <Space size={12}>
          <Button onClick={onClose}>稍后处理</Button>
          <Button icon={<VideoCameraOutlined />} onClick={() => relatedCamera && openCamera(relatedCamera)}>
            查看视频
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => openPrintModal(alarm)}>
            打印处置单
          </Button>
          <Button icon={<FileTextOutlined />} type="default" onClick={() => openDisposalModal(alarm)}>
            填写处置记录
          </Button>
          <Button danger onClick={() => setMode('false')}>
            <CloseCircleOutlined /> 标记误报
          </Button>
          <Button type="primary" onClick={handleConfirm}>
            <CheckCircleOutlined /> 确认警情
          </Button>
        </Space>
      ) : mode === 'false' ? (
        <Space size={12}>
          <Button onClick={() => { setMode('view'); setFalseNote('') }}>返回</Button>
          <Button type="primary" danger onClick={handleFalseAlarm}>确认标记误报</Button>
        </Space>
      ) : null}
    >
      {mode === 'view' ? (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="报警编号" span={1}>{alarm?.id}</Descriptions.Item>
            <Descriptions.Item label="报警级别" span={1}>
              <Tag color={alarm?.color}>
                {alarm?.level === 1 ? 'Ⅰ级-重大' : alarm?.level === 2 ? 'Ⅱ级-重要' : alarm?.level === 3 ? 'Ⅲ级-一般' : 'Ⅳ级-提示'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="报警时间" span={1}>
              <CalendarOutlined /> {dayjs(alarm?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="响应时长" span={1}>
              {alarm?.responseTime > 0
                ? `${Math.floor(alarm.responseTime / 60)}分${alarm.responseTime % 60}秒`
                : '未响应'}
            </Descriptions.Item>
            <Descriptions.Item label="楼层区域" span={1}>
              <EnvironmentOutlined /> {alarm?.floor}
            </Descriptions.Item>
            <Descriptions.Item label="设备位置" span={1}>
              坐标({alarm?.position?.x}%, {alarm?.position?.y}%)
            </Descriptions.Item>
            <Descriptions.Item label="触发设备" span={1}>
              <ApiOutlined /> {alarm?.detectorName}
            </Descriptions.Item>
            <Descriptions.Item label="设备编号" span={1}>{alarm?.detectorId}</Descriptions.Item>
            {alarm?.confirmedAt && (
              <>
                <Descriptions.Item label="确认时间" span={1}>
                  {dayjs(alarm.confirmedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="确认人" span={1}>{alarm.confirmedBy}</Descriptions.Item>
              </>
            )}
          </Descriptions>

          {relatedDetector && (
            <div style={{
              padding: 12, background: 'rgba(0,64,128,0.3)', borderRadius: 4, border: '1px solid #004080'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>设备详细信息</div>
              <Row gutter={16}>
                <Col span={8}>安装日期: {relatedDetector.installDate}</Col>
                <Col span={8}>上次检查: {relatedDetector.lastCheck}</Col>
                <Col span={8}>
                  状态: <Tag color={relatedDetector.status === 'normal' ? 'green' : 'orange'}>
                    {relatedDetector.status === 'normal' ? '正常' : '异常'}
                  </Tag>
                </Col>
              </Row>
            </div>
          )}

          {alarm?.notes && (
            <div style={{
              padding: 12, background: 'rgba(140,140,140,0.1)', borderRadius: 4, border: '1px solid #555'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>备注信息</div>
              <div style={{ color: '#d9d9d9' }}>{alarm.notes}</div>
            </div>
          )}
        </Space>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>请确认以下信息：</div>
          <Radio.Group defaultValue="test" style={{ width: '100%' }}>
            <Space direction="vertical">
              <Radio value="test">现场测试产生的报警</Radio>
              <Radio value="dust">灰尘或蚊虫引起的误报</Radio>
              <Radio value="smoke">烟雾过大（非火情）引起</Radio>
              <Radio value="steam">水蒸气引起的误报</Radio>
              <Radio value="device">设备故障导致的误报</Radio>
              <Radio value="other">其他原因</Radio>
            </Space>
          </Radio.Group>
          <div>
            <div style={{ marginBottom: 4 }}>详细说明 <span style={{ color: '#ff4d4f' }}>*</span></div>
            <TextArea
              rows={3}
              value={falseNote}
              onChange={(e) => setFalseNote(e.target.value)}
              placeholder="请详细描述误报原因和现场情况..."
            />
          </div>
          <div style={{ fontSize: 12, color: '#faad14' }}>
            * 标记误报后，该记录将从待处理列表移除，但仍会保存在历史记录中用于统计分析。
          </div>
        </Space>
      )}
    </Modal>
  )
}

export default AlarmModal

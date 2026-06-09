import React from 'react'
import { Modal, Button, Space, Divider } from 'antd'
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import dayjs from 'dayjs'

const PrintModal = ({ open, alarm, onClose }) => {
  const { notifications, disposalSteps, currentUser } = useStore()
  const alarmNotifications = notifications.filter(n => n.alarmId === alarm?.id)
  const alarmSteps = disposalSteps.filter(s => s.alarmId === alarm?.id).sort((a, b) => a.step - b.step)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={720}
      title={
        <Space>
          <PrinterOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontSize: 16 }}>警情处置单</span>
        </Space>
      }
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button icon={<DownloadOutlined />}>导出PDF</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            打印处置单
          </Button>
        </Space>
      }
    >
      <div id="print-area" style={{
        background: '#fff', color: '#000', padding: 30, borderRadius: 4
      }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>消防警情处置单</h1>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            单据编号: {alarm?.id} · 打印时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={tdStyle}>报警编号</td><td style={tdStyle}>{alarm?.id}</td>
              <td style={tdStyle}>报警类型</td><td style={tdStyle}>{alarm?.typeName}</td>
            </tr>
            <tr>
              <td style={tdStyle}>报警级别</td><td style={tdStyle}>
                {alarm?.level === 1 ? 'Ⅰ级（重大）' : alarm?.level === 2 ? 'Ⅱ级（重要）' : alarm?.level === 3 ? 'Ⅲ级（一般）' : 'Ⅳ级（提示）'}
              </td>
              <td style={tdStyle}>处理状态</td><td style={tdStyle}>{alarm?.statusText}</td>
            </tr>
            <tr>
              <td style={tdStyle}>发生时间</td><td style={tdStyle}>{dayjs(alarm?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
              <td style={tdStyle}>响应时长</td><td style={tdStyle}>
                {alarm?.responseTime > 0 ? `${Math.floor(alarm.responseTime / 60)}分${alarm.responseTime % 60}秒` : '—'}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>所在楼层</td><td style={tdStyle}>{alarm?.floor}</td>
              <td style={tdStyle}>位置坐标</td><td style={tdStyle}>({alarm?.position?.x}%, {alarm?.position?.y}%)</td>
            </tr>
            <tr>
              <td style={tdStyle}>触发设备</td><td style={tdStyle}>{alarm?.detectorName}</td>
              <td style={tdStyle}>设备编号</td><td style={tdStyle}>{alarm?.detectorId}</td>
            </tr>
            <tr>
              <td style={tdStyle}>确认时间</td><td style={tdStyle}>
                {alarm?.confirmedAt ? dayjs(alarm.confirmedAt).format('YYYY-MM-DD HH:mm:ss') : '—'}
              </td>
              <td style={tdStyle}>确认人</td><td style={tdStyle}>{alarm?.confirmedBy || '—'}</td>
            </tr>
          </tbody>
        </table>

        <Divider style={{ margin: '8px 0', borderColor: '#999' }} />

        <div style={{ fontSize: 14, fontWeight: 600, margin: '8px 0' }}>一、电话通知记录</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle}>序号</th><th style={thStyle}>通知时间</th>
              <th style={thStyle}>姓名</th><th style={thStyle}>职务</th>
              <th style={thStyle}>电话</th><th style={thStyle}>方式</th><th style={thStyle}>结果</th>
            </tr>
          </thead>
          <tbody>
            {alarmNotifications.length > 0 ? alarmNotifications.map((n, i) => (
              <tr key={n.id}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}>{dayjs(n.notifiedAt).format('HH:mm:ss')}</td>
                <td style={tdStyle}>{n.contactName}</td>
                <td style={tdStyle}>{n.contactRole}</td>
                <td style={tdStyle}>{n.contactPhone}</td>
                <td style={tdStyle}>{n.method}</td>
                <td style={tdStyle}>{n.result}</td>
              </tr>
            )) : (
              <tr><td style={tdStyle} colSpan={7} align="center">暂无通知记录</td></tr>
            )}
          </tbody>
        </table>

        <Divider style={{ margin: '16px 0', borderColor: '#999' }} />

        <div style={{ fontSize: 14, fontWeight: 600, margin: '8px 0' }}>二、处置步骤</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle}>步骤</th><th style={thStyle}>处置内容</th>
              <th style={thStyle}>操作人</th><th style={thStyle}>时间</th><th style={thStyle}>状态</th>
            </tr>
          </thead>
          <tbody>
            {alarmSteps.length > 0 ? alarmSteps.map(s => (
              <tr key={s.id}>
                <td style={tdStyle}>{s.step}</td>
                <td style={tdStyle}>{s.content}</td>
                <td style={tdStyle}>{s.operator}</td>
                <td style={tdStyle}>{dayjs(s.createdAt).format('HH:mm:ss')}</td>
                <td style={tdStyle}>{s.status === 'done' ? '已完成' : '进行中'}</td>
              </tr>
            )) : (
              <tr><td style={tdStyle} colSpan={5} align="center">暂无处置步骤</td></tr>
            )}
          </tbody>
        </table>

        <Divider style={{ margin: '16px 0', borderColor: '#999' }} />

        <div style={{ fontSize: 14, fontWeight: 600, margin: '8px 0' }}>三、备注说明</div>
        <div style={{
          border: '1px solid #ccc', padding: 12, minHeight: 60, fontSize: 12
        }}>
          {alarm?.notes || '无'}
        </div>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <div style={{ width: '30%', textAlign: 'center' }}>
            <div>值班员签名：</div>
            <div style={{ borderBottom: '1px solid #000', height: 30, marginTop: 20 }}>
              {currentUser?.name || ''}
            </div>
          </div>
          <div style={{ width: '30%', textAlign: 'center' }}>
            <div>主管签名：</div>
            <div style={{ borderBottom: '1px solid #000', height: 30, marginTop: 20 }}></div>
          </div>
          <div style={{ width: '30%', textAlign: 'center' }}>
            <div>日期：{dayjs().format('YYYY 年 MM 月 DD 日')}</div>
            <div style={{ borderBottom: '1px solid #000', height: 30, marginTop: 20 }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .ant-modal-footer { display: none; }
        }
      `}</style>
    </Modal>
  )
}

const tdStyle = {
  border: '1px solid #333',
  padding: '6px 8px',
  fontSize: 12,
  color: '#000'
}

const thStyle = {
  border: '1px solid #333',
  padding: '6px 8px',
  background: '#f0f0f0',
  color: '#000'
}

export default PrintModal

export const floors = [
  { id: 'B1', name: '地下一层', isBasement: true },
  { id: '1F', name: '1层', isBasement: false },
  { id: '2F', name: '2层', isBasement: false },
  { id: '3F', name: '3层', isBasement: false },
  { id: '4F', name: '4层', isBasement: false },
  { id: '5F', name: '5层', isBasement: false }
]

export const detectorTypes = {
  smoke: { name: '烟感探测器', color: '#ff4d4f' },
  heat: { name: '温感探测器', color: '#fa8c16' },
  manual: { name: '手动报警按钮', color: '#eb2f96' },
  flame: { name: '火焰探测器', color: '#f5222d' }
}

export const deviceTypes = {
  detector: '探测器',
  fireDoor: '防火门',
  exhaust: '排烟设备',
  sprinkler: '喷淋系统',
  hydrant: '消火栓',
  alarmBell: '警铃',
  broadcast: '消防广播'
}

const generateDetectors = () => {
  const list = []
  const positions = [
    { x: 15, y: 25 }, { x: 35, y: 20 }, { x: 55, y: 25 }, { x: 75, y: 20 },
    { x: 25, y: 45 }, { x: 45, y: 50 }, { x: 65, y: 45 }, { x: 85, y: 50 },
    { x: 15, y: 70 }, { x: 35, y: 75 }, { x: 55, y: 70 }, { x: 75, y: 75 }
  ]
  floors.forEach(floor => {
    positions.forEach((pos, idx) => {
      const types = ['smoke', 'smoke', 'smoke', 'heat', 'manual']
      const type = types[idx % types.length]
      const statuses = ['normal', 'normal', 'normal', 'normal', 'normal', 'fault']
      list.push({
        id: `${floor.id}-DT-${String(idx + 1).padStart(3, '0')}`,
        floor: floor.id,
        type,
        typeName: detectorTypes[type].name,
        name: `${floor.name}${String(idx + 1).padStart(2, '0')}号${detectorTypes[type].name}`,
        position: pos,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        installDate: '2023-01-15',
        lastCheck: '2026-05-20'
      })
    })
  })
  return list
}

export const detectors = generateDetectors()

const generateFireDoors = () => {
  const list = []
  const positions = [
    { x: 10, y: 35 }, { x: 40, y: 60 }, { x: 70, y: 35 }, { x: 90, y: 60 }
  ]
  floors.forEach(floor => {
    positions.forEach((pos, idx) => {
      list.push({
        id: `${floor.id}-FD-${String(idx + 1).padStart(3, '0')}`,
        floor: floor.id,
        name: `${floor.name}${idx + 1}号防火门`,
        position: pos,
        status: ['closed', 'closed', 'closed', 'open'][Math.floor(Math.random() * 4)],
        doorType: idx % 2 === 0 ? '甲级' : '乙级',
        location: ['楼梯间', '机房', '走廊', '电梯前室'][idx]
      })
    })
  })
  return list
}

export const fireDoors = generateFireDoors()

const generateExhausts = () => {
  const list = []
  floors.forEach(floor => {
    for (let i = 0; i < 3; i++) {
      list.push({
        id: `${floor.id}-EX-${String(i + 1).padStart(3, '0')}`,
        floor: floor.id,
        name: `${floor.name}${i + 1}号排烟风机`,
        position: { x: 20 + i * 30, y: 15 + i * 25 },
        status: ['running', 'running', 'standby', 'fault'][Math.floor(Math.random() * 4)],
        power: `${22 + i * 5}kW`,
        airflow: `${8000 + i * 2000}m³/h`
      })
    }
  })
  return list
}

export const exhausts = generateExhausts()

const generateCameras = () => {
  const list = []
  floors.forEach(floor => {
    const floorDetectors = detectors.filter(d => d.floor === floor.id)
    for (let i = 0; i < 6; i++) {
      const camPos = { x: 10 + i * 15, y: 10 + (i % 3) * 30 }
      let nearestDetector = floorDetectors[0]
      let minDist = Infinity
      floorDetectors.forEach(d => {
        const dist = Math.hypot(d.position.x - camPos.x, d.position.y - camPos.y)
        if (dist < minDist) { minDist = dist; nearestDetector = d }
      })
      list.push({
        id: `${floor.id}-CAM-${String(i + 1).padStart(3, '0')}`,
        floor: floor.id,
        name: `${floor.name}${String(i + 1).padStart(2, '0')}号摄像头`,
        position: camPos,
        status: i === 3 ? 'offline' : 'online',
        resolution: '1920x1080',
        type: i % 2 === 0 ? '球机' : '枪机',
        relatedDetectorId: nearestDetector?.id || floorDetectors[0]?.id
      })
    }
  })
  return list
}

export const cameras = generateCameras()

export const contacts = [
  { id: 'C001', name: '张建国', role: '消防主管', phone: '138-0013-8001', department: '安保部', onDuty: true },
  { id: 'C002', name: '李明华', role: '监控值班员', phone: '138-0013-8002', department: '安保部', onDuty: true },
  { id: 'C003', name: '王志强', role: '工程维修员', phone: '138-0013-8003', department: '工程部', onDuty: false },
  { id: 'C004', name: '赵晓燕', role: '安保队长', phone: '138-0013-8004', department: '安保部', onDuty: true },
  { id: 'C005', name: '陈文博', role: '物业经理', phone: '138-0013-8005', department: '物业部', onDuty: false },
  { id: 'C006', name: '刘铁军', role: '消防维保工程师', phone: '138-0013-8006', department: '维保单位', onDuty: true },
  { id: 'C007', name: '孙丽娟', role: '行政专员', phone: '138-0013-8007', department: '行政部', onDuty: false },
  { id: 'C008', name: '周大海', role: '消防中控员', phone: '138-0013-8008', department: '安保部', onDuty: true },
  { id: 'FIRE', name: '火警报警台', role: '紧急救援', phone: '119', department: '消防队', onDuty: true, isEmergency: true },
  { id: 'POLICE', name: '报警电话', role: '紧急救援', phone: '110', department: '公安', onDuty: true, isEmergency: true },
  { id: 'AMBULANCE', name: '急救中心', role: '紧急救援', phone: '120', department: '医疗', onDuty: true, isEmergency: true }
]

const alarmTypes = ['fire', 'smoke', 'heat', 'manual', 'fault', 'offline']
const alarmLevel = {
  fire: { name: '火警', color: '#f5222d', level: 1 },
  smoke: { name: '烟雾报警', color: '#ff4d4f', level: 2 },
  heat: { name: '高温报警', color: '#fa8c16', level: 2 },
  manual: { name: '手动报警', color: '#eb2f96', level: 1 },
  fault: { name: '设备故障', color: '#faad14', level: 3 },
  offline: { name: '设备离线', color: '#8c8c8c', level: 4 }
}

const generateAlarmHistory = () => {
  const list = []
  const now = Date.now()
  for (let i = 0; i < 50; i++) {
    const type = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
    const detector = detectors[Math.floor(Math.random() * detectors.length)]
    const created = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    const status = Math.random() > 0.1 ? 'confirmed' : 'false'
    list.push({
      id: `AL-${String(1000 - i).padStart(6, '0')}`,
      type,
      typeName: alarmLevel[type].name,
      level: alarmLevel[type].level,
      color: alarmLevel[type].color,
      detectorId: detector.id,
      detectorName: detector.name,
      floor: detector.floor,
      position: detector.position,
      createdAt: created.toISOString(),
      confirmedAt: status === 'confirmed' || status === 'false'
        ? new Date(created.getTime() + Math.floor(Math.random() * 180 + 30) * 1000).toISOString()
        : null,
      status,
      statusText: status === 'confirmed' ? '已确认' : status === 'false' ? '误报' : '待处理',
      confirmedBy: ['李明华', '张建国', '周大海'][Math.floor(Math.random() * 3)],
      responseTime: Math.floor(Math.random() * 180 + 30),
      handledAt: status !== 'pending'
        ? new Date(created.getTime() + Math.floor(Math.random() * 600 + 300) * 1000).toISOString()
        : null,
      notes: status === 'false' ? '现场核实为烟雾测试，非真实火情' : '已通知安保人员现场查看，确认为误报',
      handler: ['李明华', '张建国', '周大海'][Math.floor(Math.random() * 3)]
    })
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const alarmHistory = generateAlarmHistory()

export const alarmLevelConfig = alarmLevel

const generateDutyLogs = () => {
  const list = []
  const now = Date.now()
  for (let i = 0; i < 20; i++) {
    const day = Math.floor(Math.random() * 15)
    list.push({
      id: `LOG-${String(2000 - i).padStart(6, '0')}`,
      date: new Date(now - day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shift: ['白班', '夜班'][i % 2],
      onDutyPerson1: ['张建国', '李明华'][i % 2],
      onDutyPerson2: ['周大海', '赵晓燕'][(i + 1) % 2],
      offDutyPerson1: ['王志强', '陈文博'][i % 2],
      offDutyPerson2: ['刘铁军', '孙丽娟'][(i + 1) % 2],
      alarmCount: Math.floor(Math.random() * 8 + 2),
      falseAlarmCount: Math.floor(Math.random() * 2),
      equipmentStatus: '运行正常',
      handoverNotes: i === 0 ? '请重点关注3层东区烟感设备稳定性' : '一切正常',
      signature1: '张三',
      signature2: '李四',
      createdAt: new Date(now - day * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return list
}

export const dutyLogs = generateDutyLogs()

const generateNotifications = () => {
  const list = []
  const alarmSubset = alarmHistory.slice(0, 15)
  alarmSubset.forEach(alarm => {
    const count = Math.floor(Math.random() * 4 + 2)
    for (let i = 0; i < count; i++) {
      const contact = contacts[Math.floor(Math.random() * (contacts.length - 3))]
      list.push({
        id: `NTF-${alarm.id}-${i}`,
        alarmId: alarm.id,
        contactName: contact.name,
        contactRole: contact.role,
        contactPhone: contact.phone,
        department: contact.department,
        notifiedAt: new Date(new Date(alarm.createdAt).getTime() + Math.floor(Math.random() * 300 + 60) * 1000).toISOString(),
        method: ['电话', '微信', '对讲机'][Math.floor(Math.random() * 3)],
        result: ['已接通', '已接通', '已接通', '未接'][Math.floor(Math.random() * 4)],
        note: ''
      })
    }
  })
  return list
}

export const notifications = generateNotifications()

const generateDisposalSteps = () => {
  const list = []
  const alarmSubset = alarmHistory.slice(0, 10)
  alarmSubset.forEach(alarm => {
    const steps = [
      { step: 1, content: '接收到报警信号，确认报警点位', status: 'done' },
      { step: 2, content: '通知值班人员赶赴现场核查', status: 'done' },
      { step: 3, content: '联系安保队长启动应急预案', status: Math.random() > 0.3 ? 'done' : 'pending' },
      { step: 4, content: '现场情况反馈与确认', status: Math.random() > 0.5 ? 'done' : 'pending' },
      { step: 5, content: '记录处置过程并归档', status: 'pending' }
    ]
    steps.forEach((s, i) => {
      list.push({
        id: `DSP-${alarm.id}-${i}`,
        alarmId: alarm.id,
        step: s.step,
        content: s.content,
        status: s.status,
        operator: ['李明华', '张建国'][Math.floor(Math.random() * 2)],
        createdAt: new Date(new Date(alarm.createdAt).getTime() + i * 120 * 1000).toISOString(),
        remark: ''
      })
    })
  })
  return list
}

export const disposalSteps = generateDisposalSteps()

export const systemStatus = {
  overall: 'normal',
  totalDevices: detectors.length + fireDoors.length + exhausts.length,
  onlineDevices: detectors.filter(d => d.status === 'normal').length +
    fireDoors.filter(d => d.status === 'closed').length +
    exhausts.filter(e => e.status === 'running' || e.status === 'standby').length,
  faultDevices: detectors.filter(d => d.status === 'fault').length +
    exhausts.filter(e => e.status === 'fault').length,
  pendingAlarms: 3,
  todayAlarms: 5,
  fireDoorsOpen: fireDoors.filter(d => d.status === 'open').length
}

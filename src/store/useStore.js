import { create } from 'zustand'
import {
  detectors, fireDoors, exhausts, cameras, contacts,
  alarmHistory, dutyLogs, notifications, disposalSteps,
  systemStatus, floors, alarmLevelConfig
} from '../data/mockData'

export const useStore = create((set, get) => ({
  currentFloor: '1F',
  activeAlarm: null,
  alarmModalOpen: false,
  alarms: [...alarmHistory],
  detectors: [...detectors],
  fireDoors: [...fireDoors],
  exhausts: [...exhausts],
  cameras: [...cameras],
  contacts: [...contacts],
  dutyLogs: [...dutyLogs],
  notifications: [...notifications],
  disposalSteps: [...disposalSteps],
  systemStatus: { ...systemStatus },
  deviceFilter: { floor: 'all', type: 'all', status: 'all' },
  selectedCamera: null,
  cameraModalOpen: false,
  disposalModalOpen: false,
  selectedAlarmForDisposal: null,
  printModalOpen: false,
  selectedAlarmForPrint: null,
  pendingTasks: [],
  currentUser: { name: '李明华', role: '监控值班员', shift: '白班' },

  setCurrentFloor: (floor) => set({ currentFloor: floor }),
  setDeviceFilter: (filter) => set((state) => ({ deviceFilter: { ...state.deviceFilter, ...filter } })),

  confirmAlarm: (alarmId, operator) => set((state) => {
    const alarms = state.alarms.map(a =>
      a.id === alarmId
        ? { ...a, status: 'confirmed', statusText: '已确认', confirmedAt: new Date().toISOString(), confirmedBy: operator,
            responseTime: Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 1000) }
        : a
    )
    const alarm = alarms.find(a => a.id === alarmId)
    return { alarms, alarmModalOpen: false, activeAlarm: null, systemStatus: { ...state.systemStatus, pendingAlarms: Math.max(0, state.systemStatus.pendingAlarms - 1) } }
  }),

  markFalseAlarm: (alarmId, operator, note) => set((state) => {
    const alarms = state.alarms.map(a =>
      a.id === alarmId
        ? { ...a, status: 'false', statusText: '误报', confirmedAt: new Date().toISOString(), confirmedBy: operator, notes: note,
            responseTime: Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 1000) }
        : a
    )
    return { alarms, alarmModalOpen: false, activeAlarm: null, systemStatus: { ...state.systemStatus, pendingAlarms: Math.max(0, state.systemStatus.pendingAlarms - 1) } }
  }),

  triggerAlarm: () => set((state) => {
    const types = ['fire', 'smoke', 'heat', 'manual']
    const type = types[Math.floor(Math.random() * types.length)]
    const availableDetectors = state.detectors.filter(d => d.floor === state.currentFloor)
    const detector = availableDetectors[Math.floor(Math.random() * availableDetectors.length)] || state.detectors[0]
    const level = alarmLevelConfig[type]

    const newAlarm = {
      id: `AL-${Date.now()}`,
      type,
      typeName: level.name,
      level: level.level,
      color: level.color,
      detectorId: detector.id,
      detectorName: detector.name,
      floor: detector.floor,
      position: detector.position,
      createdAt: new Date().toISOString(),
      confirmedAt: null,
      status: 'pending',
      statusText: '待处理',
      confirmedBy: null,
      responseTime: 0,
      handledAt: null,
      notes: '',
      handler: null
    }

    return {
      alarms: [newAlarm, ...state.alarms],
      activeAlarm: newAlarm,
      alarmModalOpen: true,
      currentFloor: detector.floor,
      systemStatus: { ...state.systemStatus, pendingAlarms: state.systemStatus.pendingAlarms + 1, todayAlarms: state.systemStatus.todayAlarms + 1 }
    }
  }),

  openAlarmModal: (alarm) => set({ alarmModalOpen: true, activeAlarm: alarm }),
  closeAlarmModal: () => set({ alarmModalOpen: false, activeAlarm: null }),

  openCamera: (camera) => set({ selectedCamera: camera, cameraModalOpen: true }),
  closeCamera: () => set({ cameraModalOpen: false, selectedCamera: null }),

  openDisposalModal: (alarm) => set({ disposalModalOpen: true, selectedAlarmForDisposal: alarm }),
  closeDisposalModal: () => set({ disposalModalOpen: false, selectedAlarmForDisposal: null }),

  addNotification: (notification) => set((state) => ({
    notifications: [{ ...notification, id: `NTF-${Date.now()}`, notifiedAt: new Date().toISOString() }, ...state.notifications]
  })),

  addDisposalStep: (step) => set((state) => ({
    disposalSteps: [...state.disposalSteps, { ...step, id: `DSP-${Date.now()}`, status: 'done', createdAt: new Date().toISOString() }]
  })),

  updateDisposalStepStatus: (stepId, status) => set((state) => ({
    disposalSteps: state.disposalSteps.map(s => s.id === stepId ? { ...s, status } : s)
  })),

  addDutyLog: (log) => set((state) => ({
    dutyLogs: [{ ...log, id: `LOG-${Date.now()}`, createdAt: new Date().toISOString() }, ...state.dutyLogs]
  })),

  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, { ...contact, id: `C${String(state.contacts.length + 1).padStart(3, '0')}` }]
  })),

  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  deleteContact: (id) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== id)
  })),

  openPrintModal: (alarm) => set({ printModalOpen: true, selectedAlarmForPrint: alarm }),
  closePrintModal: () => set({ printModalOpen: false, selectedAlarmForPrint: null }),

  addPendingTask: (task) => set((state) => ({
    pendingTasks: [...state.pendingTasks, { ...task, id: `TASK-${Date.now()}`, createdAt: new Date().toISOString(), completed: false }]
  })),

  completeTask: (taskId) => set((state) => ({
    pendingTasks: state.pendingTasks.map(t => t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t)
  })),

  toggleFireDoor: (doorId) => set((state) => ({
    fireDoors: state.fireDoors.map(d => d.id === doorId ? { ...d, status: d.status === 'closed' ? 'open' : 'closed' } : d)
  })),

  toggleExhaust: (exhaustId) => set((state) => ({
    exhausts: state.exhausts.map(e => e.id === exhaustId ? { ...e, status: e.status === 'running' ? 'standby' : 'running' } : e)
  })),

  getPendingAlarms: () => get().alarms.filter(a => a.status === 'pending'),

  getAlarmsByDateRange: (startDate, endDate) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    return get().alarms.filter(a => {
      const t = new Date(a.createdAt).getTime()
      return t >= start && t <= end
    })
  }
}))

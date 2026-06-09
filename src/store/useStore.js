import { create } from 'zustand'
import {
  detectors, fireDoors, exhausts, cameras, contacts as defaultContacts,
  alarmHistory, dutyLogs as defaultDutyLogs, notifications as defaultNotifications, disposalSteps as defaultDisposalSteps,
  systemStatus, floors, alarmLevelConfig
} from '../data/mockData'

const STORAGE_KEY = 'fire_control_persist_v1'
const PERSIST_KEYS = ['contacts', 'dutyLogs', 'pendingTasks', 'disposalSteps', 'notifications', 'alarms']

const loadPersist = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.warn('[persist] 加载本地存储失败:', e)
    return {}
  }
}

const savePersist = (state) => {
  try {
    const data = {}
    PERSIST_KEYS.forEach(k => { data[k] = state[k] })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[persist] 保存本地存储失败:', e)
  }
}

const persisted = loadPersist()

const initialState = {
  currentFloor: '1F',
  activeAlarm: null,
  alarmModalOpen: false,
  alarms: persisted.alarms && persisted.alarms.length ? persisted.alarms : [...alarmHistory],
  detectors: [...detectors],
  fireDoors: [...fireDoors],
  exhausts: [...exhausts],
  cameras: [...cameras],
  contacts: persisted.contacts && persisted.contacts.length ? persisted.contacts : [...defaultContacts],
  dutyLogs: persisted.dutyLogs && persisted.dutyLogs.length ? persisted.dutyLogs : [...defaultDutyLogs],
  notifications: persisted.notifications && persisted.notifications.length ? persisted.notifications : [...defaultNotifications],
  disposalSteps: persisted.disposalSteps && persisted.disposalSteps.length ? persisted.disposalSteps : [...defaultDisposalSteps],
  systemStatus: { ...systemStatus },
  deviceFilter: { floor: 'all', type: 'all', status: 'all' },
  selectedCamera: null,
  cameraModalOpen: false,
  disposalModalOpen: false,
  selectedAlarmForDisposal: null,
  printModalOpen: false,
  selectedAlarmForPrint: null,
  pendingTasks: persisted.pendingTasks || [],
  currentUser: { name: '李明华', role: '监控值班员', shift: '白班' }
}

export const useStore = create((set, get) => ({
  ...initialState,

  setCurrentFloor: (floor) => set({ currentFloor: floor }),
  setDeviceFilter: (filter) => set((state) => ({ deviceFilter: { ...state.deviceFilter, ...filter } })),

  confirmAlarm: (alarmId, operator) => set((state) => {
    const alarms = state.alarms.map(a =>
      a.id === alarmId
        ? { ...a, status: 'confirmed', statusText: '已确认', confirmedAt: new Date().toISOString(), confirmedBy: operator,
            responseTime: Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 1000) }
        : a
    )
    const result = { alarms, alarmModalOpen: false, activeAlarm: null, systemStatus: { ...state.systemStatus, pendingAlarms: Math.max(0, state.systemStatus.pendingAlarms - 1) } }
    savePersist({ ...state, ...result })
    return result
  }),

  markFalseAlarm: (alarmId, operator, note) => set((state) => {
    const alarms = state.alarms.map(a =>
      a.id === alarmId
        ? { ...a, status: 'false', statusText: '误报', confirmedAt: new Date().toISOString(), confirmedBy: operator, notes: note,
            responseTime: Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 1000) }
        : a
    )
    const result = { alarms, alarmModalOpen: false, activeAlarm: null, systemStatus: { ...state.systemStatus, pendingAlarms: Math.max(0, state.systemStatus.pendingAlarms - 1) } }
    savePersist({ ...state, ...result })
    return result
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

    const result = {
      alarms: [newAlarm, ...state.alarms],
      activeAlarm: newAlarm,
      alarmModalOpen: true,
      currentFloor: detector.floor,
      systemStatus: { ...state.systemStatus, pendingAlarms: state.systemStatus.pendingAlarms + 1, todayAlarms: state.systemStatus.todayAlarms + 1 }
    }
    savePersist({ ...state, ...result })
    return result
  }),

  openAlarmModal: (alarm) => set({ alarmModalOpen: true, activeAlarm: alarm }),
  closeAlarmModal: () => set({ alarmModalOpen: false, activeAlarm: null }),

  openCamera: (camera) => set({ selectedCamera: camera, cameraModalOpen: true }),
  closeCamera: () => set({ cameraModalOpen: false, selectedCamera: null }),

  openDisposalModal: (alarm) => set({ disposalModalOpen: true, selectedAlarmForDisposal: alarm }),
  closeDisposalModal: () => set({ disposalModalOpen: false, selectedAlarmForDisposal: null }),

  addNotification: (notification) => set((state) => {
    const result = {
      notifications: [{ ...notification, id: `NTF-${Date.now()}`, notifiedAt: new Date().toISOString() }, ...state.notifications]
    }
    savePersist({ ...state, ...result })
    return result
  }),

  addDisposalStep: (step) => set((state) => {
    const result = {
      disposalSteps: [...state.disposalSteps, { ...step, id: `DSP-${Date.now()}`, status: 'done', createdAt: new Date().toISOString() }]
    }
    savePersist({ ...state, ...result })
    return result
  }),

  updateDisposalStepStatus: (stepId, status) => set((state) => {
    const result = {
      disposalSteps: state.disposalSteps.map(s => s.id === stepId ? { ...s, status } : s)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  updateDisposalStep: (id, updates) => set((state) => {
    const result = {
      disposalSteps: state.disposalSteps.map(s => s.id === id ? { ...s, ...updates } : s)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  deleteDisposalStep: (id) => set((state) => {
    const result = {
      disposalSteps: state.disposalSteps.filter(s => s.id !== id)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  addDutyLog: (log) => set((state) => {
    const result = {
      dutyLogs: [{ ...log, id: `LOG-${Date.now()}`, createdAt: new Date().toISOString() }, ...state.dutyLogs]
    }
    savePersist({ ...state, ...result })
    return result
  }),

  updateDutyLog: (id, updates) => set((state) => {
    const result = {
      dutyLogs: state.dutyLogs.map(l => l.id === id ? { ...l, ...updates } : l)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  deleteDutyLog: (id) => set((state) => {
    const result = {
      dutyLogs: state.dutyLogs.filter(l => l.id !== id)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  addContact: (contact) => set((state) => {
    const lastNum = state.contacts.reduce((max, c) => {
      const m = /^C(\d+)$/.exec(c.id)
      return m ? Math.max(max, parseInt(m[1])) : max
    }, 0)
    const newId = `C${String(lastNum + 1).padStart(3, '0')}`
    const result = {
      contacts: [...state.contacts, { ...contact, id: newId }]
    }
    savePersist({ ...state, ...result })
    return result
  }),

  updateContact: (id, updates) => set((state) => {
    const result = {
      contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  deleteContact: (id) => set((state) => {
    const result = {
      contacts: state.contacts.filter(c => c.id !== id)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  openPrintModal: (alarm) => set({ printModalOpen: true, selectedAlarmForPrint: alarm }),
  closePrintModal: () => set({ printModalOpen: false, selectedAlarmForPrint: null }),

  addPendingTask: (task) => set((state) => {
    const result = {
      pendingTasks: [...state.pendingTasks, { ...task, id: `TASK-${Date.now()}`, createdAt: new Date().toISOString(), completed: false }]
    }
    savePersist({ ...state, ...result })
    return result
  }),

  completeTask: (taskId) => set((state) => {
    const result = {
      pendingTasks: state.pendingTasks.map(t => t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  updatePendingTask: (id, updates) => set((state) => {
    const result = {
      pendingTasks: state.pendingTasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }
    savePersist({ ...state, ...result })
    return result
  }),

  deletePendingTask: (id) => set((state) => {
    const result = {
      pendingTasks: state.pendingTasks.filter(t => t.id !== id)
    }
    savePersist({ ...state, ...result })
    return result
  }),

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

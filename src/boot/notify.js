import { Notify } from 'quasar'

export function notifySuccess(msg) {
  Notify.create({
    type: 'positive',
    message: msg,
    position: 'top-right',
    timeout: 2000
  })
}

export function notifyError(msg) {
  Notify.create({
    type: 'negative',
    message: msg,
    position: 'top-right',
    timeout: 3000
  })
}

export function notifyInfo(msg) {
  Notify.create({
    type: 'info',
    message: msg,
    position: 'top-right',
    timeout: 2000
  })
}
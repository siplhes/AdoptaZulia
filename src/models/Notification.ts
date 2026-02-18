export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'alert' | 'success' | 'warning'
  read: boolean
  createdAt: number
  link?: string
  icon?: string
}

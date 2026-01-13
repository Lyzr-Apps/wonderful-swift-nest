import { useState } from 'react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Users, Calendar as CalendarIcon, MessageSquare, Activity, Plus, Search, Send,
  Mail, Phone, Clock, TrendingUp, TrendingDown, Minus, FileText, Filter,
  Download, BarChart, User, Home as HomeIcon, Loader2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'

// AGENT IDS - From PRD specification
const AGENT_IDS = {
  patient_inquiry: "6965e582c77a63c0bd4b5394",
  appointment_assistant: "6965e599c77a63c0bd4b5399",
  follow_up_communication: "6965e5b6c831c63e265e0b56",
  analytics_insights: "6965e5d4c77a63c0bd4b53a6"
}

// SAMPLE DATA
const SAMPLE_PATIENTS = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 123-4567', lastVisit: '2026-01-10', status: 'active', condition: 'General Checkup', doctor: 'Dr. Smith' },
  { id: 2, name: 'Michael Chen', email: 'mchen@email.com', phone: '(555) 234-5678', lastVisit: '2026-01-09', status: 'active', condition: 'Cardiology', doctor: 'Dr. Williams' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '(555) 345-6789', lastVisit: '2026-01-08', status: 'pending', condition: 'Orthopedics', doctor: 'Dr. Johnson' },
  { id: 4, name: 'David Thompson', email: 'dthompson@email.com', phone: '(555) 456-7890', lastVisit: '2026-01-05', status: 'active', condition: 'Neurology', doctor: 'Dr. Lee' },
  { id: 5, name: 'Jessica Martinez', email: 'jmartinez@email.com', phone: '(555) 567-8901', lastVisit: '2026-01-12', status: 'active', condition: 'Dermatology', doctor: 'Dr. Patel' },
  { id: 6, name: 'Robert Wilson', email: 'rwilson@email.com', phone: '(555) 678-9012', lastVisit: '2026-01-07', status: 'inactive', condition: 'Ophthalmology', doctor: 'Dr. Kumar' },
  { id: 7, name: 'Amanda Brown', email: 'abrown@email.com', phone: '(555) 789-0123', lastVisit: '2026-01-11', status: 'active', condition: 'Pediatrics', doctor: 'Dr. Martinez' },
  { id: 8, name: 'Christopher Lee', email: 'clee@email.com', phone: '(555) 890-1234', lastVisit: '2026-01-06', status: 'pending', condition: 'Oncology', doctor: 'Dr. Thompson' },
  { id: 9, name: 'Jennifer Davis', email: 'jdavis@email.com', phone: '(555) 901-2345', lastVisit: '2026-01-13', status: 'active', condition: 'Radiology', doctor: 'Dr. Garcia' },
  { id: 10, name: 'William Garcia', email: 'wgarcia@email.com', phone: '(555) 012-3456', lastVisit: '2026-01-04', status: 'active', condition: 'Emergency', doctor: 'Dr. Anderson' },
  { id: 11, name: 'Mary Taylor', email: 'mtaylor@email.com', phone: '(555) 123-4568', lastVisit: '2026-01-03', status: 'inactive', condition: 'Surgery', doctor: 'Dr. White' },
  { id: 12, name: 'James Anderson', email: 'janderson@email.com', phone: '(555) 234-5679', lastVisit: '2026-01-12', status: 'active', condition: 'Psychiatry', doctor: 'Dr. Brown' }
]

const SAMPLE_APPOINTMENTS = [
  { id: 1, patient: 'Sarah Johnson', doctor: 'Dr. Smith', department: 'General Medicine', date: '2026-01-13', time: '09:00', status: 'scheduled', type: 'Checkup' },
  { id: 2, patient: 'Michael Chen', doctor: 'Dr. Williams', department: 'Cardiology', date: '2026-01-13', time: '10:30', status: 'scheduled', type: 'Follow-up' },
  { id: 3, patient: 'Emily Rodriguez', doctor: 'Dr. Johnson', department: 'Orthopedics', date: '2026-01-13', time: '14:00', status: 'scheduled', type: 'Consultation' },
  { id: 4, patient: 'David Thompson', doctor: 'Dr. Lee', department: 'Neurology', date: '2026-01-14', time: '09:30', status: 'scheduled', type: 'Treatment' },
  { id: 5, patient: 'Jessica Martinez', doctor: 'Dr. Patel', department: 'Dermatology', date: '2026-01-14', time: '11:00', status: 'scheduled', type: 'Checkup' },
  { id: 6, patient: 'Amanda Brown', doctor: 'Dr. Martinez', department: 'Pediatrics', date: '2026-01-14', time: '15:30', status: 'scheduled', type: 'Vaccination' },
  { id: 7, patient: 'Christopher Lee', doctor: 'Dr. Thompson', department: 'Oncology', date: '2026-01-15', time: '10:00', status: 'scheduled', type: 'Consultation' },
  { id: 8, patient: 'Jennifer Davis', doctor: 'Dr. Garcia', department: 'Radiology', date: '2026-01-15', time: '13:00', status: 'scheduled', type: 'Scan' },
  { id: 9, patient: 'William Garcia', doctor: 'Dr. Anderson', department: 'Emergency', date: '2026-01-12', time: '16:00', status: 'completed', type: 'Emergency' },
  { id: 10, patient: 'Mary Taylor', doctor: 'Dr. White', department: 'Surgery', date: '2026-01-11', time: '08:00', status: 'completed', type: 'Surgery' },
  { id: 11, patient: 'Robert Wilson', doctor: 'Dr. Kumar', department: 'Ophthalmology', date: '2026-01-10', time: '14:30', status: 'completed', type: 'Checkup' },
  { id: 12, patient: 'James Anderson', doctor: 'Dr. Brown', department: 'Psychiatry', date: '2026-01-16', time: '11:30', status: 'scheduled', type: 'Therapy' },
  { id: 13, patient: 'Sarah Johnson', doctor: 'Dr. Smith', department: 'General Medicine', date: '2026-01-17', time: '09:00', status: 'scheduled', type: 'Follow-up' },
  { id: 14, patient: 'Michael Chen', doctor: 'Dr. Williams', department: 'Cardiology', date: '2026-01-18', time: '10:00', status: 'scheduled', type: 'Treatment' },
  { id: 15, patient: 'Emily Rodriguez', doctor: 'Dr. Johnson', department: 'Orthopedics', date: '2026-01-19', time: '15:00', status: 'scheduled', type: 'Physical Therapy' }
]

const RECENT_ACTIVITIES = [
  { id: 1, type: 'appointment', text: 'New appointment scheduled for Sarah Johnson', time: '10 minutes ago' },
  { id: 2, type: 'patient', text: 'Michael Chen medical records updated', time: '25 minutes ago' },
  { id: 3, type: 'communication', text: 'Follow-up email sent to Emily Rodriguez', time: '1 hour ago' },
  { id: 4, type: 'appointment', text: 'David Thompson appointment confirmed', time: '2 hours ago' },
  { id: 5, type: 'patient', text: 'New patient Jessica Martinez registered', time: '3 hours ago' }
]

// TypeScript interfaces based on actual response schemas
interface PatientInquiryResult {
  answer: string
  category: string
  follow_up_suggestions: string[]
  requires_human_escalation: boolean
}

interface AppointmentDetails {
  appointment_id: null | string
  patient_name: null | string
  department: string
  doctor: string
  date: string
  time: string
}

interface SuggestedSlot {
  date: string
  time: string
  doctor: string
  department: string
}

interface AppointmentAssistantResult {
  action_type: string
  appointment_details: AppointmentDetails
  suggested_slots: SuggestedSlot[]
  message: string
  next_steps: string[]
  requires_confirmation: boolean
}

interface EmailContent {
  subject: string
  body: string
  recipient_email: string
  cc: any[]
  attachments: any[]
}

interface FollowUpCommunicationResult {
  communication_type: string
  email_content: EmailContent
  personalization_elements: string[]
  scheduled_send_time: null | string
  message: string
  email_sent: boolean
  send_status: string
}

interface KeyMetric {
  metric_name: string
  value: string
  trend: string
  change_percentage: number
}

interface Insight {
  category: string
  insight: string
  priority: string
}

interface Recommendation {
  action: string
  impact: string
  priority: string
}

interface AnalyticsInsightsResult {
  report_type: string
  summary: string
  key_metrics: KeyMetric[]
  insights: Insight[]
  recommendations: Recommendation[]
  data_visualization_suggestions: string[]
  period_analyzed: string
  generated_at: string
}

export default function Home() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'patients' | 'appointments' | 'communications' | 'support'>('dashboard')

  // Dashboard state
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsResponse, setAnalyticsResponse] = useState<NormalizedAgentResponse | null>(null)

  // Patients state
  const [selectedPatient, setSelectedPatient] = useState<typeof SAMPLE_PATIENTS[0] | null>(null)
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')

  // Appointments state
  const [appointmentView, setAppointmentView] = useState<'monthly' | 'weekly' | 'daily'>('weekly')
  const [appointmentLoading, setAppointmentLoading] = useState(false)
  const [appointmentResponse, setAppointmentResponse] = useState<NormalizedAgentResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)

  // Communications state
  const [selectedPatients, setSelectedPatients] = useState<number[]>([])
  const [communicationTemplate, setCommunicationTemplate] = useState('appointment_reminder')
  const [communicationLoading, setCommunicationLoading] = useState(false)
  const [communicationResponse, setCommunicationResponse] = useState<NormalizedAgentResponse | null>(null)

  // Support state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, timestamp: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Dashboard functions
  const generateAnalyticsReport = async () => {
    setAnalyticsLoading(true)
    const result = await callAIAgent(
      'Generate a comprehensive analytics report for our hospital CRM system',
      AGENT_IDS.analytics_insights
    )
    setAnalyticsResponse(result.response)
    setAnalyticsLoading(false)
  }

  // Appointment functions
  const manageAppointment = async () => {
    setAppointmentLoading(true)
    const result = await callAIAgent(
      'I need to schedule a new appointment for General Medicine department',
      AGENT_IDS.appointment_assistant
    )
    setAppointmentResponse(result.response)
    setAppointmentLoading(false)
    setShowAppointmentDialog(true)
  }

  // Communication functions
  const generateFollowUp = async () => {
    setCommunicationLoading(true)
    const templateMessages = {
      appointment_reminder: 'Generate an appointment reminder email for a patient',
      post_visit: 'Generate a post-visit follow-up email to check on patient recovery',
      survey: 'Generate a patient satisfaction survey email'
    }
    const result = await callAIAgent(
      templateMessages[communicationTemplate as keyof typeof templateMessages],
      AGENT_IDS.follow_up_communication
    )
    setCommunicationResponse(result.response)
    setCommunicationLoading(false)
  }

  // Support functions
  const sendChatMessage = async (message: string) => {
    const userMessage = { role: 'user' as const, content: message, timestamp: new Date().toISOString() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    const result = await callAIAgent(message, AGENT_IDS.patient_inquiry)

    if (result.success && result.response.result) {
      const assistantMessage = {
        role: 'assistant' as const,
        content: result.response.result.answer || 'I apologize, but I could not process your request.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, assistantMessage])
    }
    setChatLoading(false)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendChatMessage(prompt)
  }

  const filteredPatients = SAMPLE_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearch.toLowerCase())
  )

  // Sidebar Navigation Component
  function SidebarNav() {
    return (
      <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Hospital CRM</h1>
          <p className="text-sm text-gray-500">Healthcare Management</p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              currentScreen === 'dashboard'
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentScreen('patients')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              currentScreen === 'patients'
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Users className="w-5 h-5" />
            Patients
          </button>

          <button
            onClick={() => setCurrentScreen('appointments')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              currentScreen === 'appointments'
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <CalendarIcon className="w-5 h-5" />
            Appointments
          </button>

          <button
            onClick={() => setCurrentScreen('communications')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              currentScreen === 'communications'
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Mail className="w-5 h-5" />
            Communications
          </button>

          <button
            onClick={() => setCurrentScreen('support')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              currentScreen === 'support'
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            Patient Support
          </button>
        </nav>
      </div>
    )
  }

  // Header Component
  function Header() {
    return (
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentScreen === 'dashboard' && 'Dashboard'}
              {currentScreen === 'patients' && 'Patient Management'}
              {currentScreen === 'appointments' && 'Appointments'}
              {currentScreen === 'communications' && 'Communications'}
              {currentScreen === 'support' && 'Patient Support'}
            </h2>
            <p className="text-sm text-gray-500">Manage your healthcare operations efficiently</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Dr. Admin</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Screen
  function DashboardScreen() {
    const analyticsResult = analyticsResponse?.result as AnalyticsInsightsResult | undefined

    return (
      <div className="p-8 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">1,250</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {SAMPLE_APPOINTMENTS.filter(a => a.date === '2026-01-13').length}
              </div>
              <p className="text-xs text-gray-500 mt-2">3 scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">24</div>
              <p className="text-xs text-orange-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">92%</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                +5% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => setShowAddPatientDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
            <Button onClick={() => setCurrentScreen('appointments')} variant="outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button
              onClick={generateAnalyticsReport}
              variant="outline"
              disabled={analyticsLoading}
            >
              {analyticsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Report */}
        {analyticsResult && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Insights</CardTitle>
              <CardDescription>{analyticsResult.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsResult.key_metrics?.map((metric, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{metric.metric_name}</span>
                        {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        {metric.trend === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className={cn(
                        "text-xs mt-1",
                        metric.change_percentage > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Insights</h3>
                <div className="space-y-3">
                  {analyticsResult.insights?.map((insight, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                        {insight.priority}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{insight.category}</div>
                        <div className="text-sm text-gray-600">{insight.insight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {analyticsResult.recommendations?.map((rec, i) => (
                    <div key={i} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="font-medium text-sm text-gray-900">{rec.action}</div>
                      <div className="text-sm text-gray-600">{rec.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Patients Screen
  function PatientsScreen() {
    return (
      <div className="p-8 space-y-6">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients by name or email..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowAddPatientDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>{filteredPatients.length} patients found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(patient => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge variant={
                          patient.status === 'active' ? 'default' :
                          patient.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Patient Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedPatient.name}</h3>
                    <Badge className="mt-2" variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPatient.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.email}</p>
                    </div>

                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.phone}</p>
                    </div>

                    <div>
                      <Label className="text-gray-600">Last Visit</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.lastVisit}</p>
                    </div>

                    <div>
                      <Label className="text-gray-600">Condition</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.condition}</p>
                    </div>

                    <div>
                      <Label className="text-gray-600">Assigned Doctor</Label>
                      <p className="text-sm text-gray-900">{selectedPatient.doctor}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Visit History</h4>
                    <div className="space-y-2">
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-medium">General Checkup</div>
                        <div className="text-gray-600 text-xs">{selectedPatient.lastVisit}</div>
                      </div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-medium">Follow-up Appointment</div>
                        <div className="text-gray-600 text-xs">2026-01-03</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a patient to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Patient Dialog */}
        <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter patient information to create a new record</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Enter patient name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="patient@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="(555) 000-0000" />
              </div>
              <div>
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Add Patient</Button>
                <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Appointments Screen
  function AppointmentsScreen() {
    const appointmentResult = appointmentResponse?.result as AppointmentAssistantResult | undefined
    const todaysAppointments = SAMPLE_APPOINTMENTS.filter(a => a.date === '2026-01-13')
    const upcomingAppointments = SAMPLE_APPOINTMENTS.filter(a => a.date > '2026-01-13')

    return (
      <div className="p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <Tabs value={appointmentView} onValueChange={(v) => setAppointmentView(v as any)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={manageAppointment}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={appointmentLoading}
          >
            {appointmentLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Scheduled Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today ({todaysAppointments.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-3">
                  {todaysAppointments.map(apt => (
                    <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{apt.time}</span>
                            <Badge variant="outline">{apt.type}</Badge>
                          </div>
                          <h4 className="font-medium text-gray-900">{apt.patient}</h4>
                          <p className="text-sm text-gray-600">{apt.doctor} - {apt.department}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="upcoming">
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {upcomingAppointments.map(apt => (
                        <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-semibold text-gray-900">{apt.date} at {apt.time}</span>
                              </div>
                              <h4 className="font-medium text-gray-900">{apt.patient}</h4>
                              <p className="text-sm text-gray-600">{apt.doctor} - {apt.department}</p>
                              <Badge variant="outline" className="mt-2">{apt.type}</Badge>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              {apt.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Assistant Dialog */}
        <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Assistant</DialogTitle>
              <DialogDescription>AI-powered appointment scheduling</DialogDescription>
            </DialogHeader>

            {appointmentResult && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{appointmentResult.message}</p>
                </div>

                {appointmentResult.suggested_slots && appointmentResult.suggested_slots.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Suggested Time Slots</h4>
                    <div className="space-y-2">
                      {appointmentResult.suggested_slots.map((slot, i) => (
                        <div key={i} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {slot.date} at {slot.time}
                              </div>
                              <div className="text-sm text-gray-600">
                                {slot.doctor} - {slot.department}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">Select</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appointmentResult.next_steps && appointmentResult.next_steps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
                    <ul className="space-y-1">
                      {appointmentResult.next_steps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Communications Screen
  function CommunicationsScreen() {
    const communicationResult = communicationResponse?.result as FollowUpCommunicationResult | undefined

    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
              <CardDescription>Choose patients to send communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search patients..."
                  className="mb-4"
                />
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {SAMPLE_PATIENTS.filter(p => p.status === 'active').map(patient => (
                    <div key={patient.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPatients([...selectedPatients, patient.id])
                          } else {
                            setSelectedPatients(selectedPatients.filter(id => id !== patient.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-600">{patient.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Template */}
          <Card>
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>Generate personalized follow-up communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Type</Label>
                <Select value={communicationTemplate} onValueChange={setCommunicationTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="post_visit">Post-Visit Follow-up</SelectItem>
                    <SelectItem value="survey">Patient Satisfaction Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateFollowUp}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={communicationLoading}
              >
                {communicationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Follow-up
                  </>
                )}
              </Button>

              {communicationResult && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-gray-600">Subject</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {communicationResult.email_content.subject}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-600">Email Body</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border text-sm text-gray-900 whitespace-pre-wrap">
                      {communicationResult.email_content.body}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-600">Personalization Elements</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {communicationResult.personalization_elements?.map((element, i) => (
                        <Badge key={i} variant="outline">{element}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Status: {communicationResult.send_status}</div>
                      <div className="text-xs text-gray-600">{communicationResult.message}</div>
                    </div>
                    <Badge variant={communicationResult.email_sent ? 'default' : 'secondary'}>
                      {communicationResult.email_sent ? 'Sent' : 'Draft'}
                    </Badge>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Selected Patients
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Patient Support Screen
  function SupportScreen() {
    const quickPrompts = [
      "What are the hospital visiting hours?",
      "What departments do you have?",
      "What are the visiting policies?",
      "How do I schedule an appointment?"
    ]

    return (
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat History Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  <div className="font-medium">Today</div>
                  <div className="text-xs text-gray-500">{chatMessages.length} messages</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>Patient Support Chat</CardTitle>
              <CardDescription>AI-powered patient inquiry assistance</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 pr-4 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Patient Support</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Ask questions about hospital services, visiting hours, departments, or general healthcare information
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {quickPrompts.map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="text-left h-auto py-3 px-4"
                          onClick={() => handleQuickPrompt(prompt)}
                        >
                          <div className="text-sm">{prompt}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex gap-3",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className={cn(
                          "max-w-md p-4 rounded-lg",
                          msg.role === 'user'
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={cn(
                            "text-xs mt-2",
                            msg.role === 'user' ? "text-blue-100" : "text-gray-500"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Thinking...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
                        e.preventDefault()
                        sendChatMessage(chatInput)
                      }
                    }}
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={() => chatInput.trim() && sendChatMessage(chatInput)}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          {currentScreen === 'dashboard' && <DashboardScreen />}
          {currentScreen === 'patients' && <PatientsScreen />}
          {currentScreen === 'appointments' && <AppointmentsScreen />}
          {currentScreen === 'communications' && <CommunicationsScreen />}
          {currentScreen === 'support' && <SupportScreen />}
        </main>
      </div>
    </div>
  )
}

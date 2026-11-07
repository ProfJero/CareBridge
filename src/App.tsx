import { useState } from 'react'
import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Bell, CalendarDays,
  CheckCircle2, ChevronDown, ClipboardList, Clock3, FileText, HeartHandshake,
  LayoutDashboard, Menu, MessageSquare, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Stethoscope, Users, Wallet, X, UserRound, BriefcaseBusiness,
} from 'lucide-react'

type Section = 'Overview' | 'Clients' | 'Caregivers' | 'Care plans' | 'Schedule' | 'Visits' | 'Recruitment' | 'Finance' | 'Reports' | 'Messages' | 'Settings'

const navigation: { label: Section; icon: typeof LayoutDashboard; group: string }[] = [
  { label: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Clients', icon: Users, group: 'CARE OPERATIONS' },
  { label: 'Caregivers', icon: HeartHandshake, group: 'CARE OPERATIONS' },
  { label: 'Care plans', icon: ClipboardList, group: 'CARE OPERATIONS' },
  { label: 'Schedule', icon: CalendarDays, group: 'CARE OPERATIONS' },
  { label: 'Visits', icon: Clock3, group: 'CARE OPERATIONS' },
  { label: 'Recruitment', icon: BriefcaseBusiness, group: 'PEOPLE' },
  { label: 'Finance', icon: Wallet, group: 'MANAGEMENT' },
  { label: 'Reports', icon: Activity, group: 'MANAGEMENT' },
  { label: 'Messages', icon: MessageSquare, group: 'MANAGEMENT' },
  { label: 'Settings', icon: Settings, group: 'SYSTEM' },
]

const stats = [
  { label: 'Active clients', value: '128', change: '+12.8%', positive: true, icon: Users, tone: 'blue' },
  { label: 'Caregivers on duty', value: '46', change: '+4.2%', positive: true, icon: HeartHandshake, tone: 'green' },
  { label: "Today's visits", value: '34', change: '8 remaining', positive: null, icon: CalendarDays, tone: 'violet' },
  { label: 'Pending applications', value: '19', change: '6 new today', positive: null, icon: BriefcaseBusiness, tone: 'amber' },
]

const visits = [
  { initials: 'AK', name: 'Ama Kusi', client: 'Mrs. Grace Mensah', type: 'Personal care', time: '08:00 – 10:00', status: 'In progress', color: 'blue' },
  { initials: 'EO', name: 'Esi Owusu', client: 'Mr. Daniel Asare', type: 'Nursing visit', time: '09:30 – 11:00', status: 'In progress', color: 'violet' },
  { initials: 'KA', name: 'Kwame Agyeman', client: 'Madam Abena Ofori', type: 'Companionship', time: '10:00 – 12:00', status: 'Upcoming', color: 'green' },
  { initials: 'YA', name: 'Yaw Appiah', client: 'Mr. Joseph Tetteh', type: 'Medication support', time: '11:30 – 12:30', status: 'Upcoming', color: 'amber' },
]

const applications = [
  { name: 'Nana Akua Boateng', role: 'Registered Nurse', date: 'Today, 09:42', status: 'New' },
  { name: 'Michael Osei', role: 'Home Care Assistant', date: 'Today, 08:15', status: 'Reviewing' },
  { name: 'Abigail Mensimah', role: 'Caregiver', date: 'Yesterday', status: 'Shortlisted' },
]

function App() {
  const [active, setActive] = useState<Section>('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showNotice, setShowNotice] = useState(true)

  const title = active === 'Overview' ? 'Good morning, Admin' : active
  const subtitle = active === 'Overview'
    ? "Here's what's happening across your home care services today."
    : `Manage your organisation's ${active.toLowerCase()} and day-to-day operations.`

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><HeartHandshake size={22} /></div>
          <div><strong>CareBridge</strong><span>HOME CARE MANAGEMENT</span></div>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="workspace-switch"><div className="workspace-avatar">G</div><div><strong>Grace Home Care</strong><span>Organisation workspace</span></div><ChevronDown size={15}/></div>
        <nav className="side-nav">
          {['WORKSPACE', 'CARE OPERATIONS', 'PEOPLE', 'MANAGEMENT', 'SYSTEM'].map(group => (
            <div className="nav-group" key={group}>
              <p>{group}</p>
              {navigation.filter(item => item.group === group).map(item => {
                const Icon = item.icon
                return <button key={item.label} className={`nav-item ${active === item.label ? 'active' : ''}`} onClick={() => { setActive(item.label); setSidebarOpen(false) }}><Icon size={18}/><span>{item.label}</span>{item.label === 'Recruitment' && <i>19</i>}</button>
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ShieldCheck size={18}/></div><strong>Care with confidence</strong><span>Keep your team and client records up to date.</span><button onClick={() => setActive('Settings')}>Explore settings <ArrowUpRight size={13}/></button></div><div className="profile-row"><div className="profile-avatar">AD</div><div><strong>Admin Demo</strong><span>Agency administrator</span></div><MoreHorizontal size={18}/></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21}/></button>
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{active}</strong></div>
          <div className="top-actions"><label className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19}/><i/></button><div className="top-avatar">AD</div></div>
        </header>
        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> ORGANISATION OVERVIEW</div><h1>{title}</h1><p>{subtitle}</p></div><div className="heading-actions"><button className="button button-secondary"><CalendarDays size={16}/> Today <ChevronDown size={14}/></button><button className="button button-primary" onClick={() => setActive(active === 'Overview' ? 'Clients' : active)}><Plus size={17}/> {active === 'Overview' ? 'New client' : `Add to ${active}`}</button></div></div>

          {showNotice && <div className="notice"><div className="notice-icon"><AlertCircle size={18}/></div><div><strong>Welcome to your CareBridge workspace</strong><p>This is a starter environment with sample records. Connect Supabase and configure access policies before entering real client or clinical information.</p></div><button aria-label="Dismiss notice" onClick={() => setShowNotice(false)}><X size={17}/></button></div>}

          {active === 'Overview' ? <>
            <div className="stat-grid">{stats.map((stat) => { const Icon = stat.icon; return <article className="stat-card" key={stat.label}><div className="stat-top"><span>{stat.label}</span><div className={`stat-icon ${stat.tone}`}><Icon size={18}/></div></div><div className="stat-value">{stat.value}</div><div className="stat-change">{stat.positive === true ? <ArrowUpRight size={14}/> : stat.positive === false ? <ArrowDownRight size={14}/> : <span className="change-dot"/>}<span>{stat.change}</span><small>{stat.positive !== null ? 'vs last month' : 'applications'}</small></div></article> })}</div>
            <div className="content-grid">
              <section className="panel visits-panel"><div className="panel-heading"><div><h2>Today's visits</h2><p>Care delivery at a glance</p></div><button className="text-button" onClick={() => setActive('Schedule')}>View schedule <ArrowUpRight size={14}/></button></div><div className="visit-summary"><div><span className="summary-number">34</span><span>Total visits</span></div><div><span className="summary-number green-text">18</span><span>Completed</span></div><div><span className="summary-number violet-text">8</span><span>In progress</span></div><div><span className="summary-number amber-text">8</span><span>Upcoming</span></div></div><div className="table-wrap"><table><thead><tr><th>CAREGIVER / CLIENT</th><th>SERVICE</th><th>TIME</th><th>STATUS</th></tr></thead><tbody>{visits.map(v => <tr key={v.name}><td><div className="person-cell"><div className={`person-avatar ${v.color}`}>{v.initials}</div><div><strong>{v.name}</strong><span>{v.client}</span></div></div></td><td>{v.type}</td><td className="time-cell">{v.time}</td><td><span className={`status-pill ${v.status === 'In progress' ? 'status-progress' : 'status-upcoming'}`}>{v.status}</span></td></tr>)}</tbody></table></div><button className="mobile-view-all" onClick={() => setActive('Visits')}>View all visits</button></section>
              <section className="panel applications-panel"><div className="panel-heading"><div><h2>Recent applications</h2><p>Latest caregiver applications</p></div><button className="icon-button"><MoreHorizontal size={19}/></button></div><div className="application-list">{applications.map(a => <div className="application-row" key={a.name}><div className="applicant-avatar"><UserRound size={18}/></div><div className="applicant-info"><strong>{a.name}</strong><span>{a.role} · {a.date}</span></div><span className={`application-status ${a.status.toLowerCase()}`}>{a.status}</span></div>)}</div><button className="button button-outline full-button" onClick={() => setActive('Recruitment')}>Review applications <ArrowUpRight size={15}/></button></section>
            </div>
            <div className="bottom-grid"><section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Common tasks for your team</p></div></div><div className="quick-actions"><button onClick={() => setActive('Clients')}><span className="quick-icon blue"><Plus size={18}/></span><strong>Add a client</strong><small>Register a new care recipient</small></button><button onClick={() => setActive('Schedule')}><span className="quick-icon violet"><CalendarDays size={18}/></span><strong>Schedule a visit</strong><small>Assign a caregiver to a client</small></button><button onClick={() => setActive('Recruitment')}><span className="quick-icon green"><BriefcaseBusiness size={18}/></span><strong>Review applicants</strong><small>Continue the hiring process</small></button><button onClick={() => setActive('Care plans')}><span className="quick-icon amber"><FileText size={18}/></span><strong>Create care plan</strong><small>Document care needs and goals</small></button></div></section><section className="panel activity-panel"><div className="panel-heading"><div><h2>Service quality</h2><p>Operational snapshot</p></div><button className="icon-button"><MoreHorizontal size={19}/></button></div><div className="quality-score"><div className="quality-ring"><span>94<small>%</small></span></div><div><strong>Visit completion</strong><p>Visits completed on schedule this week.</p><span className="positive-label"><CheckCircle2 size={14}/> On track</span></div></div><div className="quality-footer"><span>Clinical documentation</span><strong>Pending configuration</strong></div></section></div>
          </> : <section className="panel module-placeholder"><div className="placeholder-icon"><Stethoscope size={28}/></div><h2>{active} workspace</h2><p>This module is included in the CareBridge product plan. Its production workflows, forms, database operations and permissions will be implemented in the corresponding development milestone.</p><div className="placeholder-chips"><span><CheckCircle2 size={14}/> Module planned</span><span><ShieldCheck size={14}/> Access-controlled</span></div><button className="button button-primary" onClick={() => setActive('Overview')}>Return to overview</button></section>}
          <footer className="footer"><span>© 2026 CareBridge · Home Care Management</span><span><span className="footer-dot"/> All systems operational <span className="footer-divider">·</span> Built by ProfJero</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App

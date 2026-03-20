import { useEffect, useState } from 'react'
import './App.css'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api')
const triggerPlaybook = [
  {
    title: 'Heavy Rain',
    rule: 'Rainfall above 50 mm',
    outcome: 'Auto-creates lost-income claim for outdoor disruption hours.',
  },
  {
    title: 'High Pollution',
    rule: 'AQI above 250',
    outcome: 'Protects earnings when deliveries are unsafe or paused.',
  },
  {
    title: 'Curfew / Closure',
    rule: 'Zone shutdown or mobility block',
    outcome: 'Creates claim without manual filing when work is restricted.',
  },
  {
    title: 'Platform Downtime',
    rule: 'Mock partner app outage',
    outcome: 'Covers lost working time during app-side disruption.',
  },
]

const policyHighlights = [
  'Weekly pricing matched to the gig-worker earning cycle',
  'Auto-generated claims with no manual claim form',
  'Fraud scoring before payout release',
  'Simulated instant payout through UPI or gateway rails',
]

const payoutRails = [
  'UPI instant transfer simulation',
  'Razorpay sandbox payout',
  'Stripe test payout rail',
]

const defaultRegister = {
  name: '',
  phone: '',
  city: 'Mumbai',
  zone: 'Andheri',
  deliveryType: 'FOOD',
  averageDailyEarnings: 1200,
  password: '',
}

const defaultLogin = {
  phone: '9999990001',
  password: 'demo123',
}

const userTabs = ['Dashboard', 'Buy Policy', 'Claims', 'Profile']
const adminTabs = ['Dashboard', 'Trigger Engine', 'Risk Feed']

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function money(value) {
  const amount = Number(value ?? 0)
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [registerForm, setRegisterForm] = useState(defaultRegister)
  const [loginForm, setLoginForm] = useState(defaultLogin)
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [quote, setQuote] = useState(null)
  const [adminDashboard, setAdminDashboard] = useState(null)
  const [riskFeed, setRiskFeed] = useState([])
  const [triggerResult, setTriggerResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activePolicy = dashboard?.activePolicy
  const totalClaimValue = claims.reduce(
    (sum, claim) => sum + Number(claim.payoutAmount ?? 0),
    0,
  )
  const paidClaims = claims.filter((claim) => claim.status === 'PAID').length
  const flaggedClaims = claims.filter((claim) => claim.flagged).length
  const renewalMessage = activePolicy
    ? `Coverage renews on ${activePolicy.activeUntil}`
    : 'Activate a weekly policy to unlock automated protection.'

  useEffect(() => {
    if (!session) {
      return
    }

    if (session.role === 'ADMIN') {
      loadAdminData()
      return
    }

    loadUserData(session.id)
  }, [session])

  async function loadUserData(userId) {
    setLoading(true)
    setError('')
    try {
      const [dashboardResponse, policiesResponse, claimsResponse] = await Promise.all([
        apiRequest(`/dashboard/user/${userId}`),
        apiRequest(`/policies/user/${userId}`),
        apiRequest(`/claims/user/${userId}`),
      ])
      setDashboard(dashboardResponse)
      setPolicies(policiesResponse)
      setClaims(claimsResponse)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadAdminData() {
    setLoading(true)
    setError('')
    try {
      const [dashboardResponse, riskResponse] = await Promise.all([
        apiRequest('/admin/dashboard'),
        apiRequest('/admin/risk-data'),
      ])
      setAdminDashboard(dashboardResponse)
      setRiskFeed(riskResponse)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const user = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...registerForm,
          averageDailyEarnings: Number(registerForm.averageDailyEarnings),
        }),
      })
      setSession(user)
      setActiveTab('Dashboard')
      setMessage('Registration successful. Your worker profile is ready.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      setSession(user)
      setActiveTab('Dashboard')
      setMessage(`Welcome back, ${user.name}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchQuote() {
    if (!session) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await apiRequest('/policies/quote', {
        method: 'POST',
        body: JSON.stringify({ userId: session.id }),
      })
      setQuote(response)
      setMessage('AI premium quote updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function activatePolicy() {
    if (!session) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    try {
      await apiRequest('/policies/activate', {
        method: 'POST',
        body: JSON.stringify({ userId: session.id }),
      })
      await loadUserData(session.id)
      setMessage('Weekly policy activated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function runTriggerEngine() {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await apiRequest('/admin/triggers/run', {
        method: 'POST',
      })
      setTriggerResult(response)
      await loadAdminData()
      setMessage('Parametric trigger engine executed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function markPaid(claimId) {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await apiRequest(`/claims/${claimId}/payout`, {
        method: 'POST',
      })
      if (session?.role === 'ADMIN') {
        await loadAdminData()
      } else if (session) {
        await loadUserData(session.id)
      }
      setMessage('Simulated payout completed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setSession(null)
    setDashboard(null)
    setPolicies([])
    setClaims([])
    setQuote(null)
    setAdminDashboard(null)
    setTriggerResult([])
    setMessage('You have been logged out.')
    setError('')
  }

  const tabs = session?.role === 'ADMIN' ? adminTabs : userTabs

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">DEVTrails 2026 Full Stack Platform</p>
          <h1>Parametric income protection for India&apos;s delivery workers.</h1>
          <p className="hero-copy">
            Weekly premiums only. Income-loss-only coverage. Fully automated
            trigger-based claims across rain, pollution, curfew, and platform
            downtime events.
          </p>
        </div>
        <div className="hero-card">
          <p className="mini-label">Supported Personas</p>
          <strong>Food, grocery, and e-commerce delivery partners</strong>
          <p>Backend: FastAPI | Frontend: React | AI: Python microservice</p>
        </div>
      </section>

      {message ? <div className="flash success">{message}</div> : null}
      {error ? <div className="flash error">{error}</div> : null}

      {!session ? (
        <section className="auth-grid">
          <article className="panel">
            <p className="mini-label">Quick Demo Access</p>
            <h2>Use the seeded accounts</h2>
            <ul className="simple-list">
              <li>User: `9999990001` / `demo123`</li>
              <li>Admin: `9999999999` / `admin123`</li>
            </ul>
          </article>

          <article className="panel">
            <div className="tab-strip">
              <button
                type="button"
                className={authMode === 'login' ? 'tab active' : 'tab'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'tab active' : 'tab'}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            {authMode === 'login' ? (
              <form className="form-grid" onSubmit={handleLogin}>
                <label>
                  Phone
                  <input
                    value={loginForm.phone}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </label>
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form className="form-grid" onSubmit={handleRegister}>
                <label>
                  Name
                  <input
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={registerForm.phone}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </label>
                <label>
                  City
                  <input
                    value={registerForm.city}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Zone
                  <input
                    value={registerForm.zone}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, zone: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Delivery Type
                  <select
                    value={registerForm.deliveryType}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        deliveryType: event.target.value,
                      }))
                    }
                  >
                    <option value="FOOD">Food</option>
                    <option value="GROCERY">Grocery</option>
                    <option value="ECOMMERCE">E-commerce</option>
                  </select>
                </label>
                <label>
                  Average Daily Earnings
                  <input
                    type="number"
                    min="1"
                    value={registerForm.averageDailyEarnings}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        averageDailyEarnings: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </label>
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register Worker'}
                </button>
              </form>
            )}
          </article>
        </section>
      ) : (
        <>
          <section className="session-bar">
            <div>
              <p className="mini-label">Logged In</p>
              <strong>{session.name}</strong>
              <span>
                {session.role} | {session.city}, {session.zone}
              </span>
            </div>
            <button type="button" className="ghost-button" onClick={logout}>
              Logout
            </button>
          </section>

          <nav className="tab-strip">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          {session.role !== 'ADMIN' && activeTab === 'Dashboard' && (
            <>
              <section className="stats-grid">
                <article className="panel stat-panel">
                  <p className="mini-label">Active Policy</p>
                  <h2>{activePolicy ? activePolicy.planName : 'No active policy'}</h2>
                  <p>{renewalMessage}</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Weekly Premium</p>
                  <h2>{money(dashboard?.weeklyPremium)}</h2>
                  <p>AI-adjusted using risk and earnings inputs.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Protected Earnings</p>
                  <h2>{money(dashboard?.earningsProtected)}</h2>
                  <p>Income-loss-only cover, never repair or health cover.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Claim Status</p>
                  <h2>{claims.length} claims</h2>
                  <p>{paidClaims} paid, {flaggedClaims} flagged for review.</p>
                </article>
              </section>

              <section className="grid-layout">
                <article className="panel">
                  <p className="mini-label">Worker Protection Snapshot</p>
                  <h2>Live weekly protection status</h2>
                  <div className="feature-stack">
                    <div className="feature-row">
                      <span>Claims generated</span>
                      <strong>{dashboard?.claims?.length ?? 0}</strong>
                    </div>
                    <div className="feature-row">
                      <span>Total claim value</span>
                      <strong>{money(totalClaimValue)}</strong>
                    </div>
                    <div className="feature-row">
                      <span>Payout rail readiness</span>
                      <strong>Instant</strong>
                    </div>
                  </div>
                </article>

                <article className="panel">
                  <p className="mini-label">Automation Features</p>
                  <h2>Zero-touch insurance operations</h2>
                  <ul className="simple-list">
                    {policyHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </section>
            </>
          )}

          {session.role !== 'ADMIN' && activeTab === 'Buy Policy' && (
            <>
              <section className="grid-layout">
                <article className="panel">
                  <p className="mini-label">Weekly AI Quote</p>
                  <h2>Dynamic premium calculation</h2>
                  <p>Uses weather risk, pollution risk, disruption frequency, and earnings.</p>
                  <div className="button-row">
                    <button type="button" className="primary-button" onClick={fetchQuote} disabled={loading}>
                      Get Quote
                    </button>
                    <button type="button" className="ghost-button" onClick={activatePolicy} disabled={loading}>
                      Activate Coverage
                    </button>
                  </div>
                </article>

                <article className="panel">
                  <p className="mini-label">Quote Result</p>
                  <h2>{quote ? money(quote.weeklyPremium) : 'No quote yet'}</h2>
                  <div className="feature-stack compact">
                    <div className="feature-row">
                      <span>Risk score</span>
                      <strong>{quote ? quote.riskScore : '-'}</strong>
                    </div>
                    <div className="feature-row">
                      <span>Weekly coverage</span>
                      <strong>{quote ? money(quote.weeklyCoverageAmount) : '-'}</strong>
                    </div>
                    <div className="feature-row">
                      <span>Renewal cycle</span>
                      <strong>Every 7 days</strong>
                    </div>
                  </div>
                  <p>{quote?.rationale}</p>
                </article>
              </section>

              <section className="grid-layout">
                <article className="panel">
                  <p className="mini-label">Trigger Coverage Matrix</p>
                  <h2>What activates auto-claims</h2>
                  <div className="card-list">
                    {triggerPlaybook.map((item) => (
                      <article key={item.title} className="card-item feature-card">
                        <strong>{item.title}</strong>
                        <span>{item.rule}</span>
                        <span>{item.outcome}</span>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="panel">
                  <p className="mini-label">Payout & Renewal Features</p>
                  <h2>More than just a quote box</h2>
                  <ul className="simple-list">
                    {payoutRails.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="reminder-card">
                    <strong>Weekly renewal reminder</strong>
                    <span>{renewalMessage}</span>
                  </div>
                </article>
              </section>
            </>
          )}

          {session.role !== 'ADMIN' && activeTab === 'Claims' && (
            <>
              <section className="stats-grid">
                <article className="panel stat-panel">
                  <p className="mini-label">Claim Count</p>
                  <h2>{claims.length}</h2>
                  <p>All claims are generated by parametric triggers.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Paid Claims</p>
                  <h2>{paidClaims}</h2>
                  <p>Successful payout completions through mock rails.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Fraud Watch</p>
                  <h2>{flaggedClaims}</h2>
                  <p>Claims with suspicious behavior or duplicate patterns.</p>
                </article>
              </section>

              <section className="panel">
                <p className="mini-label">Claims Page</p>
                <h2>Automated claim history</h2>
                <div className="card-list">
                  {claims.length === 0 ? (
                    <p>No claims yet. Claims are generated automatically by disruption triggers.</p>
                  ) : (
                    claims.map((claim) => (
                      <article key={claim.id} className="card-item">
                        <strong>{claim.triggerType}</strong>
                        <span>{claim.triggerSource}</span>
                        <span>Hours affected: {claim.affectedHours}</span>
                        <span>Payout: {money(claim.payoutAmount)}</span>
                        <span>Status: {claim.status}</span>
                        <span>Fraud score: {claim.fraudScore}</span>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {session.role !== 'ADMIN' && activeTab === 'Profile' && (
            <section className="grid-layout">
              <article className="panel">
                <p className="mini-label">Worker Profile</p>
                <h2>{session.name}</h2>
                <ul className="simple-list">
                  <li>Phone: {session.phone}</li>
                  <li>City: {session.city}</li>
                  <li>Zone: {session.zone}</li>
                  <li>Delivery type: {session.deliveryType}</li>
                  <li>Average daily earnings: {money(session.averageDailyEarnings)}</li>
                </ul>
              </article>

              <article className="panel">
                <p className="mini-label">Coverage Constraints</p>
                <h2>Policy guardrails</h2>
                <ul className="simple-list">
                  <li>Income loss only, never health or vehicle cover</li>
                  <li>Weekly policy renewal cycle</li>
                  <li>Auto-generated claims only</li>
                  <li>Fraud checks before payout release</li>
                </ul>
              </article>
            </section>
          )}

          {session.role === 'ADMIN' && activeTab === 'Dashboard' && (
            <>
              <section className="stats-grid">
                <article className="panel stat-panel">
                  <p className="mini-label">Total Claims</p>
                  <h2>{adminDashboard?.totalClaims ?? 0}</h2>
                  <p>System-wide auto-generated claim count.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Fraud Alerts</p>
                  <h2>{adminDashboard?.fraudAlerts ?? 0}</h2>
                  <p>Claims held back for suspicious patterns.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Total Payouts</p>
                  <h2>{money(adminDashboard?.totalPayouts)}</h2>
                  <p>Mock payout volume released to workers.</p>
                </article>
                <article className="panel stat-panel">
                  <p className="mini-label">Active Policies</p>
                  <h2>{adminDashboard?.activePolicies ?? 0}</h2>
                  <p>Weekly protection plans currently live.</p>
                </article>
              </section>

              <section className="grid-layout">
                <article className="panel">
                  <p className="mini-label">Weekly Trends</p>
                  <h2>Operational insights</h2>
                  <ul className="simple-list">
                    {(adminDashboard?.weeklyTrends ?? []).map((trend) => (
                      <li key={trend}>{trend}</li>
                    ))}
                  </ul>
                </article>

                <article className="panel">
                  <p className="mini-label">Admin Actions</p>
                  <h2>Available controls</h2>
                  <ul className="simple-list">
                    <li>Run parametric trigger engine</li>
                    <li>Review live risk feed inputs</li>
                    <li>Release payouts on approved claims</li>
                    <li>Track fraud pressure and payout trends</li>
                  </ul>
                </article>
              </section>
            </>
          )}

          {session.role === 'ADMIN' && activeTab === 'Trigger Engine' && (
            <section className="grid-layout">
              <article className="panel">
                <p className="mini-label">Parametric Trigger Engine</p>
                <h2>Run automated claims</h2>
                <p>
                  Evaluates heavy rain, high AQI, curfew, and platform downtime
                  for all active weekly policies.
                </p>
                <button type="button" className="primary-button" onClick={runTriggerEngine} disabled={loading}>
                  Run Trigger Evaluation
                </button>
                <div className="reminder-card">
                  <strong>Automation scope</strong>
                  <span>Heavy rain, AQI surge, curfew, and platform downtime are evaluated together.</span>
                </div>
              </article>

              <article className="panel">
                <p className="mini-label">Generated Claims</p>
                <div className="card-list">
                  {triggerResult.length === 0 ? (
                    <p>No new claims generated yet.</p>
                  ) : (
                    triggerResult.map((claim) => (
                      <article key={claim.id} className="card-item">
                        <strong>{claim.triggerType}</strong>
                        <span>Payout: {money(claim.payoutAmount)}</span>
                        <span>Status: {claim.status}</span>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => markPaid(claim.id)}
                        >
                          Mark Paid
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </article>
            </section>
          )}

          {session.role === 'ADMIN' && activeTab === 'Risk Feed' && (
            <section className="grid-layout">
              <article className="panel">
                <p className="mini-label">Risk Data Feed</p>
                <h2>Mock weather, AQI, and disruption inputs</h2>
                <div className="card-list">
                  {riskFeed.map((item) => (
                    <article key={`${item.city}-${item.zone}`} className="card-item">
                      <strong>{item.city} / {item.zone}</strong>
                      <span>Rain probability: {item.rainProbability}</span>
                      <span>Rainfall mm: {item.rainfallMm}</span>
                      <span>AQI: {item.aqi}</span>
                      <span>Area risk: {item.areaRisk}</span>
                      <span>Curfew active: {String(item.curfewActive)}</span>
                      <span>Platform downtime: {String(item.platformDowntime)}</span>
                    </article>
                  ))}
                </div>
              </article>

              <article className="panel">
                <p className="mini-label">Risk Visualization</p>
                <h2>Zone heat view</h2>
                <div className="risk-grid">
                  {riskFeed.map((item) => (
                    <article key={`${item.city}-${item.zone}-heat`} className="heat-card">
                      <strong>{item.city}</strong>
                      <span>{item.zone}</span>
                      <span>Risk {item.areaRisk}</span>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App

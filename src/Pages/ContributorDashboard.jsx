import React, { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useSubmissionStore } from '../store/submissions'
import { connectWallet } from '../services/web3ipfs'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickToAddMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function ContributorDashboard() {
  const [wallet, setWallet] = useState('Not connected')
  const [position, setPosition] = useState(null)
  const [form, setForm] = useState({
    projectId: '',
    ecosystemType: 'Mangrove',
    biomass: '',
    soilCarbon: '',
    latitude: '',
    longitude: '',
    description: '',
  })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [drawArea, setDrawArea] = useState(false)
  const [areaPoints, setAreaPoints] = useState([])
  const [areaGeoJson, setAreaGeoJson] = useState(null)
  const [notice, setNotice] = useState(null)
  const addSubmission = useSubmissionStore((s) => s.add)
  const approvals = useSubmissionStore((s) => s.approvals)
  const feedback = useSubmissionStore((s) => s.feedback)
  const pending = useSubmissionStore((s) => s.pending)
  const { logout } = usePrivy()
  const navigate = useNavigate()

  const indiaCenter = useMemo(() => [22.9786, 87.7478], [])
  const nextSerial = useMemo(() => Number(localStorage.getItem('bv_next_project_id') || '1'), [])

  async function onConnect() {
    const addr = await connectWallet()
    setWallet(addr)
  }

  // inside ContributorDashboard component — replace onSubmit with:
async function onSubmit() {
  setSubmitting(true)
  try {
    const assignedId = form.projectId || String(nextSerial)

    // convert numeric fields if you want numbers in store (optional)
    const biomassNum = form.biomass ? Number(form.biomass) : undefined
    const soilCarbonNum = form.soilCarbon ? Number(form.soilCarbon) : undefined

    const payloadSubmission = {
      id: crypto.randomUUID(),
      wallet,
      projectId: assignedId,
      ecosystemType: form.ecosystemType,
      biomass: biomassNum,
      soilCarbon: soilCarbonNum,
      latitude: form.latitude || (position ? String(position[0]) : ''),
      longitude: form.longitude || (position ? String(position[1]) : ''),
      description: form.description,
      createdAt: new Date().toISOString(),
      status: 'Pending',
files: files.map(f => ({ name: f.name, size: f.size })),
      area: areaGeoJson ?? (areaPoints.length >= 3 ? areaPoints : undefined),
      ipfsCid: undefined, // will be set by admin on approval
      txHash: undefined,
    }

    // add to store (admin will pick it up from persisted store)
    addSubmission(payloadSubmission)

    // bump serial for next project if generated automatically
    if (!form.projectId) {
      localStorage.setItem('bv_next_project_id', String(nextSerial + 1))
    }

    // reset UI
    setForm({ projectId: '', ecosystemType: 'Mangrove', biomass: '', soilCarbon: '', latitude: '', longitude: '', description: '' })
    setFiles([])
    setPosition(null)
    setAreaPoints([])
    setAreaGeoJson(null)
    setNotice({ kind: 'success', text: `Submitted! Project ID: ${assignedId}` })
    window.setTimeout(() => setNotice(null), 6000)
  } catch (err) {
    console.error('Submit error', err)
    setNotice({ kind: 'error', text: 'Submission failed — check console.' })
  } finally {
    setSubmitting(false)
  }
}


  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {notice && (
        <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-xl shadow-lg border px-4 py-3 ${notice.kind === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <div className="flex items-start gap-3">
            <div className="font-medium">{notice.kind === 'success' ? 'Success' : 'Notice'}</div>
            <button className="ml-auto text-slate-500 hover:text-slate-700" onClick={() => setNotice(null)}>×</button>
          </div>
          <div className="text-sm break-all mt-1">{notice.text}</div>
        </div>
      )}
      {/* Sidebar */};
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <img src="/logo.png" alt="BlueVault" className="w-6 h-6" />
          BlueVault
        </div>
        <nav className="flex-1 mt-6 space-y-1">
          <span className="block px-3 py-2 rounded bg-slate-800/60">Contributor Dashboard</span>
        </nav>
        <button
          className="mt-auto bg-white text-slate-900 rounded px-3 py-2 hover:bg-gray-100"
          onClick={async () => {
            try { await logout(); } catch { /* ignore */ }
            localStorage.removeItem('bv_role')
            navigate('/login', { replace: true })
          }}
        >
          Log out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white shadow border border-slate-200">Wallet: {wallet}</div>
          <button
            onClick={onConnect}
            className="rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm shadow hover:from-blue-500 hover:to-indigo-500"
          >
            {wallet === 'Not connected' ? 'Connect MetaMask' : 'Reconnect Wallet'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Submit box */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Submit Evidence for Verification</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Project ID</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-50" readOnly value={form.projectId || String(nextSerial)} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Ecosystem Type</label>
                <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.ecosystemType} onChange={(e) => setForm({ ...form, ecosystemType: e.target.value })}>
                  <option>Mangrove</option>
                  <option>Forest</option>
                  <option>Seagrass Meadows</option>
                  <option>Wetland</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Biomass (tons)</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.biomass} onChange={(e) => setForm({ ...form, biomass: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Soil Carbon (tons)</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.soilCarbon} onChange={(e) => setForm({ ...form, soilCarbon: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Latitude</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Click map to autofill" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Longitude</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Click map to autofill" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Description</label>
                <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-900 mt-6 mb-2">Project Location</h3>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setDrawArea((v) => {
                    const nv = !v
                    if (!nv && areaPoints.length >= 3) {
                      setAreaGeoJson(areaPoints)
                    }
                    return nv
                  })
                }}
                className={`rounded px-3 py-1 text-sm border ${drawArea ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'}`}
              >
                {drawArea ? 'Finish Drawing' : 'Draw Area'}
              </button>
              <button
                type="button"
                onClick={() => { setAreaPoints([]); setAreaGeoJson(null) }}
                className="rounded px-3 py-1 text-sm border bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              >
                Clear Area
              </button>
              <span className="text-xs text-slate-500">Tip: While drawing, click on map to add vertices. Finish Drawing to save.</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 h-72">
              <MapContainer center={indiaCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <ClickToAddMarker onMapClick={(lat, lng) => {
                  if (drawArea) {
                    const next = [...areaPoints, [lat, lng]]
                    setAreaPoints(next)
                    // when toggled off (Finish Drawing) we persist GeoJSON below
                  } else {
                    setPosition([lat, lng])
                    setForm({ ...form, latitude: String(lat), longitude: String(lng) })
                  }
                }} />
                {position && <Marker position={position} icon={markerIcon} />}
                {areaPoints.length >= 3 && (
                  <Polygon positions={areaPoints} pathOptions={{ color: '#2563eb', fillOpacity: 0.15 }} />
                )}
              </MapContainer>
            </div>
            {drawArea === false && areaPoints.length >= 3 && (
              <div className="mt-2 text-xs text-slate-600">
                Selected area with {areaPoints.length} points.
              </div>
            )}
            {drawArea === true && areaPoints.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">Points: {areaPoints.length} (click Finish Drawing to save)</div>
            )}

            <h3 className="text-lg font-medium text-slate-900 mt-6 mb-2">Evidence Files</h3>
            <div className="space-y-2">
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              <div className="text-xs text-slate-500">Or pick a folder of images:</div>
              <input type="file" multiple webkitdirectory="" directory="" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </div>
            <div className="mt-4">
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 shadow hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Right: Stats + Decisions */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">My Project Registry</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-blue-50 text-blue-900 p-3 text-center">
                  <div className="text-2xl font-bold">{pending.length}</div>
                  <div className="text-xs">Pending</div>
                </div>
                <div className="rounded-lg bg-emerald-50 text-emerald-900 p-3 text-center">
                  <div className="text-2xl font-bold">{approvals.length}</div>
                  <div className="text-xs">Approved</div>
                </div>
                <div className="rounded-lg bg-amber-50 text-amber-900 p-3 text-center">
                  <div className="text-2xl font-bold">{feedback.length}</div>
                  <div className="text-xs">Needs Data</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Decisions</h3>
              {(approvals.length === 0 && feedback.length === 0) && (
                <div className="text-slate-500 text-sm">No submissions yet.</div>
              )}
              <div className="space-y-3">
  {approvals.map((s) => (
    <div key={s.id} className="flex flex-col rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">Project {s.projectId}</div>
        <span className="text-xs font-medium text-emerald-800">Approved</span>
      </div>
      
      {s.ipfsCid && (
        <div className="text-xs text-slate-600 mt-1">
          <span className="font-medium">IPFS: </span>
          <a 
            href={`https://gateway.pinata.cloud/ipfs/${s.ipfsCid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
            title="View on IPFS"
          >
            {s.ipfsCid}
          </a>
        </div>
      )}
      {s.txHash && (
        <div className="text-xs text-slate-600 mt-1">
          <span className="font-medium">Transaction: </span>
          <a 
            href={`https://celo-sepolia.blockscout.com/tx/${s.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
            title="View on Polygonscan"
          >
            {s.txHash}
          </a>
        </div>
      )}
      {s.tokensAwarded && (
        <div className="text-xs text-slate-600 mt-1">
          <span className="font-medium">Tokens: </span>
          {s.tokensAwarded}
        </div>
      )}
    </div>
  ))}

              
                {feedback.map((s) => (
                  <div key={s.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Project {s.projectId}</div>
                      <span className="text-xs font-medium text-amber-800">Needs more data</span>
                    </div>
                    <div className="text-xs text-amber-900 mt-1">{s.reviewNote}</div>
                    <button
                      className="mt-2 text-xs rounded bg-white border border-amber-300 px-2 py-1 hover:bg-amber-100"
                      onClick={() => {
                        setForm({
                          projectId: s.projectId,
                          ecosystemType: s.ecosystemType,
                          biomass: s.biomass,
                          soilCarbon: s.soilCarbon,
                          latitude: s.latitude,
                          longitude: s.longitude,
                          description: s.description || '',
                        })
                        if (s.latitude && s.longitude) setPosition([Number(s.latitude), Number(s.longitude)])
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      Add More Data
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



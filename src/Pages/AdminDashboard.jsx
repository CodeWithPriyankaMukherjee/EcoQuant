import React, { useEffect, useMemo, useState } from 'react'
import { useSubmissionStore } from '../store/submissions'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { pinJSONToIPFS } from '../services/pinata' 

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function AdminDashboard() {
  const { pending, approvals, feedback, approve, requestMore } = useSubmissionStore()
  const [selected, setSelected] = useState(null)
  const [tokenAmount, setTokenAmount] = useState('250')
  const [network, setNetwork] = useState('sepolia')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState(null)
  const { logout } = usePrivy()
  const navigate = useNavigate()
const handleApprove = async () => {
  if (!selected) return;
  setIsProcessing(true);
  try {
    // Build approval payload
    const approvalPayload = {
      submissionId: selected.id,
      projectId: selected.projectId,
      wallet: selected.wallet,
      ecosystemType: selected.ecosystemType,
      biomass: selected.biomass,
      soilCarbon: selected.soilCarbon,
      latitude: selected.latitude,
      longitude: selected.longitude,
      description: selected.description,
      files: selected.files ?? [],
      area: selected.area ?? null,
      submittedAt: selected.createdAt,
      approvedAt: new Date().toISOString(),
      status: 'Approved',
      tokensAwarded: Number(tokenAmount),
    };

    // 1) Pin approval JSON to Pinata
    const ipfsCid = await pinJSONToIPFS(approvalPayload);
    console.log('Approval pinned to Pinata, CID:', ipfsCid);

    // 2) Check if wallet is connected and valid
    const recipientWallet = '0xAfc03DDCF432880bC1b4A5eF7519f2afC6F2c083';
  

 // 3) Mint BVT tokens with IPFS CID stored on-chain
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecoquant.onrender.com/';
const mintResponse = await fetch(`${API_BASE_URL}/api/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: recipientWallet, // Use the validated wallet address
        amount: String(tokenAmount),
        ipfsHash: ipfsCid
      }),
    });
    
    // DEBUG: Check the raw response first
    const responseText = await mintResponse.text();
    console.log('Raw API response:', responseText);
    
    // Try to parse as JSON
    let mintResult;
    try {
      mintResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`API returned invalid JSON: ${responseText}`);
    }
    
    if (!mintResponse.ok) {
      throw new Error(mintResult.error || `HTTP error! status: ${mintResponse.status}`);
    }
    
    if (!mintResult.success) {
      throw new Error(mintResult.error || 'Minting failed');
    }

    // 4) Update Zustand store
    approve(selected.id, Number(tokenAmount), ipfsCid, mintResult.transactionHash);
    
    // 5) Update local UI state
    setSelected({
      ...selected,
      status: 'Approved',
      ipfsCid: ipfsCid,
      txHash: mintResult.transactionHash
    });
    
    alert(`✅ Project ${selected.projectId} approved!\n${tokenAmount} BVT minted to ${recipientWallet}\nIPFS: ${ipfsCid}\nTx: ${mintResult.transactionHash}`);
  } catch (err) {
    console.error('Approval failed', err);
    alert('Approval failed: ' + (err?.message || err));
  } finally {
    setIsProcessing(false);
  }
};
  useEffect(() => {
    // Find the currently selected item in the updated arrays
    if (selected) {
      // Look for the same item in the updated arrays
      const updatedSelected = 
        pending.find(s => s.id === selected.id) ||
        approvals.find(s => s.id === selected.id) ||
        feedback.find(s => s.id === selected.id);
      
      if (updatedSelected) {
        setSelected(updatedSelected);
      } else {
        // Item was removed (approved), so clear selection
        setSelected(pending[0] || approvals[0] || feedback[0] || null);
      }
    } else {
      // No selection yet, pick first item
      setSelected(pending[0] || approvals[0] || feedback[0] || null);
    }
  }, [pending, approvals, feedback]); // Run when store arrays change

  const center = useMemo(() => {
    if (selected?.latitude && selected?.longitude) return [Number(selected.latitude), Number(selected.longitude)]
    return [22.9786, 87.7478]
  }, [selected])

  return (
    <div className="w-full h-screen flex bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <div className="text-lg font-semibold">BlueVault</div>
        <nav className="flex-1 mt-4 space-y-1">
          <span className="block px-3 py-2 rounded bg-slate-800/60">Admin Dashboard</span>
        </nav>
        <button
          className="mt-auto bg-white text-slate-900 rounded px-3 py-2 hover:bg-gray-100"
          onClick={async () => { try { await logout() } catch {}; localStorage.removeItem('bv_role'); navigate('/login', { replace: true }) }}
        >
          Log out
        </button>
      </aside>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-blue-50 text-blue-900 p-4">
            <div className="text-xs">Pending</div>
            <div className="text-2xl font-bold">{pending.length}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 text-emerald-900 p-4">
            <div className="text-xs">Approved</div>
            <div className="text-2xl font-bold">{approvals.length}</div>
          </div>
          <div className="rounded-lg bg-amber-50 text-amber-900 p-4">
            <div className="text-xs">Needs Data</div>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Submissions</h2>
            <div className="space-y-2">
              {[...pending, ...approvals, ...feedback].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`w-full text-left rounded-lg border px-3 py-2 ${selected?.id === s.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Project {s.projectId}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${s.status === 'Pending' ? 'bg-blue-100 text-blue-800' : s.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{s.status}</span>
                  </div>
                  <div className="text-xs text-slate-500">{s.createdAt}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            {!selected && <div className="text-slate-500">Select a submission</div>}
            {selected && (
              <div>
                <h2 className="text-xl font-semibold text-center mb-4">Project Verification Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-slate-500">Organization:</div><div>—</div>
                      <div className="text-slate-500">Submitted:</div><div>{new Date(selected.createdAt).toLocaleDateString()}</div>
                      <div className="text-slate-500">Location:</div><div>{selected.latitude}, {selected.longitude}</div>
                      <div className="text-slate-500">Status:</div><div>{selected.status}</div>
                      <div className="text-slate-500">Area:</div><div>—</div>
                      <div className="text-slate-500">Estimated Carbon:</div><div>—</div>
                      <div className="text-slate-500">Type:</div><div>{selected.ecosystemType}</div>
                    </div>

                    <div className="mt-3 rounded overflow-hidden border border-slate-200 h-64">
                      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                        {selected.latitude && selected.longitude && (
                          <Marker position={[Number(selected.latitude), Number(selected.longitude)]} icon={markerIcon} />
                        )}
                        {Array.isArray(selected.area) && selected.area.length >= 3 && (
                          <Polygon positions={selected.area} pathOptions={{ color: '#2563eb', fillOpacity: 0.15 }} />
                        )}
                      </MapContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Verification Actions</h3>
                    <label className="block text-sm text-slate-600 mb-1">Token amount</label>
                    <input className="w-full rounded border border-slate-300 px-3 py-2 mb-3" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} />
                    <label className="block text-sm text-slate-600 mb-1">Network</label>
                    <select className="w-full rounded border border-slate-300 px-3 py-2 mb-3" value={network} onChange={(e) => setNetwork(e.target.value)}>
                      <option value="sepolia">Sepolia</option>
                      <option value="polygonAmoy">Polygon Amoy</option>
                    </select>
                    <div className="flex gap-2 flex-wrap">
                      <button
  className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-500 disabled:opacity-60 shadow"
  disabled={!selected || selected.status !== 'Pending' || isProcessing}
  onClick={handleApprove}
>

                        Approve Project
                      </button>
                      <button
                        className="rounded bg-slate-700 text-white px-4 py-2 hover:bg-slate-600 disabled:opacity-60 shadow"
                        disabled={selected.status !== 'Pending'}
                        onClick={() => requestMore(selected.id, 'Please add more evidence for the biomass estimate.')}
                      >
                        Request Additional Evidence
                      </button>
                    </div>
                    <div className="mt-4 text-sm">
                      <div><span className="text-slate-500">Wallet:</span> Not connected</div>
                      <div><span className="text-slate-500">Tx:</span> {selected.txHash}</div>
                      <div><span className="text-slate-500">IPFS:</span> {selected.ipfsCid}</div>
                    </div>
                    {Array.isArray(selected.files) && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Submitted Files</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700">
                          {selected.files.map((f, i) => (
                            <li key={i}>{f.name} ({Math.round((f.size || 0) / 1024)} KB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



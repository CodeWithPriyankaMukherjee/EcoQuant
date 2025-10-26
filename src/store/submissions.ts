// src/store/submissions.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Submission {
  id: string
  projectId: string
  wallet: string
  ecosystemType: string
  biomass?: number
  soilCarbon?: number
  latitude: string
  longitude: string
  description?: string
  createdAt: string
  status: 'Pending' | 'Approved' | 'Needs Data'
  tokensAwarded?: number
  ipfsCid?: string
  files?: { name: string; size: number }[]
  approvalIpfsCid?: string
  txHash?: string
  reviewNote?: string
  revisions?: number
  area?: any
}

type Store = {
  pending: Submission[]
  approvals: Submission[]
  feedback: Submission[]
  add: (s: Submission) => void
  approve: (id: string, tokens: number, ipfsHash?: string, txHash?: string) => void
  requestMore: (id: string, note: string) => void
}

export const useSubmissionStore = create<Store>()(
  persist(
    (set, get) => ({
      pending: [],
      approvals: [],
      feedback: [],
      add: (s) => set((st) => ({ pending: [s, ...st.pending] })),
      approve: (id, tokensAwarded, ipfsCid, txHash) => {
  set((state) => {
    const submission = state.pending.find(s => s.id === id);
    if (!submission) return state;
    
    return {
      pending: state.pending.filter(s => s.id !== id),
      approvals: [
        ...state.approvals,
        {
          ...submission,
          status: 'Approved',
          tokensAwarded,
          ipfsCid, // This stores the actual CID
          txHash,
          approvedAt: new Date().toISOString(),
        }
      ]
    };
  });
},
      requestMore: (id, note) =>
        set((st) => {
          const sub = st.pending.find((p) => p.id === id)
          if (!sub) return st
          const needs: Submission = {
            ...sub,
            status: 'Needs Data',
            reviewNote: note,
            revisions: (sub.revisions ?? 0) + 1,
          }
          return {
            pending: st.pending.filter((p) => p.id !== id),
            feedback: [needs, ...st.feedback],
            approvals: st.approvals,
          }
        }),
    }),
    {
      name: 'bluevault-submissions',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)

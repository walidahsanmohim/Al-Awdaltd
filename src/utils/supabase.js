import { createClient } from '@supabase/supabase-js'
import { useState, useCallback, useEffect } from 'react'

const SUPABASE_URL = 'https://asnkoiknuueswlyzgonn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmtvaWtudXVlc3dseXpnb25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTYyOTQsImV4cCI6MjEwNzEzMjI5NH0.S8X45Kh5Uqkwd6B6ZbVn5JRIQ2antwU-4yYIh1pifwg'

// NOTE: table + columns are case-sensitive in this project:
// table `Reviews`, columns: id, created_at, Name, Rating, Comment, image_url, is_admin_proof.
// Admin proofs are flagged with the boolean `is_admin_proof = true` (there is NO `type` column).
export const REVIEWS_TABLE = 'Reviews'
export const REVIEW_COLS = { name: 'Name', rating: 'Rating', comment: 'Comment', imageUrl: 'image_url', isAdminProof: 'is_admin_proof' }
export const REVIEW_IMAGE_BUCKET = 'Reviews-image'
export const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

export const PROOF_TAGS = ['হোয়াটসঅ্যাপ রিভিউ', 'মেসেঞ্জার রিভিউ', 'অফিশিয়াল ডেলিভারি প্রুফ', 'ডেলিভারি প্রুফ', 'কাস্টমার ছবি']

// True when a row is an admin-uploaded proof (handles boolean or "true"/"1" strings).
export function isProofRow(r) {
  const v = r?.is_admin_proof ?? r?.isAdminProof
  return v === true || v === 'true' || v === 1 || v === '1'
}

// Map a Supabase row (capitalized columns) to the UI shape (lowercase).
export function mapReviewRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.Name ?? row.name ?? '',
    rating: Number(row.Rating ?? row.rating ?? 0),
    comment: row.Comment ?? row.comment ?? '',
    image_url: row.image_url ?? row.imageUrl ?? null,
    created_at: row.created_at ?? row.Created_at ?? null,
    is_admin_proof: isProofRow(row),
  }
}

// Only 4-star and up reviews are shown publicly (smart moderation for trust).
export function isPublicReview(r) {
  return Number(r?.rating || 0) >= 4
}

// Only published proofs (is_admin_proof + rating) are public.
export function isPublicProof(r) {
  return Number(r?.rating || 0) >= 4
}

// ---- Admin gallery proofs (is_admin_proof = true only) ----
// Reads admin-uploaded proofs from the existing Reviews table. Requires an RLS
// policy allowing public SELECT + INSERT on `Reviews` (see src/data/adminSetup.sql).
export function useProofRows() {
  const [proofs, setProofs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [configured, setConfigured] = useState(false)

  const fetchProofs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .select('id, Name, Rating, Comment, image_url, created_at, is_admin_proof')
        .eq('is_admin_proof', true)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) setError(error.message)
      const mapped = Array.isArray(data)
        ? data.map(mapReviewRow).filter((r) => r.image_url && isProofRow(r) && isPublicProof(r))
        : []
      setProofs(mapped)
      setError(null)
      setConfigured(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProofs()
    const channel = supabase
      .channel('proofs-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: REVIEWS_TABLE },
        (payload) => {
          const mapped = mapReviewRow(payload?.new)
          if (mapped && isProofRow(mapped) && mapped.image_url && isPublicProof(mapped)) {
            setProofs((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev].slice(0, 30)))
          }
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProofs])

  return { proofs, loading, error, configured, refresh: fetchProofs }
}

export async function uploadReviewImage(file) {
  if (!file) return null
  if (!file.type.startsWith('image/')) throw new Error('Only image files (JPG/PNG) are allowed.')
  if (file.size > MAX_REVIEW_IMAGE_BYTES) throw new Error('Image must be under 5 MB.')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(REVIEW_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    // Actionable messages for the common Supabase Storage failures.
    if (/row-level security|row level security|AccessDenied|Unauthorized|violates/i.test(error.message)) {
      throw new Error(
        'Storage upload blocked by RLS. Add an INSERT policy on storage.objects for bucket "Reviews-image" (see src/data/adminSetup.sql).',
      )
    }
    if (/Bucket not found|NoSuchBucket|not found/i.test(error.message)) {
      throw new Error('Bucket "Reviews-image" not found. Create it in Supabase Storage and make it public.')
    }
    throw new Error(`Image upload failed: ${error.message}`)
  }
  const { data } = supabase.storage.from(REVIEW_IMAGE_BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

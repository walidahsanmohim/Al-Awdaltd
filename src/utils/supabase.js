import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://asnkoiknuueswlyzgonn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbmtvaWtudXVlc3dseXpnb25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTYyOTQsImV4cCI6MjEwNzEzMjI5NH0.S8X45Kh5Uqkwd6B6ZbVn5JRIQ2antwU-4yYIh1pifwg'

// NOTE: table + columns are case-sensitive in this project:
// table `Reviews`, columns: id, created_at, Name, Rating, Comment.
export const REVIEWS_TABLE = 'Reviews'
export const REVIEW_COLS = { name: 'Name', rating: 'Rating', comment: 'Comment' }

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Map a Supabase row (capitalized cols) to the UI shape (lowercase).
export function mapReviewRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.Name ?? row.name ?? '',
    rating: Number(row.Rating ?? row.rating ?? 0),
    comment: row.Comment ?? row.comment ?? '',
    created_at: row.created_at ?? row.Created_at ?? null,
  }
}

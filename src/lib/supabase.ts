import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cnollcnzgamecikeoymj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNub2xsY256Z2FtZWNpa2VveW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1ODk3NzksImV4cCI6MjA1MTE2NTc3OX0.XBzhypt2ZGiYbQKL3HEFZyhTEhjj4c1iJf6uCAPQOEg"

export const supabase = createClient(supabaseUrl, supabaseKey)

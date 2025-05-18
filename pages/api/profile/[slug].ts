// pages/profile/[slug].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Geçersiz slug' })
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, public_slug, visible_cards')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()

  if (!profile || error) {
    return res.status(404).json({ error: 'Profil yok veya gizli' })
  }

  const userId = profile.id

  const [personalInfo, favorites, music, films] = await Promise.all([
    supabase.from('users').select('school, zodiac_sign').eq('id', userId).single(),
    Promise.all([
      supabase.from('popular_games').select('name').eq('user_id', userId),
      supabase.from('popular_apps').select('name').eq('user_id', userId),
    ]),
    supabase.from('favorite_songs').select('title').eq('user_id', userId),
    supabase.from('favorite_movies').select('title').eq('user_id', userId),
  ])

  const cards = {
    personal: {
      show_card: !!(personalInfo?.data?.school || personalInfo?.data?.zodiac_sign),
      data: {
        school: personalInfo.data?.school || null,
        zodiac: personalInfo.data?.zodiac_sign || null
      }
    },
    favorites: {
      show_card: (favorites[0].data?.length || 0) > 0 || (favorites[1].data?.length || 0) > 0,
      data: {
        games: favorites[0].data || [],
        apps: favorites[1].data || [],
      },
    },
    music: {
      show_card: (music.data?.length || 0) > 0,
      data: music.data || [],
    },
    films: {
      show_card: (films.data?.length || 0) > 0,
      data: films.data || [],
    }
  }

  res.status(200).json({
    user: {
      public_slug: profile.public_slug,
      visible_cards: profile.visible_cards || []
    },
    cards
  })
}
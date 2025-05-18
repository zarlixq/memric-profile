// pages/profile/[slug].tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const { slug } = router.query
  const [data, setData] = useState<any>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (slug) {
      fetch(`/api/profile/${slug}`)
        .then((res) => res.json())
        .then((json) => {
          setData(json)
          const initial: Record<string, boolean> = {}
          for (const key of Object.keys(json.cards)) {
            initial[key] = false
          }
          setExpanded(initial)
        })
    }
  }, [slug])

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>
  }

  const { user, cards } = data
  const isVisible = (key: string) => user.visible_cards.includes(key)

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const Card = ({
    icon,
    title,
    children,
    locked,
    id
  }: {
    icon: React.ReactNode
    title: string
    children?: React.ReactNode
    locked?: boolean
    id: string
  }) => (
    <div
      className={`w-full rounded-xl border shadow-md transition-all duration-300 ${
        expanded[id] ? 'py-4' : 'py-3'
      } ${
        locked ? 'bg-gray-100 opacity-60 pointer-events-auto' : 'bg-white'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 ${
          !locked ? 'cursor-pointer' : 'cursor-pointer'
        }`}
        onClick={() => {
          if (locked) {
            alert('Bu kartı görmek için giriş yapmalısınız.')
          } else {
            toggle(id)
          }
        }}
      >
        <div className="flex items-center gap-2 font-semibold text-gray-700 text-base">
          {icon}
          {title}
        </div>
        {!locked && (
          <span className="text-purple-600 font-bold text-xl select-none">
            {expanded[id] ? '−' : '+'}
          </span>
        )}
        {locked && <Lock className="text-gray-400 w-5 h-5" />}
      </div>

      {!locked && expanded[id] && (
        <motion.div
          className="px-4 pt-3 text-sm text-gray-700 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

      )}
    </div>
  )

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-purple-100 via-[#f8f4fc] to-purple-100 py-12 px-4">
      <div className="w-full max-w-sm bg-[#f8f4fc] rounded-xl p-4 flex flex-col items-center gap-6">
        {/* Kullanıcı adı */}
        <div className="bg-gray-200 text-base px-5 py-2 rounded-full font-bold text-black text-lg">
          @{user.public_slug}
        </div>

        {/* Kartlar */}
        <Card
          id="personal"
          icon={<span className="text-xl">🎓</span>}
          title="Kişisel Bilgiler"
          locked={!isVisible('personal') || !cards.personal.show_card}
        >
          <p><strong>Okul:</strong> {cards.personal.data?.school || '-'}</p>
          <p><strong>Burç:</strong> {cards.personal.data?.zodiac || '-'}</p>
        </Card>

        <Card
          id="favorites"
          icon={<span className="text-xl">💜</span>}
          title="Favoriler"
          locked={!isVisible('favorites') || !cards.favorites.show_card}
        >
          <p><strong>Oyunlar:</strong> {cards.favorites.data.games.map((g: any) => g.name).join(', ') || '-'}</p>
          <p><strong>Uygulamalar:</strong> {cards.favorites.data.apps.map((a: any) => a.name).join(', ') || '-'}</p>
        </Card>

        <Card
          id="music"
          icon={<span className="text-xl">🎵</span>}
          title="Müzik"
          locked={!isVisible('music') || !cards.music.show_card}
        />

        <Card
          id="films"
          icon={<span className="text-xl">🎬</span>}
          title="Film Sektörü"
          locked={!isVisible('films') || !cards.films.show_card}
        />
      </div>
    </div>
  )
}
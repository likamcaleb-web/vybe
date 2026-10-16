import { FormEvent, useEffect, useState } from 'react'
import './App.css'

type Post = {
  id: string
  name: string
  handle: string
  text: string
  time: string
}

type FeedTab = 'for-you' | 'following'
type Page = 'home' | 'profile'

type Profile = {
  name: string
  handle: string
  bio: string
}

const starterPosts: Post[] = [
  {
    id: 'seed-maya',
    name: 'Maya Chen',
    handle: '@mayamakes',
    text: 'New beginnings deserve a little celebration. What are you creating this week?',
    time: '12 min',
  },
  {
    id: 'seed-jordan',
    name: 'Jordan Lee',
    handle: '@jordanlee',
    text: 'Taking the scenic route today. Sometimes the best ideas show up when you slow down.',
    time: '38 min',
  },
  {
    id: 'seed-alex',
    name: 'Alex Rivera',
    handle: '@alexcreates',
    text: 'Making space for new ideas and good conversations. What has inspired you lately?',
    time: '1 hr',
  },
  {
    id: 'seed-sam',
    name: 'Sam Okafor',
    handle: '@samsees',
    text: 'A small reminder: you do not have to have it all figured out to take the next step.',
    time: '2 hr',
  },
]

const defaultProfile: Profile = {
  name: 'You',
  handle: '@you',
  bio: 'Finding my people and sharing a little good energy.',
}

function readSavedList(key: string): string[] {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function readSavedPosts(): Post[] {
  try {
    const saved = localStorage.getItem('vybe-posts')
    if (!saved) return starterPosts

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return starterPosts

    const savedPosts: Post[] = parsed.map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : `saved-${index}`,
      name: typeof item.name === 'string' ? item.name : 'VYBE member',
      handle: typeof item.handle === 'string' ? item.handle : '@member',
      text: typeof item.text === 'string' ? item.text : '',
      time: typeof item.time === 'string' ? item.time : 'recently',
    }))

    const savedIds = new Set(savedPosts.map((post) => post.id))
    const missingStarterPosts = starterPosts.filter((post) => !savedIds.has(post.id))

    return [...savedPosts, ...missingStarterPosts]
  } catch {
    return starterPosts
  }
}

function readSavedProfile(): Profile {
  try {
    const saved = localStorage.getItem('vybe-profile')
    if (!saved) return defaultProfile

    const parsed = JSON.parse(saved)
    return {
      name: typeof parsed.name === 'string' ? parsed.name : defaultProfile.name,
      handle: defaultProfile.handle,
      bio: typeof parsed.bio === 'string' ? parsed.bio : defaultProfile.bio,
    }
  } catch {
    return defaultProfile
  }
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [draft, setDraft] = useState('')
  const [posts, setPosts] = useState<Post[]>(readSavedPosts)
  const [likedPostIds, setLikedPostIds] = useState<string[]>(() =>
    readSavedList('vybe-likes'),
  )
  const [following, setFollowing] = useState<string[]>(() =>
    readSavedList('vybe-following'),
  )
  const [profile, setProfile] = useState<Profile>(readSavedProfile)
  const [profileDraft, setProfileDraft] = useState<Profile>(readSavedProfile)
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you')
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem('vybe-posts', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem('vybe-likes', JSON.stringify(likedPostIds))
  }, [likedPostIds])

  useEffect(() => {
    localStorage.setItem('vybe-following', JSON.stringify(following))
  }, [following])

  useEffect(() => {
    localStorage.setItem('vybe-profile', JSON.stringify(profile))
  }, [profile])

  function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = draft.trim()
    if (!text) return

    const newPost: Post = {
      id: `post-${Date.now()}`,
      name: profile.name,
      handle: profile.handle,
      text,
      time: 'just now',
    }

    setPosts((current) => [newPost, ...current])
    setDraft('')
    setActiveTab('for-you')
    setPage('home')
  }

  function toggleLike(postId: string) {
    setLikedPostIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    )
  }

  function toggleFollow(handle: string) {
    setFollowing((current) =>
      current.includes(handle)
        ? current.filter((person) => person !== handle)
        : [...current, handle],
    )
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const updatedProfile: Profile = {
      ...profileDraft,
      name: profileDraft.name.trim() || 'You',
      handle: profile.handle,
      bio: profileDraft.bio.trim(),
    }

    setProfile(updatedProfile)
    setProfileDraft(updatedProfile)
  }

  const visiblePosts = posts.filter((post) => {
    const matchesSearch =
      post.text.toLowerCase().includes(search.toLowerCase()) ||
      post.name.toLowerCase().includes(search.toLowerCase()) ||
      post.handle.toLowerCase().includes(search.toLowerCase())

    const matchesTab =
      activeTab === 'for-you' || following.includes(post.handle)

    return matchesSearch && matchesTab
  })

  const profilePosts = posts.filter((post) => post.handle === profile.handle)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="VYBE home">
          <span className="brand-mark">v</span>
          <span>VYBE</span>
        </a>

        <nav className="navigation" aria-label="Main navigation">
          <button
            className={`nav-link ${page === 'home' ? 'active' : ''}`}
            style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left' }}
            onClick={() => setPage('home')}
          >
            ⌂ <span>Home</span>
          </button>
          <a className="nav-link" href="#">⌕ <span>Explore</span></a>
          <a className="nav-link" href="#">♡ <span>Notifications</span></a>
          <button
            className={`nav-link ${page === 'profile' ? 'active' : ''}`}
            style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left' }}
            onClick={() => {
              setProfileDraft(profile)
              setPage('profile')
            }}
          >
            ♙ <span>Profile</span>
          </button>
        </nav>

        <button
          className="sidebar-post"
          onClick={() => {
            setPage('home')
            setTimeout(() => document.getElementById('post-draft')?.focus(), 0)
          }}
        >
          Create a post <span>＋</span>
        </button>

        <div className="sidebar-profile">
          <div className="avatar avatar-you">{profile.name.charAt(0).toUpperCase()}</div>
          <div><strong>{profile.name}</strong><span>{profile.handle}</span></div>
          <span className="more">•••</span>
        </div>
      </aside>

      {page === 'home' ? (
        <section className="feed">
          <header className="feed-header">
            <div>
              <p className="eyebrow">YOUR COMMUNITY</p>
              <h1>Home</h1>
            </div>
            <button className="icon-button" aria-label="More options">•••</button>
          </header>

          <div className="feed-tabs">
            <button
              className={`tab ${activeTab === 'for-you' ? 'active' : ''}`}
              onClick={() => setActiveTab('for-you')}
            >
              For you
            </button>
            <button
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
          </div>

          <form className="composer" onSubmit={publishPost}>
            <div className="avatar avatar-you">{profile.name.charAt(0).toUpperCase()}</div>
            <div className="composer-content">
              <textarea
                id="post-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What’s on your mind?"
                rows={3}
              />
              <div className="composer-footer">
                <span className="composer-hint">Share a little good energy.</span>
                <button className="post-button" type="submit" disabled={!draft.trim()}>
                  Post
                </button>
              </div>
            </div>
          </form>

          <div className="posts">
            {visiblePosts.length === 0 ? (
              <div className="post">
                <div className="post-body">
                  <strong>
                    {activeTab === 'following'
                      ? 'Your Following feed is quiet'
                      : 'No matching posts'}
                  </strong>
                  <p>
                    {activeTab === 'following'
                      ? 'Follow someone from People to know to see their posts here.'
                      : 'Try another search.'}
                  </p>
                </div>
              </div>
            ) : (
              visiblePosts.map((post, index) => {
                const isLiked = likedPostIds.includes(post.id)
                const authorName =
                  post.handle === profile.handle ? profile.name : post.name

                return (
                  <article className="post" key={post.id}>
                    <div className={`avatar ${index % 2 === 0 ? 'avatar-pink' : 'avatar-blue'}`}>
                      {authorName.charAt(0)}
                    </div>
                    <div className="post-body">
                      <div className="post-author">
                        <strong>{authorName}</strong>
                        <span>{post.handle} · {post.time}</span>
                        <button className="more" aria-label="Post options">•••</button>
                      </div>
                      <p>{post.text}</p>
                      <div className="post-actions">
                        <button aria-label="Reply">♡ <span>Reply</span></button>
                        <button
                          aria-label={isLiked ? 'Unlike' : 'Like'}
                          aria-pressed={isLiked}
                          onClick={() => toggleLike(post.id)}
                        >
                          {isLiked ? '♥' : '♡'}
                          <span>{isLiked ? 'Liked' : 'Like'}</span>
                        </button>
                        <button aria-label="Share">↗ <span>Share</span></button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      ) : (
        <section className="feed">
          <header className="feed-header">
            <div>
              <p className="eyebrow">YOUR VYBE</p>
              <h1>Profile</h1>
            </div>
            <button className="icon-button" onClick={() => setPage('home')}>
              Home
            </button>
          </header>

          <div style={{ padding: '22px 25px' }}>
            <section className="welcome-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div
                  className="avatar avatar-you"
                  style={{ width: 64, height: 64, flexBasis: 64, fontSize: 24 }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px' }}>{profile.name}</h2>
                  <p style={{ margin: 0 }}>{profile.handle}</p>
                </div>
              </div>
              <p style={{ marginTop: 16 }}>
                {profile.bio || 'Add a short bio to tell people about yourself.'}
              </p>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {profilePosts.length} posts · {following.length} following
              </p>
            </section>

            <form
              className="composer"
              onSubmit={saveProfile}
              style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 0 }}
            >
              <div className="composer-content">
                <h2 style={{ fontSize: 16, margin: '4px 0 16px' }}>Edit profile</h2>

                <label htmlFor="profile-name">Display name</label>
                <input
                  id="profile-name"
                  type="text"
                  maxLength={40}
                  value={profileDraft.name}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    margin: '7px 0 16px',
                    padding: 11,
                    border: '1px solid #e7e5ef',
                    borderRadius: 10,
                    font: 'inherit',
                  }}
                />

                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  maxLength={160}
                  rows={3}
                  value={profileDraft.bio}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, bio: event.target.value }))
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    margin: '7px 0 12px',
                    padding: 11,
                    border: '1px solid #e7e5ef',
                    borderRadius: 10,
                    font: 'inherit',
                  }}
                />

                <div className="composer-footer">
                  <span className="composer-hint">{profileDraft.bio.length}/160</span>
                  <button className="post-button" type="submit">Save profile</button>
                </div>
              </div>
            </form>

            <h2 style={{ fontSize: 16, marginTop: 10 }}>Your posts</h2>
            {profilePosts.length === 0 ? (
              <p className="footer-note">Your posts will appear here.</p>
            ) : (
              profilePosts.map((post) => (
                <article className="post" key={post.id} style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <div className="avatar avatar-you">{profile.name.charAt(0).toUpperCase()}</div>
                  <div className="post-body">
                    <div className="post-author">
                      <strong>{profile.name}</strong>
                      <span>{profile.handle} · {post.time}</span>
                    </div>
                    <p>{post.text}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      <aside className="right-panel">
        <label className="search-box">
          ⌕
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage('home')
            }}
            placeholder="Search VYBE"
            aria-label="Search posts"
            style={{
              border: 0,
              outline: 0,
              background: 'transparent',
              width: '100%',
              color: 'inherit',
              font: 'inherit',
            }}
          />
        </label>

        <section className="welcome-card">
          <p className="eyebrow">A PLACE TO CONNECT</p>
          <h2>Good to have you here.</h2>
          <p>Find your people, share what inspires you, and make this space your own.</p>
          <div className="welcome-orbit">v</div>
        </section>

        <section className="suggestions">
          <h2>People to know</h2>

          <div className="suggestion">
            <div className="avatar avatar-gold">A</div>
            <div><strong>Alex Rivera</strong><span>@alexcreates</span></div>
            <button onClick={() => toggleFollow('@alexcreates')}>
              {following.includes('@alexcreates') ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="suggestion">
            <div className="avatar avatar-green">S</div>
            <div><strong>Sam Okafor</strong><span>@samsees</span></div>
            <button onClick={() => toggleFollow('@samsees')}>
              {following.includes('@samsees') ? 'Following' : 'Follow'}
            </button>
          </div>
        </section>

        <section className="suggestions">
          <h2>Coming later</h2>
          <p>Real accounts and profiles</p>
          <p>Photo posts and comments</p>
          <p>Direct messages</p>
          <p>Cloud sync across devices</p>
        </section>

        <p className="footer-note">A little more connection, a little more VYBE.</p>
      </aside>
    </main>
  )
}

export default App
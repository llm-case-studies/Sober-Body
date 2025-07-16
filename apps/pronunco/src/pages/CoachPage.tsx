import { useEffect, useState } from 'react'
import { useParams, Navigate, useLocation } from 'react-router-dom'
import { PronunciationCoachUI } from 'coach-ui'
import { useDeck, useDecks } from '../../../sober-body/src/features/games/deck-context'
import { useIsMobile } from 'ui'
import CoachMobile from '../components/CoachMobile'

type TabType = 'drill' | 'vocabulary' | 'grammar' | 'overview';

export default function CoachPage() {
  const { deckId = '' } = useParams<{ deckId: string }>()
  const { decks, setActiveDeck } = useDecks()
  const deck = useDeck(deckId)
  const [activeTab, setActiveTab] = useState<TabType>('drill')
  const location = useLocation()
  const isMobile = useIsMobile()
  
  // Force mobile view if on /m/ route
  const forceMobile = location.pathname.startsWith('/m/')
  const useMobileView = isMobile || forceMobile

  useEffect(() => {
    if (deck) setActiveDeck(deck.id)
  }, [deck, setActiveDeck])

  if (decks.length > 0 && !deck) {
    const redirectTo = forceMobile ? "/m/decks" : "/decks";
    return <Navigate to={redirectTo} replace />;
  }

  // Extended deck interface to handle additional fields from wizard
  const extendedDeck = deck as any; // Will contain grammarBrief, vocabulary, complexityLevel if present

  const renderTabContent = () => {
    switch (activeTab) {
      case 'drill':
        return useMobileView ? <CoachMobile /> : <PronunciationCoachUI />
      
      case 'vocabulary':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">📚 Vocabulary</h2>
            {extendedDeck?.vocabulary?.length > 0 ? (
              <div className="grid gap-4">
                {extendedDeck.vocabulary.map((item: any, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800">{item.word}</h3>
                        <p className="text-gray-600 mt-1">{item.definition}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              const utterance = new SpeechSynthesisUtterance(item.word);
                              utterance.lang = deck?.lang || 'en-US';
                              speechSynthesis.speak(utterance);
                            }
                          }}
                        >
                          🔊 Play
                        </button>
                        <button 
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                          onClick={() => {
                            // TODO: Add translation functionality
                            alert(`Translation for "${item.word}" - feature coming soon!`);
                          }}
                        >
                          🌐 Translate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-500">No vocabulary available for this deck.</p>
                <p className="text-sm text-gray-400 mt-2">Vocabulary is available for AI-generated drills.</p>
              </div>
            )}
          </div>
        )
      
      case 'grammar':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">📝 Grammar</h2>
            {extendedDeck?.grammarBrief ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                    {extendedDeck.grammarBrief}
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(extendedDeck.grammarBrief);
                        utterance.lang = deck?.lang || 'en-US';
                        utterance.rate = 0.8; // Slower for grammar explanation
                        speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    🔊 Read Aloud
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => {
                      alert('Translation feature coming soon!');
                    }}
                  >
                    🌐 Translate
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500">No grammar explanation available for this deck.</p>
                <p className="text-sm text-gray-400 mt-2">Grammar explanations are available for AI-generated drills.</p>
              </div>
            )}
          </div>
        )
      
      case 'overview':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">📊 Deck Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title:</span>
                    <p className="text-gray-800">{deck?.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Language:</span>
                    <p className="text-gray-800">{deck?.lang}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phrases:</span>
                    <p className="text-gray-800">{deck?.lines?.length || 0} phrases</p>
                  </div>
                  {extendedDeck?.complexityLevel && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                      <p className="text-gray-800">{extendedDeck.complexityLevel}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Content Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Vocabulary words:</span>
                    <p className="text-gray-800">{extendedDeck?.vocabulary?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Grammar explanation:</span>
                    <p className="text-gray-800">{extendedDeck?.grammarBrief ? 'Available' : 'Not available'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tags:</span>
                    <p className="text-gray-800">{deck?.tags?.length || 0} tags</p>
                  </div>
                  {deck?.updated && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Last updated:</span>
                      <p className="text-gray-800">{new Date(deck.updated).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return <PronunciationCoachUI />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'drill', label: '🎯 Drill', description: 'Practice pronunciation' },
              { id: 'vocabulary', label: '📚 Vocabulary', description: 'Word definitions' },
              { id: 'grammar', label: '📝 Grammar', description: 'Language rules' },
              { id: 'overview', label: '📊 Overview', description: 'Deck information' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <div className="text-center">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  )
}

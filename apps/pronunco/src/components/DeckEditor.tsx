import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useDecks } from '../../../sober-body/src/features/games/deck-context';
import { saveDecks } from '../../../sober-body/src/features/games/deck-storage';
import { toast } from '../toast';
import type { Deck } from '../../../sober-body/src/features/games/deck-types';

interface DeckEditorProps {
  open: boolean;
  onClose: () => void;
  deckId: string | null;
}

interface ExtendedDeck extends Deck {
  grammarBrief?: string;
  vocabulary?: { word: string; definition: string }[];
  complexityLevel?: string;
}

export default function DeckEditor({ open, deckId, onClose }: DeckEditorProps) {
  const { decks } = useDecks();
  const folders = useLiveQuery(() => db().folders?.toArray() ?? [], [], []) || [];
  
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('en-US');
  const [lines, setLines] = useState<string[]>([]);
  const [grammarBrief, setGrammarBrief] = useState('');
  const [vocabulary, setVocabulary] = useState<{ word: string; definition: string }[]>([]);
  const [complexityLevel, setComplexityLevel] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const currentDeck = deckId ? decks.find(d => d.id === deckId) as ExtendedDeck : null;

  useEffect(() => {
    if (open && currentDeck) {
      setTitle(currentDeck.title || '');
      setLang(currentDeck.lang || 'en-US');
      setLines(currentDeck.lines || []);
      setGrammarBrief(currentDeck.grammarBrief || '');
      setVocabulary(currentDeck.vocabulary || []);
      setComplexityLevel(currentDeck.complexityLevel || '');
      
      // Extract folder ID from tags
      const folderTag = currentDeck.tags?.find(tag => tag.startsWith('folder:'));
      setSelectedFolderId(folderTag ? folderTag.replace('folder:', '') : null);
      
      // Extract custom tags (non-folder tags)
      const userTags = currentDeck.tags?.filter(tag => !tag.startsWith('folder:')) || [];
      setCustomTags(userTags);
    } else if (open && !currentDeck) {
      // Reset for new deck
      setTitle('');
      setLang('en-US');
      setLines([]);
      setGrammarBrief('');
      setVocabulary([]);
      setComplexityLevel('');
      setSelectedFolderId(null);
      setCustomTags([]);
    }
  }, [open, currentDeck]);

  const addVocabularyItem = () => {
    setVocabulary([...vocabulary, { word: '', definition: '' }]);
  };

  const updateVocabularyItem = (index: number, field: 'word' | 'definition', value: string) => {
    const updated = [...vocabulary];
    updated[index][field] = value;
    setVocabulary(updated);
  };

  const removeVocabularyItem = (index: number) => {
    setVocabulary(vocabulary.filter((_, i) => i !== index));
  };

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        toast.error('Please enter a deck title');
        return;
      }

      if (lines.length === 0 || lines.every(line => !line.trim())) {
        toast.error('Please add at least one phrase');
        return;
      }

      // Build tags array
      const tags = [...customTags];
      if (selectedFolderId) {
        tags.push(`folder:${selectedFolderId}`);
      }

      const deckData: ExtendedDeck = {
        id: deckId || crypto.randomUUID(),
        title: title.trim(),
        lang,
        lines: lines.filter(line => line.trim()),
        tags,
        grammarBrief: grammarBrief.trim() || undefined,
        vocabulary: vocabulary.filter(item => item.word.trim() && item.definition.trim()),
        complexityLevel: complexityLevel.trim() || undefined,
        updated: Date.now()
      };

      // Update the decks array
      const updatedDecks = deckId 
        ? decks.map(d => d.id === deckId ? deckData : d)
        : [...decks, deckData];

      await saveDecks(updatedDecks);
      
      toast.success(deckId ? 'Deck updated successfully!' : 'Deck created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save deck:', error);
      toast.error('Failed to save deck. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {deckId ? 'Edit Deck' : 'Create New Deck'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Airport Vocabulary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                  <option value="pt-BR">Portuguese (Brazil)</option>
                  <option value="it-IT">Italian (Italy)</option>
                  <option value="he-IL">Hebrew (Israel)</option>
                  <option value="ru-RU">Russian (Russia)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Drill Content */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Drill Content</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phrases (one per line) *
              </label>
              <textarea
                value={lines.join('\n')}
                onChange={(e) => setLines(e.target.value.split('\n'))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                placeholder="How much does this cost?&#10;Where is the bathroom?&#10;I would like to order..."
              />
            </div>
          </section>

          {/* Grammar Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Grammar Explanation</h3>
            <textarea
              value={grammarBrief}
              onChange={(e) => setGrammarBrief(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
              placeholder="Brief explanation of grammar patterns used in this drill..."
            />
          </section>

          {/* Vocabulary Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vocabulary</h3>
              <button
                onClick={addVocabularyItem}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                + Add Word
              </button>
            </div>
            <div className="space-y-3">
              {vocabulary.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={item.word}
                    onChange={(e) => updateVocabularyItem(index, 'word', e.target.value)}
                    placeholder="Word"
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    value={item.definition}
                    onChange={(e) => updateVocabularyItem(index, 'definition', e.target.value)}
                    placeholder="Definition"
                    className="flex-2 border border-gray-300 rounded px-3 py-2"
                  />
                  <button
                    onClick={() => removeVocabularyItem(index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    🗑
                  </button>
                </div>
              ))}
              {vocabulary.length === 0 && (
                <p className="text-gray-500 text-sm italic">No vocabulary items added yet.</p>
              )}
            </div>
          </section>

          {/* Organization */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Organization</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder
                </label>
                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">📂 No folder (root level)</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.type === 'auto' ? '🤖' : '📁'} {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={complexityLevel}
                  onChange={(e) => setComplexityLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Not specified</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </section>

          {/* Custom Tags */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Custom Tags</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="Add a custom tag (e.g., travel, business, beginner)"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                  onClick={addCustomTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {customTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeCustomTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {deckId ? 'Update Deck' : 'Create Deck'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}